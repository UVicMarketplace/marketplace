import { Request, Response } from "express";
import { db } from ".";

export const useValidateCreateMessage = (
  req: Request,
  res: Response,
  next: Function
) => {
  if (!req.body.content || !req.body.listing_id || !req.body.receiver_id) {
    console.log("missing required fields", req.body);
    return res.status(400).json({
      error: "Missing required fields",
      body: req.body,
    });
  }

  if (req.body.user_id === req.params.receiver_id) {
    return res
      .status(400)
      .json({ error: "Sender and receiver cannot be the same" });
  }

  next();
};

export const createMessage = async (req: Request, res: Response) => {
  const { user_id: sender_id, content, listing_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id || !listing_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.query(
      "INSERT INTO messages (sender_id, receiver_id, listing_id, message_body) VALUES ($1, $2, $3) RETURNING *",
      [sender_id, receiver_id, listing_id, content]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the message" });
  }
};
