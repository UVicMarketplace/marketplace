import { Request, Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";

export const useValidateGetMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { listing_id, receiver_id } = req.params;
  if (!listing_id || !receiver_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  next();
};

export const getMessages = async (
  req: Request,
  res: Response,
  db: IDatabase<object>
) => {
  try {
    const { listing_id, receiver_id } = req.params;
    const { user_id, num_items, offset } = req.body;
    // PAGINATION STUFF:
    // const { num_items, offset } = req.body;

    const messages = await db.query(
      "SELECT * FROM messages WHERE listing_id = $1 AND receiver_id = $2 AND sender_id = $3 LIMIT $4 OFFSET $5",
      [listing_id, receiver_id, user_id, num_items, offset]
    );

    console.log("Success, got messages: ", messages);
    console.log(" ^ ", { listing_id, receiver_id, user_id, num_items, offset });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while getting messages" });
  }
};
