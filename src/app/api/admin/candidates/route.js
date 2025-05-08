import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/candidates - Retrieve all candidates and calculate vote percentages
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        createdAt: "desc",
      },
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

    return NextResponse.json(candidatesWithPercentages);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/candidates - Create a new candidate
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Create the candidate
    const candidate = await prisma.candidate.create({
      data: {
        name: body.name,
        photoUrl: body.photoUrl || null,
        description: body.description || null,
        // voteCount and percentage are initialized with default values in schema
      },
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
