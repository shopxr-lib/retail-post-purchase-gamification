import { useGameStore } from "@src/stores/useGameStore";
import { BaseModal } from "@src/components";
import { Play } from "lucide-react";

interface IGameCheckpoint {
  game?: {
    name: string;
    detail: string;
    status: 'idle' | 'started'
    onStart: () => void;
  }
  startModal?: {
    visible: boolean;
    render: React.ReactNode;
  };
}

const GameCheckpoint:React.FC<IGameCheckpoint> = ({ game, startModal }) => {
  const credits = useGameStore(s => s.remainingCredit); 
  const initialized = useGameStore(s => s.initialized);
  const expired = useGameStore(s => s.expired);
  const gameSession = useGameStore(s => s.gameSession);
  const storeURL = import.meta.env.VITE_STORE_URL;

  if (expired) {
    return (
      <BaseModal>
        <div className="flex flex-col items-center justify-center p-8 text-center text-gray-800">
          <div className="text-6xl mb-4">⌛</div>
          <h2 className="text-2xl font-bold text-red-500 mb-3">Game Expired</h2>
          <p className="text-gray-600 text-lg mb-6 max-w-md">
            This game session has expired. Please come back later or try again with
            a new session.
          </p>
          <a
            href={storeURL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-black hover:bg-gray-800 !text-white font-medium rounded-lg shadow-md transition"
          >
            Back to Store
          </a>
        </div>
      </BaseModal>
    )
  }

  if (credits !== null && credits >= 0 && initialized) return null;

  if (credits && credits > 0) {
    if (startModal && startModal.visible) return startModal.render;
    else if (!game || game.status === 'started') return null;
    return (
      <BaseModal>
        <h1 className="!text-3xl !font-bold text-gray-700 !mb-4">
          {game.name}
        </h1>
        <p className="text-gray-600 !mb-6 !text-lg">
          {game.detail}
        </p>
        <button
          type="button"
          onClick={game.onStart}
          className={`
            text-white font-semibold py-2 px-6 rounded-lg 
            transition-colors duration-200 flex items-center 
            gap-2 mx-auto cursor-pointer
            ${gameSession.status === 'loading' 
              ? "bg-[#171717]! cursor-not-allowed" 
              : "bg-black! hover:bg-black/90! hover:border-black!"
            }`}

        >
          {gameSession.status === 'loading'  ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white! border-t-transparent rounded-full" />
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
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Out of Game Credits
        </h2>
        <p className="text-gray-600 text-lg mb-6 max-w-md">
          You have used all your game credits. Earn more game credits by shopping with us again!
        </p>
        <a
          href={storeURL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-black hover:bg-gray-800 text-white! font-medium rounded-lg shadow-md transition"
        >
          Continue Shopping
        </a>
      </div>
    )
  }
  
  return (
    <>
      {startModal 
          ? <div className="bg-white rounded-xl p-8 shadow-lg"><OutOfCreditModal /></div>
          : <BaseModal>
              <OutOfCreditModal />
            </BaseModal>
        }
    </>
  )
}

export default GameCheckpoint;