import { ElectContract } from "./../../models/ElectContract";
import { GasContract } from "./../../models/GasContract";
import { Result } from "./../../models/Result";
import { ExpensesBill } from "./../../models/ExpensesBill";

let pool = require("./../../middleware/database");

export const getHistory = async (): Promise<ExpensesBill[]> => {
  try {
    const sqlRes: any[] = await pool.query(`SELECT * FROM expenses_bill`);
    return parseRAWData(sqlRes, true);
  } catch (error) {
    throw new Error(error);
  }
};

export const getHistoryByGroup = async (
  group: string
): Promise<ExpensesBill[]> => {
  try {
    const sqlRes: any[] = await pool.query(
      `SELECT * FROM expenses_bill WHERE groupKey = "${group}" `
    );
    return parseRAWData(sqlRes, true);
  } catch (error) {
    throw new Error(error);
  }
};

export const getBillById = async (id: number): Promise<ExpensesBill> => {
  try {
    const sqlRes: any[] = await pool.query(
      `SELECT * FROM expenses_bill WHERE id = "${id}" LIMIT 1`
    );
    return parseRAWData(sqlRes, false);
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteBillById = async (id: number): Promise<boolean> => {
  try {
    const sqlRes: any = await pool.query(
      `DELETE FROM expenses_bill WHERE expenses_bill.id = ${id}`
    );
    if (sqlRes.affectedRows == 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error);
  }
};

export const getGroups = async () => {
  try {
    return await pool.query(`SELECT DISTINCT groupKey FROM expenses_bill`);
  } catch (error) {
    throw new Error(error);
  }
};

export const calculateBill = async (
  body: ExpensesBill,
  id?: number
): Promise<ExpensesBill> => {
  const bill: ExpensesBill = body;
  if (bill.taxes == undefined) {
    // VAT default
    bill.taxes = 21;
  }
  if (id != undefined) {
    bill.id = id;
  }
  const totalElect = await calElectExpense(bill.electData);
  const totalGas = await calGasExpense(bill.gasData);
  const total = totalElect + totalGas;

  bill.result = {
    totalElect: totalElect,
    totalElectVAT: await calculateVAT(totalElect, bill.taxes),
    totalGas: totalGas,
    totalGasVAT: await calculateVAT(totalGas, bill.taxes),
    total: total,
    totalVAT: await calculateVAT(total, bill.taxes)
  };

  let finalId: number;
  if (id != undefined) {
    finalId = await updateBill(bill);
  } else {
    if (bill.groupKey == undefined || bill.groupKey == "") {
      return bill;
    } else {
      finalId = await setExpensesBill(bill);
    }
  }
  return await getBillById(finalId);
};

const setExpensesBill = async (bill: ExpensesBill): Promise<number> => {
  let sqlID: number = 0;
  try {
    const sqlRes = await pool.query(`INSERT INTO expenses_bill 
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
  } catch (error) {
    if (error.errno == 1062) {
      //1062  ER_DUP_ENTRY
      let dupl = await getDuplicateBill(bill);
      if (dupl.id == undefined) {
        return (sqlID = -1);
      } else {
        return (sqlID = dupl.id);
      }
    } else {
      throw new Error(error);
    }
  }
};

const updateBill = async (bill: ExpensesBill): Promise<number> => {
  try {
    const sqlRes = await pool.query(`UPDATE expenses_bill SET 
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
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getDuplicateBill = async (
  duplicate: ExpensesBill
): Promise<ExpensesBill> => {
  try {
    const sqlRes: any[] = await pool.query(`SELECT * FROM expenses_bill WHERE groupKey LIKE "${
      duplicate.groupKey
    }" 
                    AND totalElectVAT LIKE ${duplicate.result.totalElectVAT.toFixed(
                      4
                    )}  AND totalGasVAT 
                    LIKE ${duplicate.result.totalGasVAT.toFixed(4)} LIMIT 1`);
    return parseRAWData(sqlRes, false);
  } catch (error) {
    throw new Error(error);
  }
};

const calElectExpense = async (contract: ElectContract): Promise<number> => {
  return (
    contract.consumed * contract.consumedPrice +
    contract.power * contract.days * contract.powerPrice
  );
};

const calGasExpense = async (contract: GasContract): Promise<number> => {
  return (
    contract.consumed * contract.consumedPrice +
    contract.days * contract.fixedPrice
  );
};

const calculateVAT = async (total: number, VAT: number): Promise<number> => {
  return total + total * (VAT / 100);
};

const parseRAWData = async (
  rawData: any[],
  returnAsArray: boolean
): Promise<any> => {
  let parsedResult: ExpensesBill[] = rawData.map(record => {
    return <ExpensesBill>{
      id: record.id,
      groupKey: record.groupKey,
      timeStamp: record.timeStamp,
      taxes: record.taxes,
      electData: <ElectContract>{
        power: record.elect_power,
        days: record.elect_days,
        consumed: record.elect_consumed,
        powerPrice: record.elect_powerPrice,
        consumedPrice: record.elect_consumedPrice
      },
      gasData: <GasContract>{
        days: record.gas_days,
        consumed: record.gas_consumed,
        fixedPrice: record.gas_fixedPrice,
        consumedPrice: record.gas_consumedPrice
      },
      result: <Result>{
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
  } else {
    return parsedResult[0];
  }
};
