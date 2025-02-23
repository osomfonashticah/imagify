import transactionModel from "../models/TransactionModel.js";
import UserModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripePayment = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    let credits, plan, amount, date;

    switch (planId) {
      case "Basic":
        credits = 100;
        plan = "Basic";
        amount = 10;
        break;
      case "Advanced":
        credits = 500;
        plan = "Advanced";
        amount = 50;
        break;
      case "Business":
        credits = 5000;
        plan = "Business";
        amount = 250;
        break;
      default:
        return res.json({ success: false, message: "Invalid Plan" });
    }

    date = Date.now();

    const transactionData = {
      userId,
      plan,
      credits,
      amount,
      date,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} AI Image Credits`,
            },
            unit_amount: amount * 100, // Assuming $1 per credit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/buy`,
      metadata: {
        userId,
        credits,
        plan,
      },
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Payment failed" });
  }
};

// verify stripe payment

export const verifyPayment = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // This must be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const credits = Number(session.metadata.credits);
    const plan = session.metadata.plan;

    try {
      // Update user's credit balance
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { creditBalance: credits },
      });

      // Save transaction only after successful payment
      await transactionModel.create({
        userId,
        plan,
        credits,
        amount: session.amount_total / 100, // Convert cents to dollars
        payment: true,
        date: new Date(),
      });

      console.log(
        `✅ Payment successful! ${credits} credits added to user ${userId}`
      );
    } catch (dbError) {
      console.error("❌ Database update error:", dbError);
      return res
        .status(500)
        .json({ success: false, message: "Database update failed" });
    }
  }

  res.json({
    received: true,
  });
};
