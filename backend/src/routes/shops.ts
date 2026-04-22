import { Router } from "express";
<<<<<<< HEAD
import prisma from "../models/prisma.js";

const router = Router();
=======
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();
>>>>>>> 4bc9e005b7817c1c5b3c773557f6c38b0bcb14ba

router.get("/", async (req, res) => {
  try {
    const shops = await prisma.shop.findMany();
    res.json(shops);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching shops");
  }
});

export default router;