import { Request, Response, NextFunction } from "express";
import { HTTP400Error } from "../utils/httpErrors";


export const checkIdParams = (
  { params }: Request,
  res: Response,
  next: NextFunction
) => {
  if (!params.id) {
    throw new HTTP400Error("Missing ID in Request");
  } else {
    next();
  }
};

export const checkGroupParams = (
  { params }: Request,
  res: Response,
  next: NextFunction
) => {
  if (!params.group) {
    throw new HTTP400Error("Missing Group in Request");
  } else {
    next();
  }
};

/* Search example */
export const checkSearchParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.q) {
    throw new HTTP400Error("Missing q parameter");
  } else {
    next();
  }
};