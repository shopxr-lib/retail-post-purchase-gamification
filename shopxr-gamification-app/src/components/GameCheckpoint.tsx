import { useGameStore } from "../stores/useGameStore";
import { BaseModal } from "../components";
import { Play } from "lucide-react";

interface IGameCheckpoint {
  game?: {
    name: string;
    detail: string;
    status: "idle" | "started";
    onStart: () => void;
  };
  startModal?: {
    visible: boolean;
    render: React.ReactNode;
  };
}

const GameCheckpoint = ({ game, startModal }: IGameCheckpoint): JSX.Element | null => {
  const credits = useGameStore((s) => s.remainingCredit);
  const initialized = useGameStore((s) => s.initialized);
  const expired = useGameStore((s) => s.expired);
  const gameSession = useGameStore((s) => s.gameSession);
  const storeURL = import.meta.env.VITE_STORE_URL;

  if (expired) {
    return (
      <BaseModal>
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-800">
          <div className="mb-4 text-6xl">⌛</div>
          <h2 className="mb-3 text-2xl font-bold text-red-500">Game Expired</h2>
          <p className="mb-6 max-w-md text-lg text-gray-600">
            This game session has expired. Please come back later or try again with a new session.
          </p>
          <a
            href={storeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black px-6 py-2 font-medium !text-white shadow-md transition hover:bg-gray-800"
          >
            Back to Store
          </a>
        </div>
      </BaseModal>
    );
  }

  if (credits !== null && credits >= 0 && initialized) return null;

  if ((credits ?? 0) > 0) {
    if (startModal && startModal.visible) return ( <>{startModal.render}</> );
    else if (!game || game.status === "started") return null;
    return (
      <BaseModal>
        <h1 className="!mb-4 !text-3xl !font-bold text-gray-700">{game.name}</h1>
        <p className="!mb-6 !text-lg text-gray-600">{game.detail}</p>
        <button
          type="button"
          onClick={game.onStart}
          className={`mx-auto flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2 font-semibold text-white transition-colors duration-200 ${
            gameSession.status === "loading"
              ? "bg-[#171717]! cursor-not-allowed"
              : "bg-black! hover:bg-black/90! hover:border-black!"
          }`}
        >
          {gameSession.status === "loading" ? (
            <>
              <span className="border-white! h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              Starting...
            </>
          ) : (
            <>
              <Play size={20} />
              Start Game
            </>
          )}
        </button>
      </BaseModal>
    );
  }

  const OutOfCreditModal = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-800">
        <h2 className="mb-3 text-2xl font-bold text-red-500">Out of Game Credits</h2>
        <p className="mb-6 max-w-md text-lg text-gray-600">
          You have used all your game credits. Earn more game credits by shopping with us again!
        </p>
        <a
          href={storeURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white! rounded-lg bg-black px-6 py-2 font-medium shadow-md transition hover:bg-gray-800"
        >
          Continue Shopping
        </a>
      </div>
    );
  };

  return (
    <>
      {startModal ? (
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <OutOfCreditModal />
        </div>
      ) : (
        <BaseModal>
          <OutOfCreditModal />
        </BaseModal>
      )}
    </>
  );
};

export default GameCheckpoint;
