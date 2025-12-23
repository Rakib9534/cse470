export const getNotifications = () => {
  return JSON.parse(localStorage.getItem("notifications")) || [];
};

export const addNotification = (notification) => {
  const notifications = getNotifications();
  localStorage.setItem(
    "notifications",
    JSON.stringify([notification, ...notifications])
  );
};

export const markAllAsRead = () => {
  const notifications = getNotifications().map(n => ({
    ...n,
    read: true
  }));
  localStorage.setItem("notifications", JSON.stringify(notifications));
};
