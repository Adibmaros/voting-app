import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/candidates - Retrieve all candidates with sorting and searching
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "percentage";

    // Build the where condition for search
    const where = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }],
        }
      : {};

    // Build the orderBy condition for sorting
    let orderBy = {};

    if (sort === "name") {
      orderBy = { name: "asc" };
    } else if (sort === "percentage") {
      orderBy = { voteCount: "desc" }; // Default sorting by votes count descending
    }

    // Fetch candidates from the database
    const candidates = await prisma.candidate.findMany({
      where,
      orderBy,
    });

    // Calculate total votes across all candidates
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);

    // Calculate and update percentages
    const candidatesWithPercentages = candidates.map((candidate) => {
      // Calculate percentage safely (avoiding division by zero)
      const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;

      return {
        ...candidate,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    return NextResponse.json({ candidates: candidatesWithPercentages });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
