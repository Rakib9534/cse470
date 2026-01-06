import { useEffect, useState } from "react";
import {
  getNotifications,
  markAllAsRead
} from "../services/notificationService";
import { notificationAPI } from "../services/api";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const result = await notificationAPI.getAll();
        if (result.success) {
          setNotifications(result.data || []);
        } else {
          // Fallback to local service
          const localNotifications = await getNotifications();
          setNotifications(localNotifications);
        }
      } catch (error) {
        // Fallback to local service
        const localNotifications = await getNotifications();
        setNotifications(localNotifications);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleBell = async () => {
    if (open) {
      // Mark all as read when closing
      try {
        await notificationAPI.markAllAsRead();
      } catch (error) {
        await markAllAsRead();
      }
      // Reload notifications
      const result = await notificationAPI.getAll();
      if (result.success) {
        setNotifications(result.data || []);
      } else {
        const localNotifications = await getNotifications();
        setNotifications(localNotifications);
      }
    }
    setOpen(!open);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (open && !event.target.closest('.notification-bell-container')) {
        setOpen(false);
        try {
          await notificationAPI.markAllAsRead();
        } catch (error) {
          await markAllAsRead();
        }
        // Reload notifications
        const result = await notificationAPI.getAll();
        if (result.success) {
          setNotifications(result.data || []);
        } else {
          const localNotifications = await getNotifications();
          setNotifications(localNotifications);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="notification-bell-container" style={{ position: "relative" }}>
      <button
        onClick={toggleBell}
        className="notification-bell-btn"
        aria-label="Notifications"
        style={{
          fontSize: "20px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "0.5rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          transition: "all 0.2s ease",
          position: "relative",
          width: "40px",
          height: "40px"
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "var(--bg-tertiary)";
          e.target.style.color = "var(--primary-color)";
          e.target.style.borderColor = "var(--primary-color)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "var(--bg-secondary)";
          e.target.style.color = "var(--text-secondary)";
          e.target.style.borderColor = "var(--border-color)";
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "var(--accent-color)",
              color: "white",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: "600",
              padding: "2px 6px",
              minWidth: "18px",
              textAlign: "center",
              lineHeight: "1.2",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-dropdown"
          style={{
            position: "absolute",
            right: 0,
            top: "48px",
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            padding: "0.5rem",
            zIndex: 1000,
            animation: "slideDown 0.2s ease"
          }}
        >
          <div style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: "600",
              color: "var(--text-primary)"
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                background: "var(--bg-secondary)",
                padding: "0.25rem 0.5rem",
                borderRadius: "var(--radius-md)"
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div style={{
              padding: "2rem 1rem",
              textAlign: "center",
              color: "var(--text-tertiary)"
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: "0 auto 0.5rem", opacity: 0.5 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ margin: 0, fontSize: "0.875rem" }}>No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map(n => (
              <div
                key={n._id || n.id}
                style={{
                    padding: "0.75rem",
                    borderBottom: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "0.25rem",
                    background: n.read ? "transparent" : "var(--primary-lighter)",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = n.read ? "transparent" : "var(--primary-lighter)";
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: n.read ? "transparent" : "var(--primary-color)",
                      marginTop: "0.375rem",
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "0.8125rem",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                        marginBottom: "0.25rem"
                      }}>
                        {n.title || "Lab Report"}
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        lineHeight: "1.4"
                      }}>
                        {n.message}
                      </p>
                      {(n.timestamp || n.createdAt) && (
                        <div style={{
                          fontSize: "0.75rem",
                          color: "var(--text-tertiary)",
                          marginTop: "0.5rem"
                        }}>
                          {new Date(n.timestamp || n.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
