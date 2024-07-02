import { Fixture, PredictionData, Team } from "@/lib/types";
import { predictOutcome } from "@/lib/utils/predictionAlgo";
import axios from "axios";
import { NextResponse } from "next/server";

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
});

async function getTeamData(teamName: string): Promise<Team> {
  const response = await api.get("/teams", { params: { search: teamName } });

  if (response.data.errors.requests !== "") {
    throw new Error(`API error: ${response.data.errors.requests}`);
  }

  if (response.data.results === 0) {
    throw new Error(`Team not found: ${teamName}`);
  }
  return response.data.response[0].team;
}

async function getRecentFixtures(teamId: number): Promise<Fixture[]> {
  const response = await api.get("/fixtures", {
    params: {
      team: teamId,
      last: 5,
      status: "FT",
    },
  });
  return response.data.response;
}

export async function POST(request: Request) {
  try {
    const body: PredictionData = await request.json();
    const [homeTeam, awayTeam] = await Promise.all([
      getTeamData(body.homeTeam),
      getTeamData(body.awayTeam),
    ]);

    const [homeFixtures, awayFixtures] = await Promise.all([
      getRecentFixtures(homeTeam.team.id),
      getRecentFixtures(awayTeam.team.id),
    ]);

    const result = predictOutcome(
      homeTeam.team,
      awayTeam.team,
      homeFixtures,
      awayFixtures,
      body.userPrediction
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in prediction:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
