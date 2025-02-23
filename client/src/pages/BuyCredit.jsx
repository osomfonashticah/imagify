import { loadStripe } from "@stripe/stripe-js";
import { useContext } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const BuyCredit = () => {
  const stripePromise = loadStripe(
    "pk_test_51Ln8TVCu4v08hYau4iclKLruIhiOzMKqhk5pIDfWE8siuZLLkx3W3jKB5hlASnJuZaVsfoNepVDy90pgwfNJulxx00BTe0XGnc"
  );
  const { user, backendUrl, loadCreditData, token, setShowLogin } =
    useContext(AppContext);

  const navigate = useNavigate();

  const paymentStripe = async (planId) => {
    try {
      if (!user) {
        setShowLogin(true);
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/payment/stripe-payment",
        { planId },
        { headers: { token } }
      );

      if (data.success) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6 ">
        Our Plans
      </button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">
        Choose the plan
      </h1>

      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((item, index) => (
          <div
            key={index}
            className="bg-white drop-shadow-sm rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500"
          >
            <img src={assets.logo_icon} alt="" width={40} />
            <p className="mt-3 mb-1 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium"> ${item.price} </span>/{" "}
              {item.credits} credits
            </p>
            <button
              onClick={() => paymentStripe(item.id)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52"
            >
              {user ? "Purchase" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredit;
