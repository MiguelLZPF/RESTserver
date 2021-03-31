"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler = __importStar(require("../utils/errorHandler"));
const handle404Error = (router) => {
    router.use((req, res) => {
        ErrorHandler.notFoundError();
    });
};
const handleClientError = (router) => {
    router.use((err, req, res, next) => {
        ErrorHandler.clientError(err, res, next);
    });
};
const handleServerError = (router) => {
    router.use((err, req, res, next) => {
        ErrorHandler.serverError(err, res, next);
    });
};
exports.default = [handle404Error, handleClientError, handleServerError];
//# sourceMappingURL=errorHandlers.js.map