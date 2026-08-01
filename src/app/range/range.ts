import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal
} from '@angular/core';

import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';

@Component({
  selector: 'app-range',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './range.html',
  styleUrls: ['./range.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Range),
      multi: true
    }
  ]
})
export class Range implements ControlValueAccessor {
  @Input() label = '';
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() color = '#4f46e5';
  @Input() trackColor = '#e5e7eb';
  @Input() thumbColor = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() height: number | null = null;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() showLabel = true;
  @Input() showValue = true;
  @Input() showTooltip = true;
  @Input() tooltipPosition: 'top' | 'bottom' = 'top';
  @Input() readonly = false;

  @Input()
  set disabled(value: boolean) {
    this.disabledSignal.set(!!value);
  }

  @Output()
  onChange = new EventEmitter<number>();

  valueSignal = signal(0);
  disabledSignal = signal(false);
  tooltipVisibleSignal = signal(false);

  private hideTimeout: any;
  private onTouched = () => {};
  private onModelChange = (_: number) => {};

  writeValue(value: number): void {
    this.valueSignal.set(value ?? this.min);
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledSignal.set(isDisabled);
  }

  valueChanged(event: Event): void {

    const value = Number(
      (event.target as HTMLInputElement).value
    );

    this.valueSignal.set(value);

    this.onModelChange(value);

    this.onTouched();

    this.onChange.emit(value);
  }

  get sliderBackground(): string {
    const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
    return `
      linear-gradient(
        to right,
        ${this.color} 0%,
        ${this.color} ${percentage}%,
        ${this.trackColor} ${percentage}%,
        ${this.trackColor} 100%
      )
    `;
  }

  get value(): number {
    return this.valueSignal();
  }

  get displayValue(): string {
    return `${this.prefix}${this.value}${this.suffix}`;
  }

  get disabled(): boolean {
    return this.disabledSignal();
  }

  showTooltipFn(): void {
    if (this.readonly || this.disabled || !this.showTooltip) return;
    clearTimeout(this.hideTimeout);
    this.tooltipVisibleSignal.set(true);
  }

  hideTooltipFn(): void {
    this.hideTimeout = setTimeout(() => {
      this.tooltipVisibleSignal.set(false);
    }, 1000);
  }


}