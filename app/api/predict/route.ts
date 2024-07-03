import { oneFootballScraper } from "@/lib/oneFootballScraper";
import { PredictionResult, TeamResult } from "@/lib/types";
import { predictOutcome } from "@/lib/utils/predictionAlgo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body: PredictionResult = await request.json();

    const homeTeam = await oneFootballScraper.getTeamData(
      body.homeTeam as unknown as string
    );
    const awayTeam = await oneFootballScraper.getTeamData(
      body.awayTeam as unknown as string
    );

    if (!homeTeam) {
      console.error("Failed to fetch home team data:", body.homeTeam);
      return NextResponse.json(
        { error: `Unable to fetch data for ${body.homeTeam}` },
        { status: 400 }
      );
    }
    if (!awayTeam) {
      console.error("Failed to fetch away team data:", body.awayTeam);
      return NextResponse.json(
        { error: `Unable to fetch data for ${body.awayTeam}` },
        { status: 400 }
      );
    }

    const result = predictOutcome(homeTeam, awayTeam, body.userPrediction);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in prediction:", error.message);
    return NextResponse.json(
      {
        error:
          "Failed to make prediction: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
