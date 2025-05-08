import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    // Check authentication using Lucia
    const { user, session } = await getUser();

    if (!session || !user) {
      return NextResponse.json({ message: "Anda harus login untuk memberikan vote" }, { status: 401 });
    }

    // Get data from request
    const data = await request.json();
    const { candidateId, voucherCode } = data;

    // Improved validation for empty or undefined values
    if (!candidateId || candidateId === "" || candidateId === undefined || candidateId === null) {
      return NextResponse.json({ message: "ID kandidat harus diisi" }, { status: 400 });
    }

    if (!voucherCode || voucherCode.trim() === "" || voucherCode === undefined || voucherCode === null) {
      return NextResponse.json({ message: "Kode voucher belum diisi!" }, { status: 400 });
    }

    // Get user ID from session
    const userId = user.id;

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if voucher exists and belongs to the user
      const voucher = await tx.voucher.findFirst({
        where: {
          code: voucherCode,
          userId: userId,
          status: "UNUSED",
        },
      });

      if (!voucher) {
        throw new Error("Voucher tidak valid atau sudah digunakan");
      }

      // 2. Check if candidate exists
      const candidate = await tx.candidate.findUnique({
        where: { id: parseInt(candidateId) },
      });

      if (!candidate) {
        throw new Error("Kandidat tidak ditemukan");
      }

      // 3. Create vote record
      const vote = await tx.vote.create({
        data: {
          userId: userId,
          candidateId: parseInt(candidateId),
          voucherId: voucher.id,
          voteAmount: voucher.voteAmount,
        },
      });

      // 4. Update voucher status to USED
      await tx.voucher.update({
        where: { id: voucher.id },
        data: { status: "USED" },
      });

      // 5. Update candidate vote count
      await tx.candidate.update({
        where: { id: parseInt(candidateId) },
        data: {
          voteCount: { increment: voucher.voteAmount },
        },
      });

      // 6. Recalculate percentages for all candidates
      const totalVotes = await tx.vote.aggregate({
        _sum: { voteAmount: true },
      });

      const totalVoteCount = totalVotes._sum.voteAmount || 0;

      // Only recalculate if there are votes
      if (totalVoteCount > 0) {
        const allCandidates = await tx.candidate.findMany();

        for (const cand of allCandidates) {
          // Calculate new percentage based on updated vote counts
          const percentage = (cand.voteCount / totalVoteCount) * 100;

          await tx.candidate.update({
            where: { id: cand.id },
            data: { percentage },
          });
        }
      }

      return { voucher, vote };
    });

    // Return successful response
    return NextResponse.json(
      {
        message: "Vote berhasil diberikan",
        voteAmount: result.voucher.voteAmount,
        voteId: result.vote.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in vote process:", error);

    return NextResponse.json({ message: error.message || "Terjadi kesalahan saat memproses vote" }, { status: 500 });
  }
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

    // Fetch all votes
    const votes = await prisma.vote.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
