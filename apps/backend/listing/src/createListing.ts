import { Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

// POST /api/listing - Create a new listing
const createListing = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const userID = req.user.userId;
  const { listing } = req.body;

  if (!listing) {
    console.error("request body empty");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  const { title, description, price, location, images } = listing;

  if (
    !title ||
    !description ||
    !price ||
    !location ||
    !images ||
    !location.latitude ||
    !location.longitude
  ) {
    console.error("missing parameter in request");
    return res.status(400).json({ error: "missing parameter in request" });
  }

  const formattedLocation = `(${location.latitude},${location.longitude})`;

  try {
    const createdListing = await db.one(
      `INSERT INTO listings (title, description, price, location, image_urls, status, created_at, modified_at, seller_id)
       VALUES ($1, $2, $3, $4, $5, 'AVAILABLE', NOW(), NOW(), $6)
       RETURNING *`,
      [
        title,
        description,
        price,
        formattedLocation,
        images.map((image: { url: string }) => image.url),
        userID,
      ],
    );

    const sellerProfile = await db.one(
      `SELECT user_id AS "userID", username, name, bio, profile_pic_url AS "profilePictureUrl"
       FROM users
       WHERE user_id = $1`,
      [userID],
    );

    const responseListing = {
      listingID: createdListing.listing_id,
      seller_profile: sellerProfile,
      title: createdListing.title,
      description: createdListing.description,
      price: createdListing.price,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      status: createdListing.status,
      dateCreated: createdListing.created_at,
      dateModified: createdListing.modified_at,
      reviews: [],
      images: createdListing.image_urls.map((url: string) => ({ url })),
    };

    return res.status(201).json({ listing: responseListing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { createListing };
