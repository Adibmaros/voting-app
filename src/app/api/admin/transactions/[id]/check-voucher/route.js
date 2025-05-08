// app/api/admin/transactions/[id]/check-voucher/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    // Check authentication
    const { user } = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
    }

    // Check if transaction exists and if it has vouchers
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        vouchers: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Return whether the transaction has vouchers
    const hasVoucher = transaction.vouchers.length > 0;
    return NextResponse.json({
      hasVoucher,
      vouchers: hasVoucher ? transaction.vouchers : [],
    });
  } catch (error) {
    console.error("Error checking voucher:", error);
    return NextResponse.json({ error: "Failed to check voucher status" }, { status: 500 });
  }
}
