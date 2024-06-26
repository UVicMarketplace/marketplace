import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

// PATCH /api/listing/:id - Update an existing listing
const updateListing = async (
  req: AuthenticatedRequest,
  res: Response,
  db: IDatabase<object>,
) => {
  const { id } = req.params;
  const { listing, status } = req.body;

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
    const updatedListing = await db.oneOrNone(
      `UPDATE listings
       SET title = $1,
           description = $2,
           price = $3,
           location = $4,
           image_urls = $5,
           status = $6
       WHERE listing_id = $7
       RETURNING *`,
      [
        title,
        description,
        price,
        formattedLocation,
        images.map((image: { url: string }) => image.url),
        status,
        id,
      ],
    );

    if (!updatedListing) {
      console.error("listing not found");
      return res.status(404).json({ error: "Listing not found" });
    }

    const responseListing = {
      listingID: updatedListing.listing_id,
      title: updatedListing.title,
      description: updatedListing.description,
      price: updatedListing.price,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      status: updatedListing.status,
      dateCreated: updatedListing.created_at,
      dateModified: updatedListing.modified_at,
      images: updatedListing.image_urls.map((url: string) => ({ url })),
    };

    return res.status(200).json(responseListing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { updateListing };
