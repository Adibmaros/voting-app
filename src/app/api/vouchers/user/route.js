// app/api/vouchers/user/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    // Get the current user session
    const { user, session } = await getUser();

    // If no user is logged in, return unauthorized
    if (!user || !session) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Fetch the user's unused vouchers
    const vouchers = await prisma.voucher.findMany({
      where: {
        userId: user.id,
        status: "UNUSED",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      vouchers,
      message: "Vouchers fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user vouchers:", error);
    return NextResponse.json({ message: "Failed to fetch vouchers" }, { status: 500 });
  }
}
