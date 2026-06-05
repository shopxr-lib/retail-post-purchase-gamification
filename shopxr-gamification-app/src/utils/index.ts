import { PRIZE_LABELS, PRIZE_VALUES } from "@src/constants";
import type { CustomFile, IPrize } from "@src/types";

export const getFileUrl = (
  file: CustomFile | File | null | undefined,
): string | undefined => {
  if (!file) return undefined;

  const url = (file as CustomFile)?.url;

  if (!url) return undefined;

  return url instanceof File
    ? window.URL.createObjectURL(url)
    : (url as string);
};

export const extractToken = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  return token;
};

export const extractCampaignId = () => {
  const params = new URLSearchParams(window.location.search);
  const campaignId = params.get("campaignId");
  return campaignId;
};

export const capitalize = (s: string) =>
  s
    ? s
        .split(" ")
        .map((word) =>
          word
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("-"),
        )
        .join(" ")
    : "";

export const getPrizeMessage = (prize: IPrize): string => {
  if (prize.message?.trim()) return prize.message;

  const base = PRIZE_VALUES[PRIZE_LABELS[prize.type]].congratulatory_message;

  const value = prize.value;

  const placeholder =
    prize.type === 1
      ? "(coupon code)"
      : prize.type === 2
      ? "product"
      : "(special prize)";

  return value?.trim() ? base.replace(placeholder, value) : base;
};

export const getGameHeader = (credits: number): string => {
  const creditText = `${credits} game ${credits === 1 ? "credit" : "credits"}`;
  const actionText =
    credits > 0
      ? "Select to start and win your prize."
      : "Shop to earn more game credits.";

  return `You have ${creditText} left. ${actionText}`;
};