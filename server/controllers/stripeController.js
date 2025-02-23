import transactionModel from "../models/TransactionModel.js";
import User from "../models/User.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripePayment = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const user = await User.findById(userId);

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

    //date = Date.now();

    // const transactionData = {
    //   userId,
    //   plan,
    //   credits,
    //   amount,
    //   date,
    // };

    // const newTransaction = await transactionModel.create(transactionData);

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
    event = stripeInstance.webhooks.constructEvent(
      req.body, // Must be raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const credits = Number(session.metadata?.credits);
    const plan = session.metadata?.plan;
    const amount = session.amount_total / 100; // Convert cents to dollars
    const sessionId = session.id; // Unique session ID from Stripe

    if (!userId || isNaN(credits)) {
      console.error("❌ Invalid session metadata:", session.metadata);
      return res
        .status(400)
        .json({ success: false, message: "Invalid metadata" });
    }

    try {
      // 1️⃣ Check if a transaction for this session already exists
      let existingTransaction = await transactionModel.findOne({ sessionId });

      if (existingTransaction) {
        if (existingTransaction.payment === false) {
          // If payment was false, update it to true instead of inserting a new record
          existingTransaction.payment = true;
          await existingTransaction.save();

          // 2️⃣ Only now, update user's credit balance
          await User.findByIdAndUpdate(userId, {
            $inc: { creditBalance: credits },
          });

          console.log(
            `✅ Payment confirmed! ${credits} credits added for user ${userId}`
          );
        } else {
          console.log(
            `⚠️ Duplicate transaction ignored for session ${sessionId}`
          );
        }

        return res
          .status(200)
          .json({ success: true, message: "Transaction updated" });
      }

      // 3️⃣ If no transaction exists, create a new one and mark it as paid
      await transactionModel.create({
        userId,
        plan,
        credits,
        amount,
        payment: true, // Payment confirmed
        sessionId, // Prevent duplicates
        date: new Date(),
      });

      // 4️⃣ Now, update user's credits
      await User.findByIdAndUpdate(userId, {
        $inc: { creditBalance: credits },
      });

      console.log(
        `✅ Payment successful! ${credits} credits added for user ${userId}`
      );
    } catch (dbError) {
      console.error("❌ Database update error:", dbError);
      return res
        .status(500)
        .json({ success: false, message: "Database update failed" });
    }
  }

  res.json({ received: true });
};
