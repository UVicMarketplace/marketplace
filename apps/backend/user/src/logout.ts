import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

const logout = async (req: Request, res: Response, db: IDatabase<object>) => {
  return res
    .clearCookie("authorization")
    .status(200)
    .json({ message: "Logged out" });
};

export { logout };
