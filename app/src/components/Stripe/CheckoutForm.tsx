import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { PaymentRecord, useUpdateUserPaymentRecord } from "hooks/accountpaymenthistory"
import { StripePaymentElementOptions } from "@stripe/stripe-js";
import { useDashboard } from 'store/dashboard';
import { useNavigate } from 'react-router-dom';

interface Props {
  // title: string;
  clientSecret: string;
  open: boolean;
  onClose: () => void;
  // onConfirm: () => void;
}

export const CheckoutForm: React.FC<Props> = ({
//   title,
clientSecret,
open,
onClose,
//   onConfirm
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useDashboard();

  const { uploadPaymentHistory } = useUpdateUserPaymentRecord();

  const updateUserPaymentRecord = (paymentIntent: string | null) => {
    const newPaymentRecord: PaymentRecord = {
      paymentAmount: 5.00,
      user: user.name,
      email: user.email,
      paymentEmail: email,
      paymentIntent: paymentIntent,
      freePlaysRemaining: 0,
      timestamp: new Date().toString(),
    };

    uploadPaymentHistory(newPaymentRecord);
  };
  useEffect(() => {
    if (!stripe) {
      return;
    }

    

    if (!clientSecret) {
      return;
    }
  

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          console.log("SUCCESS PAYMENT");
          setMessage("Payment succeeded!");
          const paymentIntentParam = new URLSearchParams(
            window.location.search
          ).get("payment_intent");
          console.log("PAYMENT INTENT", paymentIntentParam);
          updateUserPaymentRecord(paymentIntentParam);
          navigate('/match');
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    const urlBase =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    const returnUrl = urlBase + '/match';
    await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    }).then(({ error }) => {
      const paymentIntentParam = new URLSearchParams(
        window.location.search
      ).get("payment_intent");
      updateUserPaymentRecord(paymentIntentParam);
      console.log("updatedFromtheHandleSubmitThing");
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    );
    setIsLoading(false);
  };

  const paymentElementOptions:StripePaymentElementOptions = {
    layout: "tabs"
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(event:any) => setEmail(event.value.email)}
      />
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}