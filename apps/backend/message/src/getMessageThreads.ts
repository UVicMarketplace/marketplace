import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

export const getMessageThreads = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  try {
    // const { user_id } = req.body;
    const user_id = "5";

    const threads = await db.query(
      `WITH thread_ids AS (
        SELECT DISTINCT
          (CAST(messages.listing_id AS text) || 
           CAST(LEAST(messages.sender_id, messages.receiver_id) AS text) || 
           CAST(GREATEST(messages.sender_id, messages.receiver_id) AS text)) as thread_id,
          messages.listing_id,
          LEAST(messages.sender_id, messages.receiver_id) as min_user_id,
          GREATEST(messages.sender_id, messages.receiver_id) as max_user_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      ),
      last_messages AS (
        SELECT DISTINCT ON (
          CAST(messages.listing_id AS text) || 
          CAST(LEAST(messages.sender_id, messages.receiver_id) AS text) || 
          CAST(GREATEST(messages.sender_id, messages.receiver_id) AS text)
        )
          messages.listing_id,
          messages.sender_id,
          messages.receiver_id,
          messages.message_body,
          messages.created_at,
          (CAST(messages.listing_id AS text) || 
           CAST(LEAST(messages.sender_id, messages.receiver_id) AS text) || 
           CAST(GREATEST(messages.sender_id, messages.receiver_id) AS text)) as thread_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY thread_id, messages.created_at DESC
      )
      SELECT 
        ti.listing_id,
        json_build_object(
          'user_id', u.user_id,
          'name', u.name,
          'profile_pic_url', u.profile_pic_url
        ) as other_participant,
        json_build_object(
          'sender_id', lm.sender_id,
          'receiver_id', lm.receiver_id,
          'listing_id', lm.listing_id,
          'content', lm.message_body,
          'created_at', lm.created_at
        ) as last_message
      FROM thread_ids ti
      JOIN last_messages lm ON lm.thread_id = ti.thread_id
      JOIN users u ON u.user_id = (CASE WHEN lm.sender_id != $1 THEN lm.sender_id ELSE lm.receiver_id END)
      WHERE (lm.sender_id = $1 OR lm.receiver_id = $1)
      GROUP BY ti.listing_id, u.user_id, u.name, u.profile_pic_url, lm.sender_id, lm.receiver_id, lm.listing_id, lm.message_body, lm.created_at
      `,
      [user_id],
    );

    res.json(threads);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while getting message threads" });
  }
};
