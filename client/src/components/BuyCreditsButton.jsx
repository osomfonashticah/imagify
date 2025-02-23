import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const stripePromise = loadStripe(
  "pk_test_51Ln8TVCu4v08hYau4iclKLruIhiOzMKqhk5pIDfWE8siuZLLkx3W3jKB5hlASnJuZaVsfoNepVDy90pgwfNJulxx00BTe0XGnc"
); // Replace with your Stripe Public Key

const BuyCreditsButton = ({ credits }) => {
  const { backendUrl, token } = useContext(AppContext);

  const handleBuyCredits = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/payment/stripe-payment`,
        {
          credits,
        },
        { headers: { token } }
      );

      if (data.success) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return <button onClick={handleBuyCredits}>Buy {credits} Credits</button>;
};

export default BuyCreditsButton;
