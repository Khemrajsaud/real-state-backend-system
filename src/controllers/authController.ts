import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../services/prisma";
import { generateToken } from "../utils/jwt";
import { SignupRequestBody } from "../types/auth";

// SIGNUP CONTROLLER
export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response,
): Promise<void> => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });
    const token = generateToken(newUser.id);
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


// LOGIN CONTROLLER
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body; 

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
};



// LOGOUT CONTROLLER
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: "Authorization token is missing or invalid." });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Add the token to the blocklist to invalidate it
    await prisma.tokenBlocklist.create({
      data: {
        token: token,
      },
    });

    res.status(200).json({ message: "You have been successfully logged out." });

  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ error: "An internal server error occurred during logout." });
  }
};



