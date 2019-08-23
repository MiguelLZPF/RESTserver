import { ElectContract } from "./../../Models/ElectContract";
import { GasContract } from "./../../Models/GasContract";
import { Result } from "./../../Models/Result";
import { ExpensesBill } from "./../../Models/ExpensesBill";

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

const getDuplicateBill = async (
  duplicate: ExpensesBill
): Promise<ExpensesBill> => {
  try {
    const sqlRes: any[] = await pool.query(`SELECT * FROM expenses_bill WHERE groupKey LIKE "${duplicate.groupKey}" 
                    AND totalElect LIKE ${duplicate.result.totalElect}  AND totalGas 
                    LIKE ${duplicate.result.totalGas} LIMIT 1`);
    return parseRAWData(sqlRes, false);
  } catch (error) {
    throw new Error(error);
  }
};

const setExpensesBill = async (bill: ExpensesBill): Promise<number> => {
  let sqlID: number = 0;
  try {
    const sqlRes = await pool.query(`INSERT INTO expenses_bill 
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
  } catch (error) {
    if (error.errno == 1062) {
      //1062  ER_DUP_ENTRY
      let dupl: ExpensesBill = await getDuplicateBill(bill);
      console.log();
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

export const calculateBill = async (
  body: ExpensesBill
): Promise<ExpensesBill> => {
  const bill: ExpensesBill = body;

  const totalElect = await calElectExpense(bill.electData);
  const totalGas = await calGasExpense(bill.gasData);
  const total = totalElect + totalGas;

  bill.result = {
    totalElect: totalElect,
    totalElectIVA: await calculateIVA(totalElect, 21),
    totalGas: totalGas,
    totalGasIVA: await calculateIVA(totalGas, 21),
    total: total,
    totalIVA: await calculateIVA(total, 21)
  };

  const idCreated = await setExpensesBill(bill);

  return await getBillById(idCreated);
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

const calculateIVA = async (total: number, iva: number): Promise<number> => {
  return total + total * (iva / 100);
};

const parseRAWData = async (
  rawData: any[],
  returnAsArray: boolean
): Promise<any> => {
  let parsedResult: ExpensesBill[] = rawData.map((record, index) => {
    return <ExpensesBill>{
      id: record.id,
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
        totalElectIVA: record.totalElectIVA,
        totalGas: record.totalGas,
        totalGasIVA: record.totalGas,
        total: record.total,
        totalIVA: record.totalIVA
      },
      groupKey: record.groupKey,
      timeStamp: record.timeStamp
    };
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
  } else {
    return parsedResult;
  }
};
