import Queue from "bull";
import { oneFootballScraper } from "./oneFootballScraper";
import { PredictionData, PredictionResult } from "./types";
import { predictOutcome } from "./utils/predictionAlgo";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL must be set");
}

const predictionQueue = new Queue<PredictionData>(
  "prediction",
  process.env.REDIS_URL
);

predictionQueue.process(async (job): Promise<PredictionResult> => {
  const { homeTeam, awayTeam, userPrediction } = job.data;

  console.log(`Processing prediction for ${homeTeam} vs ${awayTeam}`);

  const homeTeamData = await oneFootballScraper.getTeamData(homeTeam);
  const awayTeamData = await oneFootballScraper.getTeamData(awayTeam);

  if (!homeTeamData || !awayTeamData) {
    throw new Error(`Unable to fetch team data for ${homeTeam} or ${awayTeam}`);
  }

  const result = predictOutcome(homeTeamData, awayTeamData, userPrediction);
  console.log(`Prediction complete for ${homeTeam} vs ${awayTeam}`);

  return result;
});

export { predictionQueue };
