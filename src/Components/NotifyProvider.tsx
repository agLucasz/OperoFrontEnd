import { useCallback, useEffect, useRef, useState } from 'react';
import { setNotifyPush } from '../Lib/notify';

type NotifyType = 'success' | 'error';

type Notification = {
  id: number;
  type: NotifyType;
  message: string;
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const push = useCallback((type: NotifyType, message: string) => {
    const id = idRef.current++;
    setItems((prev) => [{ id, type, message }, ...prev.slice(0, 4)]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  useEffect(() => {
    setNotifyPush(push);
  }, [push]);

  return (
    <>
      <div className="notify-container">
        {items.map((n) => (
          <div key={n.id} className={`notify-item ${n.type === 'success' ? 'notify-success' : 'notify-error'}`}>
            <span className="notify-message">{n.message}</span>
            <button aria-label="Fechar" className="notify-close" onClick={() => remove(n.id)}>×</button>
          </div>
        ))}
      </div>
      {children}
    </>
  );
}
