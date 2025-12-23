import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStripe as useStripeContext } from '../../contexts/StripeContext';
import styles from './StripeCheckout.module.css';

const CheckoutForm = ({ orderId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-result?orderId=${orderId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      if (onError) onError(error);
    }
    // Nếu không có error, Stripe sẽ tự động redirect
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <PaymentElement />
      
      {errorMessage && (
        <div className={styles.error}>{errorMessage}</div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className={styles.submitButton}
      >
        {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
      </button>
    </form>
  );
};

const StripeCheckout = ({ orderId, clientSecret, onSuccess, onError }) => {
  const stripePromise = useStripeContext();

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#667eea',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      }
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        orderId={orderId} 
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripeCheckout;