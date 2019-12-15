"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const middleware_1 = __importDefault(require("./middleware"));
const errorHandlers_1 = __importDefault(require("./middleware/errorHandlers"));
const services_1 = __importDefault(require("./services"));
/* Error handling Block */
process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});
/*****/
const router = express_1.default();
utils_1.applyMiddleware(middleware_1.default, router);
utils_1.applyRoutes(services_1.default, router);
utils_1.applyMiddleware(errorHandlers_1.default, router);
const { PORT = 3000 } = process.env;
const server = https_1.default.createServer(router);
server.listen(PORT, () => console.log(`Server is running https://localhost:${PORT}...`));
//# sourceMappingURL=server.js.map