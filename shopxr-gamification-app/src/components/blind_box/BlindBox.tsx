import React from "react";
import { BlindBoxProvider } from "./BlindBoxContext";
import BlindBoxGame from "./BlindBoxGame";

const BlindBox:React.FC = () => {
  return (
    <BlindBoxProvider>
      <div className="">
        {/* Main Game Interface */}
        <BlindBoxGame />
      </div>
    </BlindBoxProvider>
  );
};

export default BlindBox;
