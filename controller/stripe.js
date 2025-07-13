require("dotenv").config();
const prisma = require("../config/prisma");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
    });
    const amountTH = cart.cartTotal * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTH,
      currency: "thb",
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("PaymentIntent creation failed:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
