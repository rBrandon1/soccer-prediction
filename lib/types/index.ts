export interface PastGame {
  opponent: string;
  result: "W" | "D" | "L";
  score: string;
}

export interface TeamResult {
  id: string;
  name: string;
  recentForm: string[];
  pastGames: PastGame[];
}

export interface PredictionResult {
  homeTeam: TeamResult;
  awayTeam: TeamResult;
  predictedOutcome: "homeWin" | "awayWin" | "draw";
  userPrediction: "homeWin" | "awayWin" | "draw";
  confidence: number;
  homePerformance: number;
  awayPerformance: number;
}

export interface PredictionData {
  homeTeam: string;
  awayTeam: string;
  userPrediction: "homeWin" | "awayWin" | "draw";
}
