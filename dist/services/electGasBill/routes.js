"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ElectGasBillController_1 = require("./ElectGasBillController");
exports.default = [
    {
        path: "/ExpensesBill/",
        method: "get",
        handler: [
            (_req, res) => __awaiter(this, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getHistory();
                res.status(200).send(result);
            })
        ]
    },
    {
        path: "/ExpensesBill/",
        method: "post",
        handler: [
            (req, res) => __awaiter(this, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.calculateBill(req.body);
                res.status(200).send(result);
            })
        ]
    },
    {
        path: `/ExpensesBill/:id`,
        method: "get",
        handler: [
            ({ params }, res) => __awaiter(this, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getBillById(params.id);
                res.status(200).send(result);
            })
        ]
    },
    {
        path: `/ExpensesBill/groups/:group`,
        method: "get",
        handler: [
            ({ params }, res) => __awaiter(this, void 0, void 0, function* () {
                const result = yield ElectGasBillController_1.getHistoryByGroup(params.group);
                res.status(200).send(result);
            })
        ]
    }
];
//# sourceMappingURL=routes.js.map