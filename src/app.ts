import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
import cors from "cors";
import authRoutes from './routes/authRoutes';
import bannerRoutes from './routes/bannerRoutes';
import propertyRoutes from "./routes/propertyRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import faqRoutes from "./routes/faqRoutes";
import favoriteRoutes from "./routes/favoriteRoute";
import subscribeRoutes from "./routes/suscribeRoute";
import profileRoutes from "./routes/profileRoutes";
import cookieParser from "cookie-parser";
import compression from "compression";
import { limiter } from "./middleware/rateLimiter.middleware";


dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(compression());
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", subscribeRoutes);


app.use("/api/faqs", faqRoutes);

app.use("/api/profile", profileRoutes);
export default app;
