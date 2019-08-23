import { ElectContract } from "./ElectContract";
import { GasContract } from "./GasContract";
import { Result } from "./Result";

export class ExpensesBill {
  constructor(
    public id: number,
    public electData: ElectContract,
    public gasData: GasContract,
    public result: Result,
    public groupKey?: string,
    public timeStamp?: string
  ) {}
}
