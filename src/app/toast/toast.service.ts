import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  'top-right' | 'top-left' | 'top-center' |
  'bottom-right' | 'bottom-left' | 'bottom-center';

export interface Toast {
  id:       string;
  message:  string;
  title?:   string;
  type:     ToastType;
  duration: number;
  position: ToastPosition;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', opts: Partial<Omit<Toast, 'id' | 'message' | 'type'>> = {}): string {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    const toast: Toast = { id, message, type, duration: 4000, position: 'top-right', ...opts };
    this.toasts.update(t => [...t, toast]);
    if (toast.duration > 0) setTimeout(() => this.dismiss(id), toast.duration);
    return id;
  }

  success(msg: string, opts?: Partial<Toast>) { return this.show(msg, 'success', opts); }
  error(msg: string, opts?: Partial<Toast>)   { return this.show(msg, 'error',   opts); }
  warning(msg: string, opts?: Partial<Toast>) { return this.show(msg, 'warning', opts); }
  info(msg: string, opts?: Partial<Toast>)    { return this.show(msg, 'info',    opts); }

  dismiss(id: string): void { this.toasts.update(t => t.filter(x => x.id !== id)); }
  clear(): void              { this.toasts.set([]); }
}
