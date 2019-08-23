import { Request, Response } from "express";
import { getHistory,
         getBillById,
         getHistoryByGroup,
         calculateBill } from "./ElectGasBillController";

export default [
  {
    path: "/ExpensesBill/",
    method: "get",
    handler: [
      async (_req: Request, res: Response) => {
        const result = await getHistory();
        res.status(200).send(result);
      }
    ]
  },
  {
    path: "/ExpensesBill/",
    method: "post",
    handler: [
        async (req: Request, res: Response) => {
            const result = await calculateBill(req.body);
            res.status(200).send(result);
        }
    ]
  },
  {
    path: `/ExpensesBill/:id`,
    method: "get",
    handler: [
      async ( { params }: Request, res: Response) => {
        const result = await getBillById(params.id);
        res.status(200).send(result);
      }
    ]
  },
  {
    path: `/ExpensesBill/groups/:group`,
    method: "get",
    handler: [
      async ( { params }: Request, res: Response) => {
        const result = await getHistoryByGroup(params.group);
        res.status(200).send(result);
      }
    ]
  }
];