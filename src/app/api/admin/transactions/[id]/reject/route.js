import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  const { session } = await getUser();

  // Cek autentikasi
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  // Ambil user dan cek role
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  const transactionId = parseInt(params.id);

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
      return NextResponse.json({ error: "Can only reject transactions with PENDING status" }, { status: 400 });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({
      message: "Transaction rejected successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error rejecting transaction:", error);
    return NextResponse.json({ error: "Failed to reject transaction" }, { status: 500 });
  }
}
