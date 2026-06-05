import { AlertCircle } from "lucide-react"

interface IErrorBanner {
  message: string;
  button?: React.ReactNode;
}

const ErrorBanner:React.FC<IErrorBanner> = ({ message, button }) => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center space-y-4 bg-red-500/10 border border-red-500/30 
                      rounded-xl px-8 py-6 shadow-lg w-full max-w-xl text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-2xl font-semibold text-red-600">
          Something went wrong!
        </h2>
        <p className="text-white-700">
          {message}
        </p>
        {button}
      </div>
    </div>
  )
}

export default ErrorBanner;