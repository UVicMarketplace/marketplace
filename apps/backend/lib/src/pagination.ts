import { Request, Response, NextFunction } from "express";

// Pagination middleware. Just ensures that the two pagination parameters are on
// the request body so you don't need to error check for them in every route.
export const usePagination = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const num_items = parseInt(req.query.num_items as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;
  req.body.num_items = num_items;
  req.body.offset = offset;
  next();
};
