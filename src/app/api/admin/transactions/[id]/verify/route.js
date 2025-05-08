import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  // Pastikan params sudah di-await
  const { id } = params;
  const transactionId = parseInt(id);

  const { session } = await getUser();

  // Cek autentikasi
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  // Ambil user dari database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  if (isNaN(transactionId)) {
    return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json({ error: "Can only verify transactions with PENDING status" }, { status: 400 });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "VERIFIED" },
    });

    return NextResponse.json({
      message: "Transaction verified successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return NextResponse.json({ error: "Failed to verify transaction" }, { status: 500 });
  }
}
