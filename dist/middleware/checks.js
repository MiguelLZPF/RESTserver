"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSearchParams = exports.checkGroupParams = exports.checkIdParams = void 0;
const httpErrors_1 = require("../utils/httpErrors");
const checkIdParams = ({ params }, res, next) => {
    if (!params.id) {
        throw new httpErrors_1.HTTP400Error("Missing ID in Request");
    }
    else {
        next();
    }
};
exports.checkIdParams = checkIdParams;
const checkGroupParams = ({ params }, res, next) => {
    if (!params.group) {
        throw new httpErrors_1.HTTP400Error("Missing Group in Request");
    }
    else {
        next();
    }
};
exports.checkGroupParams = checkGroupParams;
/* Search example */
const checkSearchParams = (req, res, next) => {
    if (!req.query.q) {
        throw new httpErrors_1.HTTP400Error("Missing q parameter");
    }
    else {
        next();
    }
};
exports.checkSearchParams = checkSearchParams;
//# sourceMappingURL=checks.js.map