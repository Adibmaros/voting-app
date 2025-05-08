import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Function to save the file locally
async function saveFile(file, userId) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const fileName = `payment-proof-${userId}-${uuidv4()}${path.extname(file.name)}`;

  // Define the upload directory and ensure it exists
  const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Error creating directory:", error);
  }

  // Define the file path and save the file
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  // Return the URL path that will be stored in the database
  return `/uploads/payment-proofs/${fileName}`;
}

export async function POST(request) {
  try {
    // Get the current user
    const { session, user } = await getUser();
    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data from the request
    const formData = await request.formData();
    const packageId = formData.get("packageId");
    const amount = parseInt(formData.get("amount")); // Use parseInt instead of parseFloat
    const voteAmount = parseInt(formData.get("voteAmount"));
    const notes = formData.get("notes"); // Not stored in DB as per schema
    const phoneNumber = formData.get("phoneNumber");
    const proofImage = formData.get("proofImage");

    // Validate inputs
    if (!packageId || isNaN(amount) || isNaN(voteAmount) || !proofImage || !phoneNumber) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    // Simple phone number validation
    const phonePattern = /^[0-9+]{8,15}$/;
    if (!phonePattern.test(phoneNumber)) {
      return NextResponse.json({ error: "Format nomor telepon tidak valid" }, { status: 400 });
    }

    const userId = session.userId;

    // Save the file to the local filesystem and get its URL path
    const fileUrl = await saveFile(proofImage, userId);

    // Create transaction record in database
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        phoneNumber: phoneNumber,
        amount: parseInt(amount, 10), // Fix decimal precision issues by converting to integer
        votePackageAmount: voteAmount,
        paymentProofUrl: fileUrl, // Store the file URL path in the database
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        votePackageAmount: transaction.votePackageAmount,
        status: transaction.status,
        phoneNumber: transaction.phoneNumber,
        paymentProofUrl: transaction.paymentProofUrl,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
