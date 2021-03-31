"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesBill = void 0;
class ExpensesBill {
    constructor(id, electData, gasData, result, taxes, groupKey, timeStamp) {
        this.id = id;
        this.electData = electData;
        this.gasData = gasData;
        this.result = result;
        this.taxes = taxes;
        this.groupKey = groupKey;
        this.timeStamp = timeStamp;
    }
}
exports.ExpensesBill = ExpensesBill;
//# sourceMappingURL=ExpensesBill.js.map