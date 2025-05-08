import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Check authentication using Lucia instead of NextAuth
    const { user, session } = await getUser();

    if (!session || !user) {
      return NextResponse.json({ message: "Anda harus login untuk memeriksa voucher" }, { status: 401 });
    }

    // Get data from request
    const data = await request.json();
    const { code } = data;

    // Validate input
    if (!code) {
      return NextResponse.json({ message: "Kode voucher harus diisi" }, { status: 400 });
    }

    // Get user ID from session
    const userId = user.id;

    // Check if voucher exists and belongs to the user
    const voucher = await prisma.voucher.findFirst({
      where: {
        code: code,
        userId: userId,
      },
      include: {
        transaction: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!voucher) {
      return NextResponse.json({ message: "Voucher tidak ditemukan" }, { status: 404 });
    }

    // Check if transaction is verified
    if (voucher.transaction.status !== "VERIFIED") {
      return NextResponse.json({ message: "Transaksi untuk voucher ini belum diverifikasi" }, { status: 400 });
    }

    // Check if voucher is already used
    if (voucher.status === "USED") {
      return NextResponse.json({ message: "Voucher sudah digunakan" }, { status: 400 });
    }

    // Return voucher details
    return NextResponse.json(
      {
        message: "Voucher valid",
        voucher: {
          id: voucher.id,
          code: voucher.code,
          voteAmount: voucher.voteAmount,
          status: voucher.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking voucher:", error);

    return NextResponse.json({ message: "Terjadi kesalahan saat memeriksa voucher" }, { status: 500 });
  }
}
