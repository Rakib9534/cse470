// This service now uses the MongoDB API via notificationAPI
// Keeping for backward compatibility but redirecting to API

import { notificationAPI } from './api.js';

export const getNotifications = async () => {
  try {
    const result = await notificationAPI.getAll();
    if (result.success) {
      return result.data || [];
    }
    // Fallback to localStorage if API fails
    return JSON.parse(localStorage.getItem("notifications")) || [];
  } catch (error) {
    // Fallback to localStorage if API fails
    return JSON.parse(localStorage.getItem("notifications")) || [];
  }
};

export const addNotification = async (notification) => {
  // Try to save to MongoDB via API
  try {
    const result = await notificationAPI.create(notification);
    if (!result.success) {
      throw new Error('Failed to create notification');
    }
  } catch (error) {
    // Fallback to localStorage if API fails
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    localStorage.setItem(
      "notifications",
      JSON.stringify([notification, ...notifications])
    );
  }
};

export const markAllAsRead = async () => {
  try {
    await notificationAPI.markAllAsRead();
  } catch (error) {
    // Fallback to localStorage if API fails
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updated));
  }
};
