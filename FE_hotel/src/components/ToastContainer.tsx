import React from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../context/NotificationContext';
import './toast.css';

const iconFor: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export const ToastContainer: React.FC = () => {
  const { notifications, remove } = useNotifications();

  if (notifications.length === 0) return null;

  const content = (
    <div 
      className="toast-container"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '340px',
        pointerEvents: 'none'
      }}
    >
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`toast toast-${n.type}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            background: '#1f2937',
            color: '#fff',
            padding: '0.75rem 0.9rem',
            borderRadius: '6px',
            boxShadow: '0 4px 16px -2px rgba(0,0,0,0.4)',
            fontSize: '0.875rem',
            lineHeight: '1.2',
            animation: 'fadeInScale 160ms ease-out',
            position: 'relative',
            borderLeft: n.type === 'success' ? '5px solid #10b981' : 
                        n.type === 'error' ? '5px solid #ef4444' :
                        n.type === 'info' ? '5px solid #3b82f6' :
                        '5px solid #f59e0b',
            pointerEvents: 'auto'
          }}
          role="status" 
          aria-live="polite"
        >
          <span className="toast-icon" aria-hidden style={{ fontSize: '1rem', lineHeight: 1, marginTop: '0.1rem' }}>
            {iconFor[n.type] || '•'}
          </span>
          <span className="toast-message" style={{ flex: 1, whiteSpace: 'pre-line' }}>{n.message}</span>
          <button 
            className="toast-close" 
            onClick={() => remove(n.id)} 
            aria-label="Close notification"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0 0.25rem',
              lineHeight: 1
            }}
          >×</button>
        </div>
      ))}
    </div>
  );

  return createPortal(content, document.body);
};

export default ToastContainer;
