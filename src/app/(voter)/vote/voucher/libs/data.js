"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

// Get all vouchers owned by the current user
export async function getUserVouchers() {
  const { session } = await getUser();
  const userId = session.userId;

  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        userId: userId,
      },
      include: {
        transaction: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return vouchers;
  } catch (error) {
    console.error("Failed to get user vouchers", error);
    throw error;
  }
}

// Get a specific voucher by ID
export async function getVoucherById(id) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        transaction: true,
      },
    });

    return voucher;
  } catch (error) {
    console.error("Failed to get voucher by ID", error);
    throw error;
  }
}
