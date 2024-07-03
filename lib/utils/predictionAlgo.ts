import { TeamData } from "@/lib/oneFootballScraper";
import { PredictionResult, TeamResult } from "@/lib/types";

function calculatePerformance(team: TeamData): number {
  return (
    team.recentForm.reduce((total, result) => {
      if (result === "W") return total + 3;
      if (result === "D") return total + 1;
      return total;
    }, 0) / 15
  ); // 15 is the maximum points possible from 5 games
}

export function predictOutcome(
  homeTeam: TeamData,
  awayTeam: TeamData,
  userPrediction: "homeWin" | "awayWin" | "draw"
): PredictionResult {
  const homePerformance = calculatePerformance(homeTeam);
  const awayPerformance = calculatePerformance(awayTeam);

  const performanceDifference = homePerformance - awayPerformance;

  // Calculate head-to-head advantage based on historical results
  const headToHeadAdvantage = calculateHeadToHeadAdvantage(homeTeam, awayTeam);

  let predictedOutcome: "homeWin" | "awayWin" | "draw";
  let confidence: number;

  const totalDifference = performanceDifference + headToHeadAdvantage;

  if (totalDifference > 0.1) {
    predictedOutcome = "homeWin";
    confidence = 0.5 + totalDifference;
  } else if (totalDifference < -0.1) {
    predictedOutcome = "awayWin";
    confidence = 0.5 - totalDifference;
  } else {
    predictedOutcome = "draw";
    confidence = 0.5 - Math.abs(totalDifference);
  }

  // Adjust based on user prediction
  if (userPrediction === predictedOutcome) {
    confidence += 0.1;
  } else {
    confidence -= 0.05;
  }

  // Ensure confidence is between 0 and 1
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    homeTeam: homeTeam as TeamResult,
    awayTeam: awayTeam as TeamResult,
    predictedOutcome,
    userPrediction,
    confidence,
    homePerformance,
    awayPerformance,
  };
}

function calculateHeadToHeadAdvantage(
  homeTeam: TeamData,
  awayTeam: TeamData
): number {
  const homeTeamPastGames = homeTeam.pastGames;
  const awayTeamPastGames = awayTeam.pastGames;

  let homeTeamPoints = 0;
  let awayTeamPoints = 0;

  // Analyze past games of the home team
  for (const game of homeTeamPastGames) {
    if (game.opponent === awayTeam.name) {
      if (game.result === "W") {
        homeTeamPoints += 1;
      } else if (game.result === "L") {
        awayTeamPoints += 1;
      }
    }
  }

  // Analyze past games of the away team
  for (const game of awayTeamPastGames) {
    if (game.opponent === homeTeam.name) {
      if (game.result === "W") {
        awayTeamPoints += 1;
      } else if (game.result === "L") {
        homeTeamPoints += 1;
      }
    }
  }

  // Calculate the head-to-head advantage
  const totalPoints = homeTeamPoints + awayTeamPoints;
  const headToHeadAdvantage =
    totalPoints > 0 ? (homeTeamPoints - awayTeamPoints) / totalPoints : 0;

  return headToHeadAdvantage;
}
