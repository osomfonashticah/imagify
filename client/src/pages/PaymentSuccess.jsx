import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/"); // Redirect to dashboard after payment
    }, 3000);
  }, []);

  return <h2>Payment Successful! Redirecting...</h2>;
};

export default PaymentSuccess;
