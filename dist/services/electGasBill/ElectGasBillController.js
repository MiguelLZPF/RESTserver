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
exports.calculateBill = exports.getGroups = exports.deleteBillById = exports.getBillById = exports.getHistoryByGroup = exports.getHistory = void 0;
let pool = require("./../../middleware/database");
const getHistory = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill`);
        return parseRAWData(sqlRes, true);
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.getHistory = getHistory;
const getHistoryByGroup = (group) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill WHERE groupKey = "${group}" `);
        return parseRAWData(sqlRes, true);
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.getHistoryByGroup = getHistoryByGroup;
const getBillById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill WHERE id = "${id}" LIMIT 1`);
        return parseRAWData(sqlRes, false);
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.getBillById = getBillById;
const deleteBillById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`DELETE FROM expenses_bill WHERE expenses_bill.id = ${id}`);
        if (sqlRes.affectedRows == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.deleteBillById = deleteBillById;
const getGroups = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield pool.query(`SELECT DISTINCT groupKey FROM expenses_bill`);
    }
    catch (error) {
        throw new Error(error);
    }
});
exports.getGroups = getGroups;
const calculateBill = (body, id) => __awaiter(void 0, void 0, void 0, function* () {
    const bill = body;
    if (bill.taxes == undefined) {
        // VAT default
        bill.taxes = 21;
    }
    if (id != undefined) {
        bill.id = id;
    }
    const totalElect = yield calElectExpense(bill.electData);
    const totalGas = yield calGasExpense(bill.gasData);
    const total = totalElect + totalGas;
    bill.result = {
        totalElect: totalElect,
        totalElectVAT: yield calculateVAT(totalElect, bill.taxes),
        totalGas: totalGas,
        totalGasVAT: yield calculateVAT(totalGas, bill.taxes),
        total: total,
        totalVAT: yield calculateVAT(total, bill.taxes)
    };
    let finalId;
    if (id != undefined) {
        finalId = yield updateBill(bill);
    }
    else {
        if (bill.groupKey == undefined || bill.groupKey == "") {
            return bill;
        }
        else {
            finalId = yield setExpensesBill(bill);
        }
    }
    return yield exports.getBillById(finalId);
});
exports.calculateBill = calculateBill;
const setExpensesBill = (bill) => __awaiter(void 0, void 0, void 0, function* () {
    let sqlID = 0;
    try {
        const sqlRes = yield pool.query(`INSERT INTO expenses_bill 
            (groupKey, taxes, elect_power, elect_days, elect_consumed, elect_powerPrice,
            elect_consumedPrice, gas_days, gas_consumed, gas_fixedPrice, gas_consumedPrice,
            totalElect, totalElectVAT, totalGas, totalGasVAT, total, totalVAT) VALUES 
            ("${bill.groupKey}", ${bill.taxes}, ${bill.electData.power}, ${bill.electData.days},
            ${bill.electData.consumed}, ${bill.electData.powerPrice},${bill.electData.consumedPrice},
            ${bill.gasData.days}, ${bill.gasData.consumed}, ${bill.gasData.fixedPrice},
            ${bill.gasData.consumedPrice}, ${bill.result.totalElect}, ${bill.result.totalElectVAT},
            ${bill.result.totalGas}, ${bill.result.totalGasVAT}, ${bill.result.total},
            ${bill.result.totalVAT})`);
        return sqlRes.insertId;
    }
    catch (error) {
        if (error.errno == 1062) {
            //1062  ER_DUP_ENTRY
            let dupl = yield getDuplicateBill(bill);
            if (dupl.id == undefined) {
                return (sqlID = -1);
            }
            else {
                return (sqlID = dupl.id);
            }
        }
        else {
            throw new Error(error);
        }
    }
});
const updateBill = (bill) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`UPDATE expenses_bill SET 
                                      groupKey = '${bill.groupKey}',
                                      taxes = ${bill.taxes},
                                      elect_power = ${bill.electData.power},
                                      elect_days = ${bill.electData.days},
                                      elect_consumed = ${bill.electData.consumed},
                                      elect_powerPrice = ${bill.electData.powerPrice},
                                      elect_consumedPrice = ${bill.electData.consumedPrice},
                                      gas_days = ${bill.gasData.days},
                                      gas_consumed = ${bill.gasData.consumed},
                                      gas_fixedPrice = ${bill.gasData.fixedPrice},
                                      gas_consumedPrice = ${bill.gasData.consumedPrice},
                                      totalElect = ${bill.result.totalElect},
                                      totalElectVAT = ${bill.result.totalElectVAT},
                                      totalGas = ${bill.result.totalGas},
                                      totalGasVAT = ${bill.result.totalGasVAT},
                                      total = ${bill.result.total},
                                      totalVAT = ${bill.result.totalVAT} 
                                      WHERE id = ${bill.id}`);
        if (sqlRes.changedRows >= 1) {
            return bill.id;
        }
        else {
            return 0;
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
const getDuplicateBill = (duplicate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill WHERE groupKey LIKE "${duplicate.groupKey}" 
                    AND totalElectVAT LIKE ${duplicate.result.totalElectVAT.toFixed(4)}  AND totalGasVAT 
                    LIKE ${duplicate.result.totalGasVAT.toFixed(4)} LIMIT 1`);
        return parseRAWData(sqlRes, false);
    }
    catch (error) {
        throw new Error(error);
    }
});
const calElectExpense = (contract) => __awaiter(void 0, void 0, void 0, function* () {
    return (contract.consumed * contract.consumedPrice +
        contract.power * contract.days * contract.powerPrice);
});
const calGasExpense = (contract) => __awaiter(void 0, void 0, void 0, function* () {
    return (contract.consumed * contract.consumedPrice +
        contract.days * contract.fixedPrice);
});
const calculateVAT = (total, VAT) => __awaiter(void 0, void 0, void 0, function* () {
    return total + total * (VAT / 100);
});
const parseRAWData = (rawData, returnAsArray) => __awaiter(void 0, void 0, void 0, function* () {
    let parsedResult = rawData.map(record => {
        return {
            id: record.id,
            groupKey: record.groupKey,
            timeStamp: record.timeStamp,
            taxes: record.taxes,
            electData: {
                power: record.elect_power,
                days: record.elect_days,
                consumed: record.elect_consumed,
                powerPrice: record.elect_powerPrice,
                consumedPrice: record.elect_consumedPrice
            },
            gasData: {
                days: record.gas_days,
                consumed: record.gas_consumed,
                fixedPrice: record.gas_fixedPrice,
                consumedPrice: record.gas_consumedPrice
            },
            result: {
                totalElect: record.totalElect,
                totalElectVAT: record.totalElectVAT,
                totalGas: record.totalGas,
                totalGasVAT: record.totalGasVAT,
                total: record.total,
                totalVAT: record.totalVAT
            }
        };
    });
    if (returnAsArray) {
        return parsedResult;
    }
    else {
        return parsedResult[0];
    }
});
//# sourceMappingURL=ElectGasBillController.js.map