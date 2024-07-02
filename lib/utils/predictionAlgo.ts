import { Fixture, PredictionResult, Team } from "../types";

function getRecentGames(fixtures: Fixture[], teamId: number): string[] {
  return fixtures
    .map((fixture) => {
      const isHomeTeam = fixture.teams.home.id === teamId;
      const teamScore = isHomeTeam ? fixture.goals.home : fixture.goals.away;
      const opponentScore = isHomeTeam
        ? fixture.goals.away
        : fixture.goals.home;

      if (teamScore > opponentScore) return "W";
      if (teamScore < opponentScore) return "L";
      return "D";
    })
    .reverse();
}

function calculateRecentPerformance(
  fixtures: Fixture[],
  teamId: number
): number {
  let points = 0;
  fixtures.forEach((fixture) => {
    const isHomeTeam = fixture.teams.home.id === teamId;
    const teamScore = isHomeTeam ? fixture.goals.home : fixture.goals.away;
    const opponentScore = isHomeTeam ? fixture.goals.away : fixture.goals.home;

    if (teamScore > opponentScore) points += 3;
    else if (teamScore === opponentScore) points += 1;
  });
  return points / (fixtures.length * 3);
}

export function predictOutcome(
  homeTeam: Team["team"],
  awayTeam: Team["team"],
  homeFixtures: Fixture[],
  awayFixtures: Fixture[],
  userPrediction: "homeWin" | "awayWin" | "draw"
): PredictionResult {
  const homePerformance = calculateRecentPerformance(homeFixtures, homeTeam.id);
  const awayPerformance = calculateRecentPerformance(awayFixtures, awayTeam.id);
  const homeRecentGames = getRecentGames(homeFixtures, homeTeam.id);
  const awayRecentGames = getRecentGames(awayFixtures, awayTeam.id);

  const performanceDiff = homePerformance - awayPerformance;
  const homeAdvantage = 0.05;
  const adjustedPerformanceDiff = performanceDiff + homeAdvantage;
  const randomFactor = Math.random() * 0.2 - 0.1;

  let predictedOutcome: "homeWin" | "awayWin" | "draw";
  let confidence: number;

  if (adjustedPerformanceDiff + randomFactor > 0.1) {
    predictedOutcome = "homeWin";
    confidence = 0.5 + (adjustedPerformanceDiff + randomFactor);
  } else if (adjustedPerformanceDiff + randomFactor < -0.1) {
    predictedOutcome = "awayWin";
    confidence = 0.5 - (adjustedPerformanceDiff + randomFactor);
  } else {
    predictedOutcome = "draw";
    confidence = 0.5 - Math.abs(adjustedPerformanceDiff + randomFactor);
  }

  if (userPrediction === predictedOutcome) {
    confidence += 0.1;
  } else {
    confidence -= 0.05;
  }

  confidence = Math.max(0, Math.min(1, confidence));

  return {
    homeTeam,
    awayTeam,
    predictedOutcome,
    confidence,
    homeRecentGames,
    awayRecentGames,
  };
}
