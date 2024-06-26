import { Request, Response } from "express";
export const useAuth = async (req: Request, res: Response, next: Function) => {
  //TODO: parse from jwt cookie
  const user_id = 2;
  if (!user_id) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  req.body.user_id = user_id;
  next();
};
