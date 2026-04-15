import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../models/prisma.js";

function parseCsvList(input?: string) {
  if (!input) return [];
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

async function generateUniqueUsername(base: string) {
  const normalized = slugify(base) || "vendor";
  let candidate = normalized;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${normalized}_${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function createVendorApplication(req: Request, res: Response) {
  try {
    const {
      ownerName,
      businessEmail,
      phone,
      password,
      confirmPassword,
      shopName,
      tradeLicenseNo,
      address,
      city,
      area,
      specialties,
      courierPickup,
      inShopRepair,
      spareParts,
      notes,
    } = req.body as {
      ownerName?: string;
      businessEmail?: string;
      phone?: string;
      password?: string;
      confirmPassword?: string;
      shopName?: string;
      tradeLicenseNo?: string;
      address?: string;
      city?: string;
      area?: string;
      specialties?: string[] | string;
      courierPickup?: boolean;
      inShopRepair?: boolean;
      spareParts?: boolean;
      notes?: string;
    };

    if (
      !ownerName ||
      !businessEmail ||
      !phone ||
      !password ||
      !confirmPassword ||
      !shopName ||
      !address
    ) {
      return res.status(400).json({
        message:
          "ownerName, businessEmail, phone, password, confirmPassword, shopName, and address are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password and confirmPassword do not match",
      });
    }

    const normalizedEmail = businessEmail.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this business email already exists",
      });
    }

    const existingApplication = await prisma.vendorApplication.findUnique({
      where: { businessEmail: normalizedEmail },
      select: { id: true, status: true },
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "A vendor application with this business email already exists",
      });
    }

    const normalizedSpecialties = Array.isArray(specialties)
      ? specialties.map((s) => s.trim()).filter(Boolean)
      : parseCsvList(specialties);

    const usernameBase = normalizedEmail.split("@")[0] || shopName;
    const username = await generateUniqueUsername(usernameBase);
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email: normalizedEmail,
          passwordHash,
          name: ownerName.trim(),
          phone: phone.trim(),
          role: "VENDOR",
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      });

      const application = await tx.vendorApplication.create({
        data: {
          userId: user.id,
          ownerName: ownerName.trim(),
          businessEmail: normalizedEmail,
          phone: phone.trim(),
          shopName: shopName.trim(),
          tradeLicenseNo: tradeLicenseNo?.trim() || null,
          address: address.trim(),
          city: city?.trim() || null,
          area: area?.trim() || null,
          specialties: normalizedSpecialties,
          courierPickup: Boolean(courierPickup),
          inShopRepair: typeof inShopRepair === "boolean" ? inShopRepair : true,
          spareParts: Boolean(spareParts),
          notes: notes?.trim() || null,
          status: "PENDING",
        },
        select: {
          id: true,
          userId: true,
          ownerName: true,
          businessEmail: true,
          shopName: true,
          status: true,
          createdAt: true,
        },
      });

      return { user, application };
    });

    return res.status(201).json({
      message: "Vendor application submitted successfully",
      user: result.user,
      application: result.application,
    });
  } catch (error) {
    console.error("createVendorApplication error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}