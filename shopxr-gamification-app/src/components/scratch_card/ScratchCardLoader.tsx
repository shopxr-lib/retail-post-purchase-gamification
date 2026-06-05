export const ScratchCardLoader = () => {
  return (
    <>
      <div className="scratch-spinner">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <style>
        {
          `
          .scratch-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            height: 96px;
            width: 96px;
            animation: rotate_3922 1.2s linear infinite;
            background-color: #9b59b6;
            background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
          }

          .scratch-spinner span {
            position: absolute;
            border-radius: 50%;
            height: 100%;
            width: 100%;
            background-color: #9b59b6;
            background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
          }

          .scratch-spinner span:nth-of-type(1) {
            filter: blur(5px);
          }

          .scratch-spinner span:nth-of-type(2) {
            filter: blur(10px);
          }

          .scratch-spinner span:nth-of-type(3) {
            filter: blur(25px);
          }

          .scratch-spinner span:nth-of-type(4) {
            filter: blur(50px);
          }

          .scratch-spinner::after {
            content: "";
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            background-color: #232323;
            border: solid 5px #232323;
            border-radius: 50%;
          }

          @keyframes rotate_3922 {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }

            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

      `
        }
      </style>
    </>
  )
}