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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
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
const readFile = util.promisify(fs.readFile);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const { PORT = 3000 } = process.env;
    const [key, cert] = yield Promise.all([
        readFile('../key.pem'),
        readFile('../certificate.pem')
    ]);
    const router = express_1.default();
    utils_1.applyMiddleware(middleware_1.default, router);
    utils_1.applyRoutes(services_1.default, router);
    utils_1.applyMiddleware(errorHandlers_1.default, router);
    const server = https_1.default.createServer({ key, cert }, router);
    server.listen(PORT, () => console.log(`Server is running https://localhost:${PORT}...`));
});
startServer();
/* Before HTTPS
const router = express();

const { PORT = 3000 } = process.env;
const server = https.createServer(router);

server.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}...`)
); */ 
//# sourceMappingURL=server.js.map