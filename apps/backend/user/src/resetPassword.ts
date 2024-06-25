import axios from "axios";
import { Request, Response } from "express";

const resetPassword = async (req: Request, res: Response) => {
  const email = req.body.email;
  const emailBody = `
    <p>Please click the link below to reset your password<p>
    <a href="http://localhost/resetpassword">Reset Password</a>
  `;
  const emailSubject = "MartletPlace - Reset your password";

  try {
    await axios.post("http://localhost/api/email", {
      to: email,
      body: emailBody,
      subject: emailSubject,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Email could not be sent. Please try again" });
  }
};

export { resetPassword };
