import { Request, Response, NextFunction } from "express";
import { IDatabase } from "pg-promise";

export const useValidateGetMessageThreads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next();
};

export const getMessageThreads = async (
  req: Request,
  res: Response,
  db: IDatabase<object>
) => {
  try {
    const { user_id } = req.body;
    const threads = await db.query(
      `SELECT listing_id, 
    json_build_object(
      'user_id', users.user_id,
      'name', users.name,
      'profile_pic_url', users.profile_pic_url
    ) as other_participant,
    json_build_object(
      'sender_id', messages.sender_id,
      'receiver_id', messages.receiver_id,
      'listing_id', messages.listing_id,
      'content', messages.message_body,
      'created_at', messages.created_at
    ) as last_message
    FROM messages
    JOIN users ON users.user_id = messages.receiver_id
    WHERE messages.sender_id = $1
    GROUP BY messages.listing_id, users.user_id, users.name, users.profile_pic_url, messages.sender_id, messages.receiver_id, messages.listing_id, messages.message_body, messages.created_at
    ORDER BY messages.created_at DESC`,
      [user_id]
    );

    res.json(threads);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while getting message threads" });
  }
};
