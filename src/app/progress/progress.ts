import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {

  @Input() set value(v: number) { this._value.set(Math.min(100, Math.max(0, v ?? 0))); }
  @Input() set buffer(v: number) { this._buffer.set(Math.min(100, Math.max(0, v ?? 0))); }

  @Input() type: 'linear' | 'circular' = 'linear';
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' = 'determinate';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color    = '#6366f1';
  @Input() color2   = '';              // gradient end color
  @Input() bufferColor = '#c7d2fe';
  @Input() trackColor  = '#e2e8f0';
  @Input() striped  = false;
  @Input() animated = false;           // animate stripes
  @Input() rounded  = true;
  @Input() showLabel    = false;
  @Input() label        = '';          // custom label, else shows %
  @Input() labelPosition: 'right' | 'inside' | 'bottom' | 'center' = 'right';
  @Input() thickness = 8;              // circular stroke width
  @Input() diameter  = 80;            // circular overall size

  _value  = signal(0);
  _buffer = signal(0);

  get val() { return this._value(); }
  get buf() { return this._buffer(); }

  get displayLabel() { return this.label || `${this.val}%`; }

  get fillBackground(): string {
    return this.color2
      ? `linear-gradient(90deg, ${this.color}, ${this.color2})`
      : this.color;
  }

  // ── Circular SVG helpers ──────────────────────────────────────────────
  get radius()             { return (this.diameter - this.thickness) / 2; }
  get circumference()      { return 2 * Math.PI * this.radius; }
  get strokeDashoffset()   { return this.circumference * (1 - this.val / 100); }
  get bufferDashoffset()   { return this.circumference * (1 - this.buf / 100); }
  get cx()                 { return this.diameter / 2; }
}
