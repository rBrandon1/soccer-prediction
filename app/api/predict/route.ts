import { PredictionData } from "@/lib/types";
import { predictOutcome } from "@/lib/utils/predictionAlgo";
import { NextResponse } from "next/server";
import { getTeamData, getTeamFixtures } from "../soccerData/route";

export async function POST(request: Request) {
  try {
    const body: PredictionData = await request.json();

    const [homeTeamData, awayTeamData] = await Promise.all([
      getTeamData(body.homeTeam),
      getTeamData(body.awayTeam),
    ]);

    const [homeFixtures, awayFixtures] = await Promise.all([
      getTeamFixtures(homeTeamData.team.id),
      getTeamFixtures(awayTeamData.team.id),
    ]);

    const result = predictOutcome(
      homeTeamData.team,
      awayTeamData.team,
      homeFixtures,
      awayFixtures,
      body.userPrediction
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in prediction:", error);
    return NextResponse.json(
      { error: "Failed to make prediction" },
      { status: 500 }
    );
  }
}
