"use server";

import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
  const { session } = await getUser();

  // Cek autentikasi
  if (!session) {
    return NextResponse.json({ error: "Anda harus login." }, { status: 401 });
  }

  // Ambil user dari database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak diizinkan. Akses admin diperlukan." }, { status: 403 });
  }

  try {
    const { transactionId, userId } = await req.json();

    // Validasi input
    if (!transactionId || !userId) {
      return NextResponse.json({ error: "ID transaksi dan ID user diperlukan" }, { status: 400 });
    }

    // Cek transaksi
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    if (transaction.status !== "VERIFIED") {
      return NextResponse.json({ error: "Hanya transaksi VERIFIED yang dapat dibuat voucher" }, { status: 400 });
    }

    // Cek apakah voucher sudah pernah dibuat untuk transaksi ini
    const existingVouchers = await prisma.voucher.count({
      where: { transactionId: transaction.id },
    });

    if (existingVouchers > 0) {
      return NextResponse.json({ error: "Voucher untuk transaksi ini sudah dibuat sebelumnya" }, { status: 400 });
    }

    // Generate kode voucher unik
    const voucherCode = generateVoucherCode();

    // Buat voucher baru dengan jumlah vote sesuai paket
    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCode,
        voteAmount: transaction.votePackageAmount,
        userId: userId,
        transactionId: transaction.id,
        status: "UNUSED",
      },
    });

    return NextResponse.json({
      message: "Voucher berhasil dibuat",
      voucher,
    });
  } catch (error) {
    console.error("Error generating voucher:", error);
    return NextResponse.json({ error: "Gagal membuat voucher" }, { status: 500 });
  }
}

// Function untuk generate kode voucher unik
function generateVoucherCode() {
  const prefix = "VOTE";
  // Generate 8 karakter acak (huruf dan angka)
  const randomString = crypto.randomBytes(4).toString("hex").toUpperCase();
  // Format: VOTE-XXXX-XXXX
  return `${prefix}-${randomString.slice(0, 4)}-${randomString.slice(4, 8)}`;
}

export async function GET() {
  try {
    // Check if the user is authenticated and is an admin
    const { user } = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all vouchers
    const vouchers = await prisma.voucher.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
