import { predictionQueue } from "@/lib/queue";
import redis from "@/lib/redis";
import { PredictionData, PredictionResult } from "@/lib/types";
import { NextResponse } from "next/server";

const CACHE_DURATION = 60 * 60; // 1 hour in seconds

export async function POST(request: Request) {
  try {
    const body: PredictionData = await request.json();

    const cacheKey = `prediction:${body.homeTeam}:${body.awayTeam}`;

    try {
      // Try to get data from cache
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        console.log("Cache hit for", cacheKey);
        return NextResponse.json(JSON.parse(cachedResult as string));
      }
    } catch (cacheError) {
      console.error("Error accessing cache:", cacheError);
      // Continue with prediction if cache fails
    }

    console.log("Cache miss for", cacheKey, "- queuing prediction job");

    // If not in cache, add to queue
    const job = await predictionQueue.add(body);
    const result = (await job.finished()) as PredictionResult;

    try {
      // Cache the result
      await redis.set(cacheKey, JSON.stringify(result), {
        ex: CACHE_DURATION,
      });
      console.log("Cached result for", cacheKey);
    } catch (cacheError) {
      console.error("Error caching result:", cacheError);
      // Continue even if caching fails
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in prediction:", error);
    return NextResponse.json(
      { error: "Failed to make prediction" },
      { status: 500 }
    );
  }
}
