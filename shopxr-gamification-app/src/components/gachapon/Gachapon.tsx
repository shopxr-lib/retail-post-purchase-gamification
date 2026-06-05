import { GachaponProvider } from "./GachaponContext";
import GachaponLogic from "./GachaponLogic";
import GachaponGame from "./GachaponGame";

const Gachapon = () => {
  return (
    <GachaponProvider>
      <GachaponLogic>
        <GachaponGame />
      </GachaponLogic>
    </GachaponProvider>
  );
};

export default Gachapon;