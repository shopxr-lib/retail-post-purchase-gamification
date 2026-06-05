import { getFileUrl, getPrizeMessage } from "@src/utils";
import type { IPrize } from "@src/types";
import type { PrizeInfo, TreasureLogicReturn } from "./types";

export const useTreasureLogic = (
): TreasureLogicReturn => {
  //* Get prize display information
  const getPrizeInfo = (prize: IPrize): PrizeInfo => {
    const imageUrl =
      getFileUrl(prize.imageFile) ??
      (prize.type === 4
        ? "/game_assets/treasure_box/box_empty.webp"
        : "/game_assets/treasure_box/box_prize1.webp");

    const text = getPrizeMessage(prize);

    return {
      prize,
      text,
      imageUrl,
    };
  };

  return {
    getPrizeInfo,
  };
};
