import { PredictionData } from "@/lib/types";
import React, { useState } from "react";

const TeamSelector: React.FC<{
  onPredictionSubmit: (data: PredictionData) => void;
}> = ({ onPredictionSubmit }) => {
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [userPrediction, setUserPrediction] = useState<
    "homeWin" | "awayWin" | "draw"
  >("draw");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const encodedHomeTeam = encodeURIComponent(homeTeam);
    const encodedAwayTeam = encodeURIComponent(awayTeam);

    const predictionData: PredictionData = {
      homeTeam: encodedHomeTeam,
      awayTeam: encodedAwayTeam,
      userPrediction,
    };

    onPredictionSubmit(predictionData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-[#131726] rounded-lg shadow-md p-8 "
    >
      <div>
        <label
          htmlFor="homeTeam"
          className="block text-sm font-medium text-white"
        >
          Home Team
        </label>
        <input
          type="text"
          id="homeTeam"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          required
          className="p-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label
          htmlFor="awayTeam"
          className="block text-sm font-medium text-white"
        >
          Away Team
        </label>
        <input
          type="text"
          id="awayTeam"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          required
          className="p-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label
          htmlFor="prediction"
          className="block text-sm font-medium text-white"
        >
          Your Prediction
        </label>
        <select
          id="prediction"
          value={userPrediction}
          onChange={(e) =>
            setUserPrediction(e.target.value as "homeWin" | "awayWin" | "draw")
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="homeWin">Home Team Wins</option>
          <option value="awayWin">Away Team Wins</option>
          <option value="draw">Draw</option>
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Predict Outcome
      </button>
    </form>
  );
};

export default TeamSelector;
