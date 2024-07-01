import { Request, Response } from "express";
import { IDatabase } from "pg-promise";
import { User } from "./models/user";

const getUser = async (req: Request, res: Response, db: IDatabase<object>) => {
  const { id } = req.params;

  const query = `
        SELECT * FROM users WHERE user_id = $1
      `;

  try {
    await db.oneOrNone(query, [id]).then((data: User) => {
      if (!data) {
        return res.status(404).json({ error: "User not found" });
      }

      const returnObject = {
        name: data.name,
        username: data.username,
        email: data.email,
        bio: data.bio,
        profileUrl: data.profile_pic_url,
      };

      return res.status(200).send(returnObject);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { getUser };
