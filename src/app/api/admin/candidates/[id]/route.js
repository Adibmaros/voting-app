// PUT dan GET /api/admin/candidates/[id]
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/candidates/[id] - Ambil kandidat berdasarkan ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/admin/candidates/[id] - Update kandidat
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Update the candidate
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        name: body.name,
        photoUrl: body.photoUrl !== undefined ? body.photoUrl : undefined,
        description: body.description !== undefined ? body.description : undefined,
      },
    });

    return NextResponse.json(updatedCandidate);
  } catch (error) {
    console.error("Error updating candidate:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/candidates/[id] - Delete kandidat
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    await prisma.candidate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
