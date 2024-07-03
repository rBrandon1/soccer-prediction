import axios from "axios";
import { JSDOM } from "jsdom";

interface PastGame {
  opponent: string;
  result: "W" | "D" | "L";
  score: string;
}

export interface TeamData {
  id: string;
  name: string;
  recentForm: string[];
  pastGames: PastGame[];
}

class OneFootballScraper {
  private axiosInstance = axios.create({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  private async fetchHTML(url: string): Promise<string> {
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.axiosInstance.get(url);
        return response.data;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((res) => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
      }
    }
    throw new Error("Failed to fetch after retries");
  }

  async searchTeam(
    teamName: string
  ): Promise<{ id: string; name: string } | null> {
    try {
      const searchUrl = `https://onefootball.com/en/search?q=${encodeURIComponent(
        teamName
      )}`;
      const html = await this.fetchWithRetry(searchUrl);
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const teamElement = document.querySelector(
        ".search-result-list__result-link"
      );
      if (!teamElement) return null;

      const href = teamElement.getAttribute("href");
      if (!href) return null;

      const [, , , nameWithId] = href.split("/");

      if (teamName.includes("%")) {
        const [firstName, secondName, id] = nameWithId.split("-");
        const name = `${firstName}-${secondName}`;
        return { id, name };
      }

      const [name, id] = nameWithId.split("-");

      return { id, name };
    } catch (error: any) {
      console.error(`Error searching for team ${teamName}:`, error.message);
      return null;
    }
  }

  async getPastGames(
    teamId: string,
    teamName: string
  ): Promise<TeamData["pastGames"]> {
    try {
      const resultsUrl = `https://onefootball.com/en/team/${teamName}-${teamId}/results`;
      const html = await this.fetchHTML(resultsUrl);
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const pastGames: TeamData["pastGames"] = [];

      const monthElements = document.querySelectorAll(
        "#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--matchCardsListsAppender > div > div"
      );

      let matchCount = 0;
      for (let i = 0; i < monthElements.length; i++) {
        const monthElement = monthElements[i];
        const matchElements = monthElement.querySelectorAll("ul > li > a");
        for (let j = 0; j < matchElements.length; j++) {
          const matchElement = matchElements[j];
          const matchHref = matchElement.getAttribute("href") || "";

          const matchUrl = `https://onefootball.com${matchHref}`;
          const matchHtml = await this.fetchHTML(matchUrl);
          const matchDom = new JSDOM(matchHtml);
          const matchDocument = matchDom.window.document;

          const homeTeamName =
            matchDocument
              .querySelector(
                "#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--matchScore > div > div > div > div > a.MatchScoreTeam_container__1X5t5.MatchScoreTeam_home__9Ehdk span:nth-child(2)"
              )
              ?.textContent?.trim()
              .toUpperCase() || "";

          const awayTeamName =
            matchDocument
              .querySelector(
                "#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--matchScore > div > div > div > div > a.MatchScoreTeam_container__1X5t5.MatchScoreTeam_away__O_HfB span:nth-child(2)"
              )
              ?.textContent?.trim()
              .toUpperCase() || "";

          const isHomeTeam = homeTeamName === teamName.toUpperCase();
          const opponentName = isHomeTeam ? awayTeamName : homeTeamName;

          const score =
            matchDocument
              .querySelector(
                "#__next > main > div > div > div.xpaLayoutContainer.XpaLayout_xpaLayoutContainerFullWidth__arqR4.xpaLayoutContainerFullWidth--matchScore > div > div > div > div > div > p"
              )
              ?.textContent?.trim() || "";

          let result: "W" | "D" | "L" = "D";

          if (score) {
            const [homeScore, awayScore] = score.split(":").map(Number);
            if (isHomeTeam) {
              if (homeScore > awayScore) result = "W";
              else if (homeScore < awayScore) result = "L";
            } else {
              if (awayScore > homeScore) result = "W";
              else if (awayScore < homeScore) result = "L";
            }
          }

          pastGames.push({ opponent: opponentName, result, score });
          matchCount++;

          if (matchCount >= 5) {
            break;
          }
        }

        if (matchCount >= 5) {
          break;
        }
      }

      return pastGames;
    } catch (error) {
      console.error(`Error fetching past games for team ${teamName}:`, error);
      return [];
    }
  }

  async getTeamData(teamName: string): Promise<TeamData | null> {
    try {
      const teamInfo = await this.searchTeam(teamName);
      if (!teamInfo) return null;

      const { id, name } = teamInfo;
      const pastGames = await this.getPastGames(id, name);
      const recentForm = pastGames.map((game) => game.result);

      return {
        id,
        name,
        recentForm,
        pastGames,
      };
    } catch (error: any) {
      console.error(`Error fetching data for ${teamName}:`, error.message);
      return null;
    }
  }
}

export const oneFootballScraper = new OneFootballScraper();
