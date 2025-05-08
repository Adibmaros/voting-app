import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { session } = await getUser();

  // Autentikasi
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const whereConditions = {};

    // Filter status
    if (status && status !== "ALL") {
      whereConditions.status = status;
    }

    // Filter pencarian
    if (search) {
      const idSearch = parseInt(search);
      whereConditions.OR = [
        !isNaN(idSearch) ? { id: idSearch } : undefined,
        {
          user: {
            OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }],
          },
        },
      ].filter(Boolean);
    }

    const totalTransactions = await prisma.transaction.count({
      where: whereConditions,
    });

    const transactions = await prisma.transaction.findMany({
      where: whereConditions,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vouchers: {
          select: {
            id: true,
            code: true,
            voteAmount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      transactions,
      total: totalTransactions,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export function POST() {
  return NextResponse.json({ error: "Method POST not allowed" }, { status: 405 });
}
