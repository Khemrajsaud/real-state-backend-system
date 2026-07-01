
import { Request, Response } from "express";
import { generateToken } from "../utils/jwt";
import { AdminLoginRequestBody } from "../types/auth";

// FIXED STATIC ADMIN LOGIN (No database needed)
export const adminLogin = async (
  req: Request<{}, {}, AdminLoginRequestBody>,
  res: Response,
): Promise<void> => {
  const { username, password } = req.body;


  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  try {
    const correctUsername = process.env.ADMIN_USERNAME;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (username !== correctUsername || password !== correctPassword) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    // 4. Generate the JWT token passing a static admin ID identifier 
    const token = generateToken(999);

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: 999,
        username: correctUsername,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong during admin login." });
  }
};