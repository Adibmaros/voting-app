import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user, session } = await getUser();

    // If no session, return null but with 200 status (not an error)
    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    // Return the session data and user information that's needed on the client
    return NextResponse.json(
      {
        session: {
          id: session.userId,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
