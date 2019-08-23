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
let pool = require('./../../middleware/database');
exports.getHistory = () => __awaiter(this, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill`);
        return parseRAWData(sqlRes, true);
    }
    catch (error) {
        throw new Error(error);
    }
    ;
});
exports.getHistoryByGroup = (group) => __awaiter(this, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill WHERE groupKey = "${group}" `);
        return parseRAWData(sqlRes, true);
    }
    catch (error) {
        throw new Error(error);
    }
    ;
});
exports.getBillById = (id) => __awaiter(this, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill WHERE id = "${id}" LIMIT 1`);
        return parseRAWData(sqlRes, false);
    }
    catch (error) {
        throw new Error(error);
    }
    ;
});
const getDuplicateBill = (duplicate) => __awaiter(this, void 0, void 0, function* () {
    try {
        const sqlRes = yield pool.query(`SELECT * FROM expenses_bill WHERE groupKey LIKE "${duplicate.groupKey}" 
                    AND totalElect LIKE ${duplicate.result.totalElect}  AND totalGas 
                    LIKE ${duplicate.result.totalGas} LIMIT 1`);
        return parseRAWData(sqlRes, false);
    }
    catch (error) {
        throw new Error(error);
    }
    ;
});
const setExpensesBill = (bill) => __awaiter(this, void 0, void 0, function* () {
    let sqlID = 0;
    try {
        const sqlRes = yield pool.query(`INSERT INTO expenses_bill 
            (groupKey, elect_power, elect_days, elect_consumed, elect_powerPrice,
            elect_consumedPrice, gas_days, gas_consumed, gas_fixedPrice, gas_consumedPrice,
            totalElect, totalElectIVA, totalGas, totalGasIVA, total, totalIVA) VALUES 
            ("${bill.groupKey}", '${bill.electData.power}', '${bill.electData.days}',
            '${bill.electData.consumed}', '${bill.electData.powerPrice}','${bill.electData.consumedPrice}',
            '${bill.gasData.days}', '${bill.gasData.consumed}', '${bill.gasData.fixedPrice}',
            '${bill.gasData.consumedPrice}', '${bill.result.totalElect}', '${bill.result.totalElectIVA}',
            '${bill.result.totalGas}', '${bill.result.totalGasIVA}', '${bill.result.total}',
            '${bill.result.totalIVA}')`);
        return sqlRes.insertId;
    }
    catch (error) {
        if (error.errno == 1062) { //1062  ER_DUP_ENTRY
            let dupl = yield getDuplicateBill(bill);
            console.log();
            if (dupl.id == undefined) {
                return sqlID = -1;
            }
            else {
                return sqlID = dupl.id;
            }
        }
        else {
            throw new Error(error);
        }
    }
    ;
});
exports.calculateBill = (body) => __awaiter(this, void 0, void 0, function* () {
    const bill = body;
    const totalElect = yield calElectExpense(bill.electData);
    const totalGas = yield calGasExpense(bill.gasData);
    const total = totalElect + totalGas;
    bill.result = {
        totalElect: totalElect,
        totalElectIVA: yield calculateIVA(totalElect, 21),
        totalGas: totalGas,
        totalGasIVA: yield calculateIVA(totalGas, 21),
        total: total,
        totalIVA: yield calculateIVA(total, 21)
    };
    const idCreated = yield setExpensesBill(bill);
    return yield exports.getBillById(idCreated);
});
const calElectExpense = (contract) => __awaiter(this, void 0, void 0, function* () {
    return contract.consumed * contract.consumedPrice + contract.power * contract.days * contract.powerPrice;
});
const calGasExpense = (contract) => __awaiter(this, void 0, void 0, function* () {
    return contract.consumed * contract.consumedPrice + contract.days * contract.fixedPrice;
});
const calculateIVA = (total, iva) => __awaiter(this, void 0, void 0, function* () {
    return total + total * (iva / 100);
});
const parseRAWData = (rawData, returnAsArray) => __awaiter(this, void 0, void 0, function* () {
    let parsedResult = rawData.map((record, index) => {
        return ({
            id: record.id,
            electData: ({
                power: record.elect_power,
                days: record.elect_days,
                consumed: record.elect_consumed,
                powerPrice: record.elect_powerPrice,
                consumedPrice: record.elect_consumedPrice
            }),
            gasData: ({
                days: record.gas_days,
                consumed: record.gas_consumed,
                fixedPrice: record.gas_fixedPrice,
                consumedPrice: record.gas_consumedPrice
            }),
            result: ({
                totalElect: record.totalElect,
                totalElectIVA: record.totalElectIVA,
                totalGas: record.totalGas,
                totalGasIVA: record.totalGas,
                total: record.total,
                totalIVA: record.totalIVA
            }),
            groupKey: record.groupKey,
            timeStamp: record.timeStamp
        });
    });
    /*rawData.forEach( (record) => {
        const electData = new ElectContract(
            record.elect_power, record.elect_days, record.elect_consumed,
            record.elect_powerPrice, record.elect_consumedPrice);
        const gasData = new GasContract(
            record.gas_days, record.gas_consumed,
            record.gas_fixedPrice, record.gas_consumedPrice);
        const result = new Result(
            record.totalElect, record.totalElectIVA, record.totalGas,
            record.totalGasIVA, record.total, record.totalIVA);
        parsedResult.push(new ExpensesBill(
            record.id, electData, gasData, result, record.groupKey,
            record.timeStamp));
    });*/
    if (parsedResult.length < 2) {
        return parsedResult[0];
    }
    else {
        return parsedResult;
    }
});
//# sourceMappingURL=ElectGasBillController.js.map