import { Request, Response } from "express";
import { IDatabase } from "pg-promise";

// GET /api/reviews/:id - Get a review's details
const getReview = async (
  req: Request,
  res: Response,
  db: IDatabase<object>,
) => {
  const { id } = req.params;

  if (!id) {
    console.error("missing review id parameter in request");
    return res.status(400).json({ error: "Review ID is required" });
  }

  try {
    const reviewQuery = `
      SELECT 
        r.review_id AS "review_id",
        ru.username AS "reviewerName",
        r.rating_value AS "stars",
        r.review AS "comment",
        r.user_id AS "userID",
        r.listing_id AS "listingID",
        r.created_at AS "dateCreated",
        r.modified_at AS "dateModified"
      FROM 
        reviews r
      JOIN 
        users ru ON r.user_id = ru.user_id
      WHERE 
        r.review_id = $1
    `;

    const review = await db.oneOrNone(reviewQuery, [id]);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getReview };
