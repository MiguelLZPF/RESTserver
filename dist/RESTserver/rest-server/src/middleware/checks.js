"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpErrors_1 = require("../utils/httpErrors");
exports.checkIdParams = ({ params }, res, next) => {
    if (!params.id) {
        throw new httpErrors_1.HTTP400Error("Missing ID in Request");
    }
    else {
        next();
    }
};
exports.checkGroupParams = ({ params }, res, next) => {
    if (!params.group) {
        throw new httpErrors_1.HTTP400Error("Missing Group in Request");
    }
    else {
        next();
    }
};
/* Search example */
exports.checkSearchParams = (req, res, next) => {
    if (!req.query.q) {
        throw new httpErrors_1.HTTP400Error("Missing q parameter");
    }
    else {
        next();
    }
};
//# sourceMappingURL=checks.js.map