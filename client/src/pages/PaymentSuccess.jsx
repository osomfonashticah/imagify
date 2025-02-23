import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/"); // Redirect to dashboard after payment
    }, 3000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-6 text-center max-w-sm">
        <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center rounded-full mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mt-4">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">Redirecting you shortly...</p>
        <div className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 animate-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
