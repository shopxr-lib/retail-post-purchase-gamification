import { GameType, PrizeType } from "./enums";

export const PRIZE_TYPES = [
  { value: 1, label: "Coupon Code", placeholder: "Enter coupon code, e.g. SUMMER20" },
  { value: 2, label: "Free Product", placeholder: "Product name, e.g. Tote Bag" },
  { value: 3, label: "Custom Prize", placeholder: "Prize description" },
  { value: 4, label: "No Prize", placeholder: "" },
];

export const GAME_CONFIG: Record<
  GameType,
  { label: string; description: string; bg: string; glowColor: string }
> = {
  [GameType.TreasureBox]: {
    label: "Treasure Box",
    description: "A chance-based game where customers are presented with three treasure boxes after making a purchase. They select one to unlock and reveal a surprise reward hidden inside. Simple, fast, and satisfying, a great way to add excitement post-checkout and make every order feel special.",
    bg: "from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300",
    glowColor: "rgba(245,158,11,0.3)",
  },
  [GameType.BlindBox]: {
    label: "Blind Box",
    description: "Three visually identical blind boxes are displayed, each holding a different hidden prize. Customers tap to choose and open one, discovering what’s inside in real time. The element of surprise creates an engaging moment that adds fun to the shopping experience and keeps customers coming back.",
    bg: "from-sky-50 to-blue-50 border-sky-200 hover:border-sky-300",
    glowColor: "rgba(14,165,233,0.3)",
  },
  [GameType.ThreeDTreausreBox]: {
    label: "3D Treasure Box",
    description: "A 3D treasure box appears on screen after a purchase. Customers must tap to unlock and reveal their reward. A satisfying interaction that builds anticipation, encourages participation and makes rewards feel earned.",
    bg: "from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300",
    glowColor: "rgba(168,85,247,0.3)",
  },
  [GameType.ScratchTheCard]: {
    label: "Scratch Card",
    description: "Modeled after the nostalgic scratch card experience, this game invites customers to ‘scratch’ a digital card to reveal a hidden prize beneath. It’s quick, visual, and engaging. Offering a playful post-purchase moment that turns every order into an opportunity to win.",
    bg: "from-green-50 to-emerald-50 border-green-200 hover:border-green-300",
    glowColor: "rgba(34,197,94,0.3)",
  },
  [GameType.Gachapon]: {
    label: "Gachapon",
    description: "Inspired by classic capsule toy machines, this game lets customers spin a virtual gachapon machine to receive a random prize. Each interaction builds anticipation as the capsule opens to reveal the reward inside, creating a fun, collectible-style experience that encourages repeat engagement.",
    bg: "from-red-50 to-orange-50 border-red-200 hover:border-red-300",
    glowColor: "rgba(239,68,68,0.3)",
  },
};

export const GAME_LABELS: Record<number, GameType> = {
  1: GameType.TreasureBox,
  2: GameType.BlindBox,
  3: GameType.ThreeDTreausreBox,
  4: GameType.ScratchTheCard,
  5: GameType.Gachapon,
};

export const PRIZE_CONFIG: Record<
  PrizeType,
  { description: string; congratulatory_message: string; icon: string }
> = {
  [PrizeType.Coupon]: {
    description:
      "Create a discount code from Shopify’s interface, and add the unique code here.",
    congratulatory_message: "Congratulations! You’ve won a free coupon code: (coupon code). Save it and use it on your next order to enjoy a surprise reward at checkout!",
    icon: "🎫"
  },
  [PrizeType.FreeProduct]: {
    description:
      "Select the product(s) from your store that you will like to give as a prize.",
    congratulatory_message: "Congratulations! You have won a free product. We will add this to your delivery order and will be on the way to you.",
    icon: "🛍️"
  },
  [PrizeType.CustomPrize]: {
    description: "*This is a custom prize that you can define, even if it is not currently listed in your store (e.g. a brand new iPhone 17). Simply enter the prize name accordingly.",
    congratulatory_message: "Congratulations! You have won the Special Prize: (special prize). We will contact you soon for the prize collection.",
    icon: "✨"
  },
  [PrizeType.NoPrize]: {
    description: "*No prize will be given out. Simply enter the prize name accordingly (e.g. “Better Luck Next Time”).",
    congratulatory_message: "Thank you for participating in our Shop & Win campaign. While you didn’t win this time, we hope you’ll join us again soon for more chances to win.",
    icon: "🎲"
  },
};

export const PRIZE_LABELS: Record<number, PrizeType> = {
  1: PrizeType.Coupon,
  2: PrizeType.FreeProduct,
  3: PrizeType.CustomPrize,
  4: PrizeType.NoPrize,
};