import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

export const useValidateCreateMessage = (
  req: Request,
  res: Response,
  next: Function,
) => {
  const { user_id: sender_id, content, listing_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id || !listing_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (sender_id === receiver_id) {
    return res
      .status(400)
      .json({ error: "Sender and receiver cannot be the same" });
  }

  next();
};

export const createMessage = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const { user_id: sender_id, content, listing_id, receiver_id } = req.body;

    const result = await db.query(
      "INSERT INTO messages (sender_id, receiver_id, listing_id, message_body) VALUES ($1, $2, $3) RETURNING *",
      [sender_id, receiver_id, listing_id, content],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the message" });
  }
};
