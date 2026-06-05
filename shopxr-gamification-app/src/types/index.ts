import type { ScreenPosition } from "@src/constants/enums";

export interface CustomFile {
  id: string | null;
  url: File | string | null;
}

export interface IWinningProbability {
  mode: number;
  value: number | null;
}

export interface IBasePrize {
  id: number;
  name: string;
  message?: string;
  winningProbability: IWinningProbability;
  imageFile: CustomFile | null;
}

export interface ICouponPrize extends IBasePrize {
  type: number;
  value: string;
}

export interface IFreeProductPrize extends IBasePrize {
  type: number;
  value: string;
}

export interface ICustomPrize extends IBasePrize {
  type: number;
  value: string;
}

export interface INoPrize extends IBasePrize {
  type: number;
  value: string;
}

export type IPrize =
  | ICouponPrize
  | IFreeProductPrize
  | ICustomPrize
  | INoPrize;

export interface IWidgetSettings {
  creditPerAmount: number,
  iconDisplay: boolean;
  iconBg: string;
  iconColor: string;
  position: ScreenPosition;
  verticalPosVal: number;
  horizontalPosVal: number;
}