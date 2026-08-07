import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [],
  templateUrl: './number-input.html',
  styleUrl: './number-input.scss',
})
export class NumberInput {

  @Input() set value(v: number) { this._val.set(v ?? 0); }
  @Input() min      = -Infinity;
  @Input() max      = Infinity;
  @Input() step     = 1;
  @Input() label    = '';
  @Input() prefix   = '';
  @Input() suffix   = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color    = '#6366f1';
  @Input() disabled = false;
  @Input() readonly = false;
  @Output() onChange = new EventEmitter<number>();

  _val = signal(0);

  get val()    { return this._val(); }
  get canInc() { return this._val() < this.max; }
  get canDec() { return this._val() > this.min; }

  increment(): void {
    if (!this.canInc || this.disabled || this.readonly) return;
    this.set(this._val() + this.step);
  }

  decrement(): void {
    if (!this.canDec || this.disabled || this.readonly) return;
    this.set(this._val() - this.step);
  }

  onInput(e: Event): void {
    const v = Number((e.target as HTMLInputElement).value);
    if (!isNaN(v)) this.set(Math.min(this.max, Math.max(this.min, v)));
  }

  private set(v: number): void {
    const rounded = Math.round(v / this.step) * this.step;
    this._val.set(parseFloat(rounded.toFixed(10)));
    this.onChange.emit(this._val());
  }
}
