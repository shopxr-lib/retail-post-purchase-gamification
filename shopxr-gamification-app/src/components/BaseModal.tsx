interface IBaseModalProps {
  children: React.ReactNode;
}

const BaseModal: React.FC<IBaseModalProps> = ({ children  }) => {
    return (
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 flex items-center justify-center z-55">
        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-10">
          <div className="text-center">
            {children}
          </div>
        </div>
      </div>
    );
  };

export default BaseModal;