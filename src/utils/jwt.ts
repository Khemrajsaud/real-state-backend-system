import jwt from "jsonwebtoken";
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";


export const generateToken = (userId:number): string =>{
    const payload = {id: userId};

    return jwt.sign(payload, JWT_SECRET, {expiresIn: "7h"});
}










