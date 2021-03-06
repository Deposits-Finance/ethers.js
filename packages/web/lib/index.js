"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var base64_1 = require("@ethersproject/base64");
var properties_1 = require("@ethersproject/properties");
var strings_1 = require("@ethersproject/strings");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var geturl_1 = require("./geturl");
function fetchJson(connection, json, processFunc) {
    var headers = {};
    var url = null;
    // @TODO: Allow ConnectionInfo to override some of these values
    var options = {
        method: "GET",
    };
    var allow304 = false;
    var timeout = 2 * 60 * 1000;
    if (typeof (connection) === "string") {
        url = connection;
    }
    else if (typeof (connection) === "object") {
        if (connection == null || connection.url == null) {
            logger.throwArgumentError("missing URL", "connection.url", connection);
        }
        url = connection.url;
        if (typeof (connection.timeout) === "number" && connection.timeout > 0) {
            timeout = connection.timeout;
        }
        if (connection.headers) {
            for (var key in connection.headers) {
                headers[key.toLowerCase()] = { key: key, value: String(connection.headers[key]) };
                if (["if-none-match", "if-modified-since"].indexOf(key.toLowerCase()) >= 0) {
                    allow304 = true;
                }
            }
        }
        if (connection.user != null && connection.password != null) {
            if (url.substring(0, 6) !== "https:" && connection.allowInsecureAuthentication !== true) {
                logger.throwError("basic authentication requires a secure https url", logger_1.Logger.errors.INVALID_ARGUMENT, { argument: "url", url: url, user: connection.user, password: "[REDACTED]" });
            }
            var authorization = connection.user + ":" + connection.password;
            headers["authorization"] = {
                key: "Authorization",
                value: "Basic " + base64_1.encode(strings_1.toUtf8Bytes(authorization))
            };
        }
    }
    if (json) {
        options.method = "POST";
        options.body = json;
        headers["content-type"] = { key: "Content-Type", value: "application/json" };
    }
    var flatHeaders = {};
    Object.keys(headers).forEach(function (key) {
        var header = headers[key];
        flatHeaders[header.key] = header.value;
    });
    options.headers = flatHeaders;
    var runningTimeout = (function () {
        var timer = null;
        var promise = new Promise(function (resolve, reject) {
            if (timeout) {
                timer = setTimeout(function () {
                    if (timer == null) {
                        return;
                    }
                    timer = null;
                    reject(logger.makeError("timeout", logger_1.Logger.errors.TIMEOUT, {
                        requestBody: (options.body || null),
                        requestMethod: options.method,
                        timeout: timeout,
                        url: url
                    }));
                }, timeout);
            }
        });
        var cancel = function () {
            if (timer == null) {
                return;
            }
            clearTimeout(timer);
            timer = null;
        };
        return { promise: promise, cancel: cancel };
    })();
    var runningFetch = (function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1, body, json, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        response = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, geturl_1.getUrl(url, options)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        response = error_1.response;
                        if (response == null) {
                            runningTimeout.cancel();
                            logger.throwError("missing response", logger_1.Logger.errors.SERVER_ERROR, {
                                requestBody: (options.body || null),
                                requestMethod: options.method,
                                serverError: error_1,
                                url: url
                            });
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        body = response.body;
                        if (allow304 && response.statusCode === 304) {
                            body = null;
                        }
                        else if (response.statusCode < 200 || response.statusCode >= 300) {
                            runningTimeout.cancel();
                            logger.throwError("bad response", logger_1.Logger.errors.SERVER_ERROR, {
                                status: response.statusCode,
                                headers: response.headers,
                                body: body,
                                requestBody: (options.body || null),
                                requestMethod: options.method,
                                url: url
                            });
                        }
                        runningTimeout.cancel();
                        json = null;
                        if (body != null) {
                            try {
                                json = JSON.parse(body);
                            }
                            catch (error) {
                                logger.throwError("invalid JSON", logger_1.Logger.errors.SERVER_ERROR, {
                                    body: body,
                                    error: error,
                                    requestBody: (options.body || null),
                                    requestMethod: options.method,
                                    url: url
                                });
                            }
                        }
                        if (!processFunc) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, processFunc(json, response)];
                    case 6:
                        json = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        logger.throwError("processing response error", logger_1.Logger.errors.SERVER_ERROR, {
                            body: json,
                            error: error_2,
                            requestBody: (options.body || null),
                            requestMethod: options.method,
                            url: url
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/, json];
                }
            });
        });
    })();
    return Promise.race([runningTimeout.promise, runningFetch]);
}
exports.fetchJson = fetchJson;
function poll(func, options) {
    if (!options) {
        options = {};
    }
    options = properties_1.shallowCopy(options);
    if (options.floor == null) {
        options.floor = 0;
    }
    if (options.ceiling == null) {
        options.ceiling = 10000;
    }
    if (options.interval == null) {
        options.interval = 250;
    }
    return new Promise(function (resolve, reject) {
        var timer = null;
        var done = false;
        // Returns true if cancel was successful. Unsuccessful cancel means we're already done.
        var cancel = function () {
            if (done) {
                return false;
            }
            done = true;
            if (timer) {
                clearTimeout(timer);
            }
            return true;
        };
        if (options.timeout) {
            timer = setTimeout(function () {
                if (cancel()) {
                    reject(new Error("timeout"));
                }
            }, options.timeout);
        }
        var retryLimit = options.retryLimit;
        var attempt = 0;
        function check() {
            return func().then(function (result) {
                // If we have a result, or are allowed null then we're done
                if (result !== undefined) {
                    if (cancel()) {
                        resolve(result);
                    }
                }
                else if (options.oncePoll) {
                    options.oncePoll.once("poll", check);
                }
                else if (options.onceBlock) {
                    options.onceBlock.once("block", check);
                    // Otherwise, exponential back-off (up to 10s) our next request
                }
                else if (!done) {
                    attempt++;
                    if (attempt > retryLimit) {
                        if (cancel()) {
                            reject(new Error("retry limit reached"));
                        }
                        return;
                    }
                    var timeout = options.interval * parseInt(String(Math.random() * Math.pow(2, attempt)));
                    if (timeout < options.floor) {
                        timeout = options.floor;
                    }
                    if (timeout > options.ceiling) {
                        timeout = options.ceiling;
                    }
                    setTimeout(check, timeout);
                }
                return null;
            }, function (error) {
                if (cancel()) {
                    reject(error);
                }
            });
        }
        check();
    });
}
exports.poll = poll;
