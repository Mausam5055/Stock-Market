import { Schema, model, models, Document } from 'mongoose';

export interface Alert extends Document {
  userId: string;
  userEmail: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  isActive: boolean;
  createdAt: Date;
  lastSent?: Date;
}

const AlertSchema = new Schema<Alert>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  alertName: {
    type: String,
    required: true,
    trim: true
  },
  alertType: {
    type: String,
    required: true,
    enum: ['upper', 'lower']
  },
  threshold: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastSent: {
    type: Date,
    default: null
  }
});

// Compound indexes for efficient queries
AlertSchema.index({ userId: 1, symbol: 1, alertType: 1 });
AlertSchema.index({ userId: 1, isActive: 1 });
AlertSchema.index({ symbol: 1, alertType: 1, isActive: 1 });

const AlertModel = models?.Alert || model<Alert>('Alert', AlertSchema);

export default AlertModel;