import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

export const useValidateGetMessageThreads = async (
  req: Request,
  res: Response,
  next: Function,
) => {
  next();
};

export const getMessageThreads = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    const { user_id } = req.body;
    const threads = await db.query(
      `SELECT listing_id, 
    json_build_object(
      'user_id', receiver_id,
      'name', name,
      'profilePicture', profile_picture
    ) as other_participant,
    json_build_object(
      'sender_id', sender_id,
      'receiver_id', receiver_id,
      'listing_id', listing_id,
      'content', message_body,
      'sent_at', sent_at
    ) as last_message
    FROM messages
    JOIN users ON users.user_id = messages.receiver_id
    WHERE sender_id = $1
    GROUP BY listing_id, receiver_id, name, profile_picture, sender_id, receiver_id, listing_id, message_body, sent_at
    ORDER BY sent_at DESC`,
      [user_id],
    );

    res.json(threads.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while getting message threads" });
  }
};
