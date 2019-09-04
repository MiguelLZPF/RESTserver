import { Request, Response } from "express";
import {
  getHistory,
  getBillById,
  deleteBillById,
  getHistoryByGroup,
  calculateBill,
  getGroups
} from "./ElectGasBillController";
import { checkIdParams, checkGroupParams } from "../../middleware/checks";
import { HTTP400Error } from "../../utils/httpErrors";

export default [
  {
    path: "/expenses_bills",
    method: "get",
    handler: [
      async (_req: Request, res: Response) => {
        const result = await getHistory();
        res.status(200).send(result);
      }
    ]
  },
  {
    path: "/expenses_bills",
    method: "post",
    handler: [
      async (req: Request, res: Response) => {
        const result = await calculateBill(req.body);
        res.status(200).send(result);
      }
    ]
  },
  {
    path: `/expenses_bills/groups`,
    method: "get",
    handler: [
      async (req: Request, res: Response) => {
        const result = await getGroups();
        res.status(200).send(result);
      }
    ]
  },
  {
    path: `/expenses_bills/groups/:group`,
    method: "get",
    handler: [
      checkGroupParams,
      async ({ params }: Request, res: Response) => {
        const result = await getHistoryByGroup(params.group);
        if (result == undefined || result.length < 1) {
          // Group does not exist
          throw new HTTP400Error("There is no records for the requested Group.");
        } else {
          res.status(200).send(result);
        }
      }
    ]
  },
  {
    path: `/expenses_bills/:id`,
    method: "get",
    handler: [
      checkIdParams,
      async ({ params }: Request, res: Response) => {
        const result = await getBillById(params.id);
        if (result == undefined) { // ID does not exist
          throw new HTTP400Error("There is no record for the requested ID.");
        } else {
          res.status(200).send(result);
        }
      }
    ]
  },
  {
    path: `/expenses_bills/:id`,
    method: "put",
    handler: [
      checkIdParams,
      async (req: Request, res: Response) => {
        const result = await calculateBill(req.body, req.params.id);
        if (result == undefined) { // ID does not exist
          throw new HTTP400Error("There is no record to update for the requested ID.");
        } else {
          res.status(200).send(result);
        }
      }
    ]
  },
  {
    // ERROR URL handler
    path: `/expenses_bills`,
    method: "put",
    handler: [
      async () => {
        throw new HTTP400Error("Missing ID in PUT Request");
      }
    ]
  },
  {
    path: `/expenses_bills/:id`,
    method: "delete",
    handler: [
      checkIdParams,
      async ({ params }: Request, res: Response) => {
        const result = await deleteBillById(params.id);
        if (result == undefined || result == false) { // ID does not exist
          throw new HTTP400Error("There is no record to delete for the requested ID.");
        } else {
          res.status(200).send(result);
        }
      }
    ]
  },
  {
    // ERROR URL handler
    path: `/expenses_bills`,
    method: "delete",
    handler: [
      async () => {
        throw new HTTP400Error(
          `Missing ID in DELETE Request, DELETE ALL not impletented`
        );
      }
    ]
  }
  
];
