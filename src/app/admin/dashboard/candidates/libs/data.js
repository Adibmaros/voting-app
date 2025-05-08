import prisma from "@/lib/prisma";

export async function getAllCandidates() {
  const candidates = await prisma.candidate.findMany();
  return candidates;
}
