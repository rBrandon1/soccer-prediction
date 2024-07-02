import { PredictionResult } from "@/lib/types";

type SimpleTeam = {
  id: number;
  name: string;
};

type SimpleFixture = {
  goals: {
    home: number;
    away: number;
  };
};

function calculateRecentPerformance(
  fixtures: SimpleFixture[],
  isHome: boolean
): number {
  let points = 0;
  fixtures.forEach((fixture) => {
    const teamScore = isHome ? fixture.goals.home : fixture.goals.away;
    const opponentScore = isHome ? fixture.goals.away : fixture.goals.home;

    if (teamScore > opponentScore) points += 3;
    else if (teamScore === opponentScore) points += 1;
  });
  return points / (fixtures.length * 3);
}

function getRecentGames(fixtures: SimpleFixture[], isHome: boolean): string[] {
  return fixtures
    .map((fixture) => {
      const teamScore = isHome ? fixture.goals.home : fixture.goals.away;
      const opponentScore = isHome ? fixture.goals.away : fixture.goals.home;

      if (teamScore > opponentScore) return "W";
      if (teamScore < opponentScore) return "L";
      return "D";
    })
    .reverse();
}

export function predictOutcome(
  homeTeam: SimpleTeam,
  awayTeam: SimpleTeam,
  homeFixtures: SimpleFixture[],
  awayFixtures: SimpleFixture[],
  userPrediction: "homeWin" | "awayWin" | "draw"
): PredictionResult {
  const homePerformance = calculateRecentPerformance(homeFixtures, true);
  const awayPerformance = calculateRecentPerformance(awayFixtures, false);
  const homeRecentGames = getRecentGames(homeFixtures, true);
  const awayRecentGames = getRecentGames(awayFixtures, false);

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
    homePerformance,
    awayPerformance,
    homeRecentGames,
    awayRecentGames,
  };
}
