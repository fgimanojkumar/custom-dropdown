import { Component, inject } from '@angular/core';
import { ToastService, Toast, ToastPosition } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {

  readonly svc = inject(ToastService);

  readonly positions: ToastPosition[] = [
    'top-right', 'top-left', 'top-center',
    'bottom-right', 'bottom-left', 'bottom-center',
  ];

  byPos(pos: ToastPosition): Toast[] {
    return this.svc.toasts().filter(t => t.position === pos);
  }

  icon(type: Toast['type']): string {
    return { success: '✓', error: '✕', warning: '!', info: 'i' }[type];
  }
}
