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
Object.defineProperty(exports, "__esModule", { value: true });
const ElectGasBillController_1 = require("./ElectGasBillController");
const checks_1 = require("../../middleware/checks");
const httpErrors_1 = require("../../utils/httpErrors");
exports.default = [
    {
        path: "/expenses_bills",
        method: "get",
        handler: [
            (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getHistory();
                res.status(200).send(result);
            })
        ]
    },
    {
        path: "/expenses_bills",
        method: "post",
        handler: [
            (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.calculateBill(req.body);
                res.status(200).send(result);
            })
        ]
    },
    {
        path: `/expenses_bills/groups`,
        method: "get",
        handler: [
            (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getGroups();
                res.status(200).send(result);
            })
        ]
    },
    {
        path: `/expenses_bills/groups/:group`,
        method: "get",
        handler: [
            checks_1.checkGroupParams,
            ({ params }, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getHistoryByGroup(params.group);
                if (result == undefined || result.length < 1) {
                    // Group does not exist
                    throw new httpErrors_1.HTTP400Error("There is no records for the requested Group.");
                }
                else {
                    res.status(200).send(result);
                }
            })
        ]
    },
    {
        path: `/expenses_bills/:id`,
        method: "get",
        handler: [
            checks_1.checkIdParams,
            ({ params }, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getBillById(+params.id);
                if (result == undefined) { // ID does not exist
                    throw new httpErrors_1.HTTP400Error("There is no record for the requested ID.");
                }
                else {
                    res.status(200).send(result);
                }
            })
        ]
    },
    {
        path: `/expenses_bills/:id`,
        method: "put",
        handler: [
            checks_1.checkIdParams,
            (req, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.calculateBill(req.body, +req.params.id);
                if (result == undefined) { // ID does not exist
                    throw new httpErrors_1.HTTP400Error("There is no record to update for the requested ID.");
                }
                else {
                    res.status(200).send(result);
                }
            })
        ]
    },
    {
        // ERROR URL handler
        path: `/expenses_bills`,
        method: "put",
        handler: [
            () => __awaiter(void 0, void 0, void 0, function* () {
                throw new httpErrors_1.HTTP400Error("Missing ID in PUT Request");
            })
        ]
    },
    {
        path: `/expenses_bills/:id`,
        method: "delete",
        handler: [
            checks_1.checkIdParams,
            ({ params }, res) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.deleteBillById(+params.id);
                if (result == undefined || result == false) { // ID does not exist
                    throw new httpErrors_1.HTTP400Error("There is no record to delete for the requested ID.");
                }
                else {
                    res.status(200).send(result);
                }
            })
        ]
    },
    {
        // ERROR URL handler
        path: `/expenses_bills`,
        method: "delete",
        handler: [
            () => __awaiter(void 0, void 0, void 0, function* () {
                throw new httpErrors_1.HTTP400Error(`Missing ID in DELETE Request, DELETE ALL not impletented`);
            })
        ]
    }
];
//# sourceMappingURL=routes.js.map