import { PrizeType } from "./enums";

export const PRIZE_LABELS: Record<number, PrizeType> = {
  1: PrizeType.Coupon,
  2: PrizeType.FreeProduct,
  3: PrizeType.CustomPrize,
  4: PrizeType.NoPrize
}

export const PRIZE_VALUES: Record<
  PrizeType,
  { value: number; description: string; congratulatory_message: string }
> = {
  [PrizeType.Coupon]: {
    value: 1,
    description:
      "Create a discount code from Shopify’s interface, and add the unique code here.",
    congratulatory_message: "Congratulations! You’ve won a free coupon code: (coupon code). Save it and use it on your next order to enjoy a surprise reward at checkout!"
  },
  [PrizeType.FreeProduct]: {
    value: 2,
    description:
      "Select the product(s) from your store that you will like to give as a prize.",
    congratulatory_message: "Congratulations! You have won a free product. We will add this to your delivery order and will be on the way to you."
  },
  [PrizeType.CustomPrize]: {
    value: 3,
    description: "*This is a custom prize that you can define, even if it is not currently listed in your store (e.g. a brand new iPhone 17). Simply enter the prize name accordingly.",
    congratulatory_message: "Congratulations! You have won the Special Prize: (special prize). We will contact you soon for the prize collection."
  },
  [PrizeType.NoPrize]: {
    value: 4,
    description: "*No prize will be given out. Simply enter the prize name accordingly (e.g. “Better Luck Next Time”).",
    congratulatory_message: "Thank you for participating in our Shop & Win campaign. While you didn’t win this time, we hope you’ll join us again soon for more chances to win."
  },
};