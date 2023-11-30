const express = require("express");
const app = express();
require("dotenv").config()

const cors = require("cors")
app.use(cors())

// TODO change this defore deploying to use the real key
const stripeKey = process.env.REACT_APP_STRIPE_TEST_SECRET_KEY

// TODO change this defore deploying to use the real key
// const stripeKey = process.env.REACT_APP_STRIPE_SECRET_KEY



const stripe = require("stripe")(stripeKey);
app.use(express.static("public"));
app.use(express.json());



app.post("/create-payment-intent", async (req, res) => {
  const { amount, id } = req.body;
 console.log("Payment Request Recieved", amount, id)
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


app.listen(3001, () => console.log("Node server listening on port 3001!"));