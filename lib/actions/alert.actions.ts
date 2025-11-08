'use server';

import AlertModel from '@/database/models/alert.model';
import { revalidatePath } from 'next/cache';
import { getStocksDetails } from './finnhub.actions';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Create a new alert
export const createAlert = async (alertData: AlertData) => {
  try {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    const newAlert = new AlertModel({
      ...alertData,
      userId: session.user.id,
      userEmail: session.user.email,
      threshold: parseFloat(alertData.threshold),
      isActive: true,
    });

    // Add to alerts
    const data = await newAlert.save();
    revalidatePath('/watchlist');

    return { success: true, message: 'Alert created successfully',  data: JSON.parse(JSON.stringify(data)), };
  } catch (error) {
    console.error('Error creating alert:', error);
    throw new Error('Failed to create alert');
  }
}

// Update an alert
export const updateAlert = async (alertId: string, alertData: AlertData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    const itemToUpdate = {
      ...alertData,
      symbol: alertData.symbol.toUpperCase(),
      threshold: parseFloat(alertData.threshold),
    };

    const data = await AlertModel.updateOne(
      { _id: alertId, userId: session.user.id },
      { $set: itemToUpdate }
    );
   revalidatePath('/watchlist');

    return {
      success: true,
      message: 'Alert updated successfully',
      data: JSON.parse(JSON.stringify(data)),
    };
  } catch (error) {
    console.error('Error updating alert:', error);
    throw new Error('Failed to update alert');
  }
}

// Delete an alert
export const deleteAlert = async (alertId: string) => {
  try {
     const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    await AlertModel.deleteOne({ _id: alertId, userId: session.user.id });
     revalidatePath('/watchlist');

    return {
      success: true,
      message: 'Alert deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw new Error('Failed to delete alert');
  }
}

// Get user's alerts with current stock data for display
export const getUserAlerts = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    const alerts = await AlertModel.find({
      userId: session.user.id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (alerts.length === 0) return [];

    return await Promise.all(
      alerts.map(async (alert) => {
        const stockData = await getStocksDetails(alert.symbol);
        return {
          id: String(alert._id),
          symbol: alert.symbol,
          company: alert.company,
          alertName: alert.alertName,
          currentPrice: stockData.currentPrice,
          alertType: alert.alertType,
          threshold: alert.threshold,
          changePercent: stockData.changePercent,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    throw new Error('Failed to fetch user alerts');
  }
}
