// client/src/pages/customer/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeAPI, bookingAPI } from '../../utils/api';
import { PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({
  payableAmount,
  paymentStage,
  depositPercentage,
  minimumAdvanceAmount,
  isMinimumAdvance,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard/customer?paid=true` },
    });
    if (error) {
      toast.error(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '.65rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--lime)' }}>💳 Payment Details</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.72rem', color: 'var(--muted)' }}>
            <Lock size={11} /> Secured by Stripe
          </div>
        </div>
        <PaymentElement />
      </div>

      <div style={{ background: 'var(--lime-dim)', border: '1px solid rgba(168,255,62,.22)', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderRadius: 2 }}>
        <div>
          <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
            {paymentStage === 'remaining'
              ? 'Remaining balance due today'
              : isMinimumAdvance
              ? 'Minimum advance deposit due today'
              : depositPercentage > 0
                ? `Deposit due today (${depositPercentage}%)`
                : 'Deposit due today'}
          </div>
          {paymentStage !== 'remaining' && minimumAdvanceAmount > 0 && (
            <div style={{ fontSize: '.7rem', color: 'rgba(168,255,62,.75)', marginTop: '.1rem' }}>
              Minimum advance: A${minimumAdvanceAmount.toFixed(2)}
            </div>
          )}
          {paymentStage !== 'remaining' && (
            <div style={{ fontSize: '.7rem', color: 'rgba(168,255,62,.5)', marginTop: '.1rem' }}>Remaining balance due before your event</div>
          )}
        </div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: 'var(--lime)' }}>A${payableAmount?.toFixed(2)}</div>
      </div>

      <button type="submit" className="btn btn-lime btn-full" style={{ padding: '1rem' }} disabled={loading || !stripe}>
        {loading ? <><Loader2 size={14} style={{ animation: 'spin .8s linear infinite' }} /> Processing...</> : `Pay A$${payableAmount?.toFixed(2)} ${paymentStage === 'remaining' ? 'Remaining Amount' : 'Advance'}`}
      </button>
      <p style={{ fontSize: '.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '.7rem' }}>
        Your payment is encrypted and secure. You'll receive a confirmation email immediately.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const [clientSecret, setClientSecret] = useState('');
  const [payableAmount, setPayableAmount] = useState(0);
  const [paymentStage, setPaymentStage] = useState('deposit');
  const [depositPercentage, setDepositPercentage] = useState(0);
  const [minimumAdvanceAmount, setMinimumAdvanceAmount] = useState(0);
  const [isMinimumAdvance, setIsMinimumAdvance] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const bookingRes = await bookingAPI.getOne(bookingId);
        const bookingData = bookingRes.data.data;
        setBooking(bookingData);

        const shouldPayRemaining = bookingData?.paymentStatus === 'deposit_paid';
        const paymentRes = shouldPayRemaining
          ? await stripeAPI.createRemainingPaymentIntent(bookingId)
          : await stripeAPI.createPaymentIntent(bookingId);

        const paymentData = paymentRes.data;
        setClientSecret(paymentData.clientSecret);
        setPaymentStage(paymentData.paymentStage || (shouldPayRemaining ? 'remaining' : 'deposit'));
        setPayableAmount(
          Number(
            shouldPayRemaining
              ? paymentData.remainingAmount
              : paymentData.depositAmount
          ) || 0
        );
        setDepositPercentage(paymentData.depositPercentage || 0);
        setMinimumAdvanceAmount(paymentData.minimumAdvanceAmount || 0);
        setIsMinimumAdvance(Boolean(paymentData.isMinimumAdvance));
      } catch (e) {
        toast.error(e.response?.data?.error || 'Failed to init payment');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [bookingId]);

  if (loading) return <div style={{ paddingTop: 60 }}><PageLoader /></div>;

  return (
    <div style={{ paddingTop: 60, minHeight: '100vh' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Link to="/dashboard/customer" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>

        <div className="eyebrow" style={{ marginBottom: '.5rem' }}><div className="eyebrow-line" /><span className="eyebrow-text">Secure Payment</span></div>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: '3rem', letterSpacing: '.03em', lineHeight: 1, marginBottom: '.5rem' }}>
          Secure Your <span style={{ color: 'var(--lime)' }}>Booking</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '2rem' }}>
          {paymentStage === 'remaining'
            ? `Pay your remaining balance to complete payment with ${booking?.djProfile?.stageName}.`
            : `Pay your required advance deposit to lock in your date with ${booking?.djProfile?.stageName}.`}
        </p>

        {booking && (
          <div className="card" style={{ padding: '1rem 1.2rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
            {[
              ['DJ', booking.djProfile?.stageName],
              ['Event', booking.eventType],
              ['Date', new Date(booking.eventDate).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })],
              ['Venue', booking.location],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{l}</div>
                <div style={{ fontSize: '.82rem', fontWeight: 500, marginTop: '.15rem' }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {clientSecret ? (
          <Elements stripe={stripePromise} options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: { colorPrimary: '#a8ff3e', colorBackground: '#111511', colorText: '#eef5e8', fontFamily: "'DM Sans', sans-serif", borderRadius: '2px' },
            },
          }}>
            <CheckoutForm
              payableAmount={payableAmount}
              paymentStage={paymentStage}
              depositPercentage={depositPercentage}
              minimumAdvanceAmount={minimumAdvanceAmount}
              isMinimumAdvance={isMinimumAdvance}
            />
          </Elements>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin .8s linear infinite', color: 'var(--lime)', display: 'block', margin: '0 auto 1rem' }} />
            Initialising payment...
          </div>
        )}
      </div>
    </div>
  );
}
