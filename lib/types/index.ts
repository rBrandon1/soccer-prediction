export interface Team {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: Team["team"];
    away: Team["team"];
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface PredictionData {
  homeTeam: string;
  awayTeam: string;
  userPrediction: "homeWin" | "awayWin" | "draw";
}

export interface PredictionResult {
  homeTeam: Team["team"];
  awayTeam: Team["team"];
  predictedOutcome: "homeWin" | "awayWin" | "draw";
  confidence: number;
  homeRecentGames: string[];
  awayRecentGames: string[];
}
