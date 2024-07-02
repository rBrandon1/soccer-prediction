import axios from "axios";

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": "v3.football.api-sports.io",
  },
});

export async function getTeamData(teamName: string) {
  try {
    const response = await api.get("/teams", { params: { search: teamName } });
    if (response.data.results > 0) {
      return response.data.response[0];
    }
    throw new Error("Team not found");
  } catch (error) {
    console.error("Error fetching team data:", error);
    throw error;
  }
}

export async function searchTeams(query: string) {
  try {
    console.log("Searching API for:", query); // Add this line
    const response = await api.get("/teams", {
      params: {
        search: query,
      },
    });
    console.log("API response:", response.data); // Add this line
    return response.data.response;
  } catch (error) {
    console.error("Error searching teams:", error);
    throw error;
  }
}

export async function getTeamFixtures(teamId: number, last: number = 5) {
  try {
    const response = await api.get("/fixtures", {
      params: {
        team: teamId,
        last: last,
        status: "FT", // Only finished matches
      },
    });
    return response.data.response;
  } catch (error) {
    console.error("Error fetching team fixtures:", error);
    throw error;
  }
}
