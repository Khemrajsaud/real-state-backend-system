import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import bannerRoutes from './routes/bannerRoutes';
import propertyRoutes from "./routes/propertyRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import faqRoutes from "./routes/faqRoutes";

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/testimonials", testimonialRoutes);


app.use("/api/faqs", faqRoutes);
export default app;
