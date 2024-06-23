import { Request, Response, NextFunction } from 'express';
// Pagination middleware
export const usePagination = (req: Request, res: Response, next: NextFunction) => {
  const num_items = parseInt(req.query.num_items as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;
  req.pagination = { num_items, offset };
  next();
}