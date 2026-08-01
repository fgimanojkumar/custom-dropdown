import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {

  /** Show/hide loader — ts file se true/false karo */
  @Input() set visible(v: boolean) { this.visibleSignal.set(!!v); }

  @Input() title = 'Loading...';
  @Input() message = 'Please wait while we process your request';

  /** Spinner color */
  @Input() color = '#6366f1';

  /** Backdrop color: 'light' | 'dark' | 'blur' | 'transparent' */
  @Input() backdrop: 'light' | 'dark' | 'blur' | 'transparent' = 'blur';

  /** Spinner style: 'dots' | 'spinner' | 'bar' | 'pulse' | 'wave' | 'ring' */
  @Input() type: 'dots' | 'spinner' | 'bar' | 'pulse' | 'wave' | 'ring' = 'dots';

  /** Show/hide title */
  @Input() showTitle = true;

  /** Show/hide message */
  @Input() showMessage = true;

  /** Full screen overlay ya inline block */
  @Input() fullscreen = true;

  visibleSignal = signal(true);

  get visible(): boolean { return this.visibleSignal(); }
}
