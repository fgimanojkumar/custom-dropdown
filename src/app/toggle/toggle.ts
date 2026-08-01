import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  imports: [],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Toggle),
      multi: true
    }
  ]
})
export class Toggle {

 // ==========================
  // Inputs
  // ==========================

  @Input() label = '';
  @Input() description = '';
  @Input() color = '#22c55e';
  @Input() offColor = '#d1d5db';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() labelPosition: 'left' | 'right' = 'right';
  @Input() onLabel = '';
  @Input() offLabel = '';

  @Input()
  set checked(value: boolean) {
    this.checkedSignal.set(!!value);
  }

  @Input()
  set disabled(value: boolean) {
    this.disabledSignal.set(!!value);
  }

  @Input()
  set readonly(value: boolean) {
    this.readonlySignal.set(!!value);
  }

  @Input()
  set loading(value: boolean) {
    this.loadingSignal.set(!!value);
  }

  // ==========================
  // Output
  // ==========================

  @Output() onChange = new EventEmitter<boolean>();

  // ==========================
  // Signals
  // ==========================

  checkedSignal = signal(false);

  disabledSignal = signal(false);

  readonlySignal = signal(false);

  loadingSignal = signal(false);

  // ==========================
  // ControlValueAccessor
  // ==========================

  private onTouched: () => void = () => {};

  private onModelChange: (value: boolean) => void = () => {};

  writeValue(value: boolean): void {
    this.checkedSignal.set(!!value);
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

  // ==========================
  // Toggle Action
  // ==========================

  toggle(): void {

    if (this.disabledSignal()) {
      return;
    }

    if (this.readonlySignal()) {
      return;
    }

    if (this.loadingSignal()) {
      return;
    }

    const value = !this.checkedSignal();

    this.checkedSignal.set(value);

    this.onModelChange(value);

    this.onTouched();

    this.onChange.emit(value);
  }

  // ==========================
  // Keyboard Support
  // ==========================

  onKeyDown(event: KeyboardEvent): void {

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      this.toggle();
    }
  }

  // ==========================
  // Getters
  // ==========================

  get checked(): boolean {
    return this.checkedSignal();
  }

  get disabled(): boolean {
    return this.disabledSignal();
  }

  get readonly(): boolean {
    return this.readonlySignal();
  }

  get loading(): boolean {
    return this.loadingSignal();
  }






}
