import { extractCampaignId, extractToken } from "@src/utils";

const token = extractToken() ?? "";
const campaignId = extractCampaignId() ?? "";
const appURL = import.meta.env.VITE_RETAIL_APP_URL ?? "";

async function fetchGameAPI(params: Record<string, string | number>) {
  if (!appURL)  {
    return {
      error: "The game service is currently unavailable. Please try again later.",
      message: "Network error",
      status: 503,
    };
  }

  if (!token) {
    return {
      error: "Unauthorized access.",
      message: "Missing authentication credentials.",
      status: 401,
    };
  }
  
  const query = new URLSearchParams({ ...params, token, campaignId }).toString();
  try {
    const res = await fetch(`${appURL}/api/game?${query}`);
    const data = await res.json();
    return { ...data, status: res.status };
  } catch (error) {
    return {
      message: "Network error",
      error: error instanceof Error ? error.message : String(error),
      status: 500,
    };
  }
}

const getGameData = () => fetchGameAPI({ mode: "start" });
const startGameSession = (gameType: number) => fetchGameAPI({ mode: "play", gameType });
const addPrizeWon = (prizeID: number, gameType: number) => fetchGameAPI({ prizeId: prizeID, gameType });

export { getGameData, startGameSession, addPrizeWon };
