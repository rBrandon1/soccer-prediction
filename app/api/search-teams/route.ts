import { NextResponse } from "next/server";
import { searchTeams } from "../soccerData/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  console.log("Received query:", query); // Add this line

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const teams = await searchTeams(query);
    console.log("Teams found:", teams); // Add this line
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error in team search:", error);
    return NextResponse.json(
      { error: "Failed to search teams" },
      { status: 500 }
    );
  }
}
