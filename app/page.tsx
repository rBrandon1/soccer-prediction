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
        console.error(response);
        throw new Error("Failed to fetch prediction data");
      }

      const result: PredictionResult = await response.json();
      setPredictionResult(result);
    } catch (err) {
      setError("Hmm, something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[#0A0C14] flex flex-col items-center justify-between p-10 pt-16 h-screen">
      <h1 className="text-white text-4xl font-bold italic tracking-wider mb-8">
        Match Predictor
      </h1>
      <div className="my-8">
        <TeamSelector onPredictionSubmit={handlePredictionSubmit} />
      </div>
      {isLoading && <p className="text-slate-500">Calculating prediction...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {predictionResult && !isLoading && (
        <div className="my-8 p-6 bg-white rounded-lg shadow-md text-[14px] md:text-[18px]">
          <h2 className="text-2xl font-semibold mb-4">Prediction Result</h2>
          <p className="mb-2">
            Match:{" "}
            <span className="font-bold">
              {predictionResult.homeTeam.name.toUpperCase() ?? ""}
            </span>{" "}
            (Home) vs{" "}
            <span className="font-bold">
              {predictionResult.awayTeam.name.toUpperCase()}
            </span>{" "}
            (Away)
          </p>
          <p className="mb-2">
            Predicted Outcome:{" "}
            <span className="font-bold">
              {predictionResult.predictedOutcome === "homeWin"
                ? `${predictionResult.homeTeam.name.toUpperCase()} wins`
                : predictionResult.predictedOutcome === "awayWin"
                ? `${predictionResult.awayTeam.name.toUpperCase()} wins`
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
              <span className="italic">
                {predictionResult.homeTeam.name.toUpperCase()}
              </span>{" "}
              vs:{" "}
              <span className="font-bold">
                {predictionResult.homeTeam.pastGames.map((game, index) => (
                  <span key={index}>
                    {game.result === "W" ? (
                      <span className="text-green-500">
                        {game.opponent} (W)
                      </span>
                    ) : game.result === "L" ? (
                      <span className="text-red-500">{game.opponent} (L)</span>
                    ) : (
                      <span className="text-gray-500">{game.opponent} (D)</span>
                    )}{" "}
                  </span>
                ))}
              </span>
            </p>
            <p>
              <span className="italic">
                {predictionResult.awayTeam.name.toUpperCase()}
              </span>{" "}
              vs:{" "}
              <span className="font-bold">
                {predictionResult.awayTeam.pastGames.map((game, index) => (
                  <span key={index}>
                    {game.result === "W" ? (
                      <span className="text-green-500">
                        {game.opponent} (W)
                      </span>
                    ) : game.result === "L" ? (
                      <span className="text-red-500">{game.opponent} (L)</span>
                    ) : (
                      <span className="text-gray-500">{game.opponent} (D)</span>
                    )}{" "}
                  </span>
                ))}
              </span>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Note: This prediction is based on recent performance and should not
            be used for betting purposes.
          </p>
        </div>
      )}
      <footer className="text-xs text-gray-600 bottom-0 p-10">
        <Link
          className="underline"
          href="https://brandnramirez.com"
          target="_blank"
          rel="noreferrer"
        >
          © Brandon Ramirez {new Date().getFullYear()}
        </Link>
        <p className="italic my-1">
          Results are not guarenteed, please do your own research.
        </p>
      </footer>
    </main>
  );
}
