"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP404Error = exports.HTTP400Error = exports.HTTPClientError = void 0;
class HTTPClientError extends Error {
    constructor(message) {
        if (message instanceof Object) {
            super(JSON.stringify(message));
        }
        else {
            super(message);
        }
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HTTPClientError = HTTPClientError;
class HTTP400Error extends HTTPClientError {
    constructor(message = "Bad Request") {
        super(message);
        this.statusCode = 400;
    }
}
exports.HTTP400Error = HTTP400Error;
class HTTP404Error extends HTTPClientError {
    constructor(message = "Not found") {
        super(message);
        this.statusCode = 404;
    }
}
exports.HTTP404Error = HTTP404Error;
//# sourceMappingURL=httpErrors.js.map