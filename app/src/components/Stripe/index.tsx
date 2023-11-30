import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Modal, Stack, Typography, Divider, Box } from '@mui/material';
import { CheckoutForm } from './CheckoutForm';
import './app.css';
import { useDashboard } from 'store/dashboard';

// For testing: 
//  -   uncomment the component with  text: 'TEST PAYMENT', in 
//      app/src/components/Stripe/CheckoutForm.tsx to easily open payment form
//  -   refer to the testing information on setting stripe user configurations to 
//      testing mode and use the testing cards noted:
//      -   https://stripe.com/docs/test-mode
//      -   https://stripe.com/docs/testing#cards
//  -   Server configuration may differ and require debugging/adjusting upon deployment
//  -   Remember to change the key used in the stripe server to the prod one when you 
//      go live so charges go through

const stripePromise = loadStripe(
  process.env.NODE_ENV === 'development'
    ? (process.env.REACT_APP_STRIPE_TEST_PUBLISHABLE_KEY as string)
    : (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY as string)
);
interface Props {

  open: boolean;
  onClose: () => void;
}

export const Stripe: React.FC<Props> = ({ open, onClose }) => {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: '15px',
    boxShadow: 24,
    p: 4
  };
  const { user } = useDashboard();
  const [clientSecret, setClientSecret] = useState('');
  const urlBase =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';

  const description =
    'Monthly access is $5.00 USD. Submit your payment details below to subscribe for one month of access. For questions or issues, please reach out to support@audio-dashboard.com.';
  // Update this if there is an issue with the redirections or server location
  useEffect(() => {
    const paymentIntentUrl = urlBase + '/create-payment-intent';
    // Create PaymentIntent as soon as the page loads
    // note that the amount of charge is in cents ie: 500 = $5 usd
    fetch(paymentIntentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 500, id: user })
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Stack
          direction={'column'}
          spacing={2}
          justifyContent={'center'}
          display={'flex'}
          alignItems={'center'}
        >
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2, marginBottom: '10px' }}
          >
            {description}
          </Typography>

          <div className="StripeInput">
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  open={true}
                  onClose={onClose}
                  clientSecret={clientSecret}
                />
              </Elements>
            )}
          </div>
        </Stack>
      </Box>
    </Modal>
  );
};