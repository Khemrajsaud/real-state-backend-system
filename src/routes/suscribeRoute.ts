import { Router } from "express";

import { subscribeEmail, getSubscribers } from "../controllers/subscriberController";

const router = Router();


// Marketing Audience Funnels
router.post("/subscribe", subscribeEmail);
router.get("/subscribers", getSubscribers);



export default router;