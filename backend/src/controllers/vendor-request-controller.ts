import { Response } from "express";
import { RequestStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { AuthedRequest } from "../middlewares/auth";

export async function getOpenVendorRequests(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (role !== Role.VENDOR) {
      return res.status(403).json({ message: "Vendor access only" });
    }

    const requests = await prisma.repairRequest.findMany({
      where: {
        status: RequestStatus.BIDDING,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        deviceType: true,
        brand: true,
        model: true,
        issueCategory: true,
        problem: true,
        mode: true,
        preferredPickup: true,
        deliveryType: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("getOpenVendorRequests error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}