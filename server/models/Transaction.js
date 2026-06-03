const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    djProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DJProfile', required: true, index: true },

    paymentIntentId: { type: String, required: true, unique: true, index: true },
    chargeId: { type: String, default: '', index: true },
    stripeEventId: { type: String, default: '' },

    type: { type: String, enum: ['deposit', 'remaining', 'refund', 'unknown'], default: 'unknown' },
    status: {
      type: String,
      enum: [
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'succeeded',
        'canceled',
        'failed',
      ],
      default: 'processing',
    },

    amount: { type: Number, required: true, min: 0 }, // in major currency units
    currency: { type: String, default: 'aud' },
    paymentMethodType: { type: String, default: '' },
    receiptUrl: { type: String, default: '' },
    failureMessage: { type: String, default: '' },

    stripeCreatedAt: { type: Date },
    processedAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

transactionSchema.index({ booking: 1, createdAt: -1 });
transactionSchema.index({ customer: 1, createdAt: -1 });
transactionSchema.index({ djProfile: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
