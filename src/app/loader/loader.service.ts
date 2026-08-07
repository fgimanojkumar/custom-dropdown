import { Injectable, signal } from '@angular/core';

export interface LoaderConfig {
  title?: string;
  message?: string;
  color?: string;
  backdrop?: 'light' | 'dark' | 'blur' | 'transparent';
  type?: 'dots' | 'spinner' | 'bar' | 'pulse' | 'wave' | 'ring';
  showTitle?: boolean;
  showMessage?: boolean;
  fullscreen?: boolean;
  image?: string;
  showImage?: boolean;
  closeOnBackdropClick?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoaderService {

  readonly visible = signal(false);

  readonly config = signal<LoaderConfig>({
    title: 'Loading...',
    message: 'Please wait while we process your request',
    color: '#a50000',
    backdrop: 'blur',
    type: 'wave',
    showTitle: true,
    showMessage: true,
    fullscreen: true,
    image: '',
    showImage: false,
    closeOnBackdropClick: false,
  });

  show(cfg?: LoaderConfig): void {
    if (cfg) {
      this.config.update(prev => ({ ...prev, ...cfg }));
    }
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }
}
