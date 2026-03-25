export type NotifyType = 'success' | 'error';

let pushRef: ((type: NotifyType, message: string) => void) | null = null;

export function setNotifyPush(fn: (type: NotifyType, message: string) => void) {
  pushRef = fn;
}

export const notify = {
  success(message: string) {
    pushRef?.('success', message);
  },
  error(message: string) {
    pushRef?.('error', message);
  },
};
