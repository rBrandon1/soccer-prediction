"use client";

import "@/app/globals.css";
import Link from "next/link";
import React, { useState } from "react";
import TeamSelector from "../components/TeamSelector";
import { PredictionData, PredictionResult } from "../lib/types";

export default function Home() {
  const [predictionResult, setPredictionResult] =
    useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredictionSubmit = async (data: PredictionData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }
      const result: PredictionResult = await response.json();
      setPredictionResult(result);
    } catch (err) {
      setError("An error occurred while fetching the prediction");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#0A0C14] flex flex-col items-center justify-between p-10 pt-16">
      <h1 className="text-white text-4xl font-bold italic tracking-wider mb-8">
        Match Predictor
      </h1>
      <div className="my-8">
        <TeamSelector onPredictionSubmit={handlePredictionSubmit} />
      </div>
      {isLoading && <p>Loading prediction...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {predictionResult && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Prediction Result</h2>
          <p className="mb-2">
            Match:{" "}
            <span className="font-bold">
              {predictionResult.homeTeam.name ?? ""}
            </span>{" "}
            (Home) vs{" "}
            <span className="font-bold">{predictionResult.awayTeam.name}</span>{" "}
            (Away)
          </p>
          <p className="mb-2">
            Predicted Outcome:{" "}
            <span className="font-bold">
              {predictionResult.predictedOutcome === "homeWin"
                ? `${predictionResult.homeTeam.name} wins`
                : predictionResult.predictedOutcome === "awayWin"
                ? `${predictionResult.awayTeam.name} wins`
                : "Draw"}
            </span>
          </p>
          <p className="mb-4">
            Confidence:{" "}
            <span className="font-bold">
              {(predictionResult.confidence * 100).toFixed(2)}%
            </span>
          </p>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              Recent Performance
              <br />
              (Last 5 Games)
            </h3>
            <p>
              Home Team:{" "}
              <span className="font-bold">
                {predictionResult.homeRecentGames.join(" ")}
              </span>
            </p>
            <p>
              Away Team:{" "}
              <span className="font-bold">
                {predictionResult.awayRecentGames.join(" ")}
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Note: This prediction is based on recent performance and should not
            be used for betting purposes.
          </p>
        </div>
      )}
      <footer className="text-xs text-gray-600 absolute bottom-0 my-5 px-10">
        <Link
          className="underline"
          href="https://brandnramirez.com"
          target="_blank"
          rel="noreferrer"
        >
          © Brandon Ramirez {new Date().getFullYear()}
        </Link>
        <p className="italic my-1">
          Prediction results are not guarenteed, please do your own research.
        </p>
      </footer>
    </main>
  );
}
