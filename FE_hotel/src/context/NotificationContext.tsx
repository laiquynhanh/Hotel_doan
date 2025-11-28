import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timeout?: number; // ms
}

interface NotificationContextValue {
  notifications: Notification[];
  notify: (type: NotificationType, message: string, timeout?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Heuristic classification of message strings (Vietnamese focus)
function classifyMessage(message: string): NotificationType {
  const lower = message.toLowerCase();
  // Success patterns
  if (/thành công|successful|đã (tạo|cập nhật|xóa)|created|updated|deleted/.test(lower)) return 'success';
  // Error patterns
  if (/không thể|lỗi|error|fail|không tìm thấy|đã được đặt/.test(lower)) return 'error';
  // Warning patterns
  if (/chưa|cảnh báo|warning|vui lòng|hãy/.test(lower)) return 'warning';
  // Default to info
  return 'info';
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifyRef = useRef<(type: NotificationType, message: string, timeout?: number) => void>();

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((type: NotificationType, message: string, timeout: number = 4000) => {
    const id = Math.random().toString(36).slice(2);
    const notif: Notification = { id, type, message, timeout };
    setNotifications(prev => [...prev, notif]);
    if (timeout > 0) {
      setTimeout(() => remove(id), timeout);
    }
  }, [remove]);

  notifyRef.current = notify;

  const clear = useCallback(() => setNotifications([]), []);

  // Optional: limit max notifications
  useEffect(() => {
    if (notifications.length > 6) {
      setNotifications(prev => prev.slice(prev.length - 6));
    }
  }, [notifications]);

  // Globally override window.alert to route messages through toast
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: unknown) => {
      const msg = String(message ?? '');
      const type = classifyMessage(msg);
      notifyRef.current?.(type, msg);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
