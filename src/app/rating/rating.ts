import {
  Component, Input, Output, EventEmitter,
  signal, computed, forwardRef, ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.html',
  styleUrls: ['./rating.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Rating), multi: true }]
})
export class Rating implements ControlValueAccessor {

  @Input() set max(v: number)           { this.maxSignal.set(+v || 5); }
  @Input() set color(v: string)         { this.colorSignal.set(v || '#f59e0b'); }
  @Input() set emptyColor(v: string)    { this.emptyColorSignal.set(v || '#e5e7eb'); }
  @Input() set size(v: 'sm'|'md'|'lg') { this.sizeSignal.set(v || 'md'); }
  @Input() set readonly(v: boolean)     { this.readonlySignal.set(!!v); }
  @Input() set disabled(v: boolean)     { this.disabledSignal.set(!!v); }
  @Input() set allowHalf(v: boolean)    { this.allowHalfSignal.set(!!v); }
  @Input() set showValue(v: boolean)    { this.showValueSignal.set(v !== false); }
  @Input() set label(v: string)         { this.labelSignal.set(v || ''); }
  @Input() set tooltips(v: string[])    { this.tooltipsSignal.set(v ?? []); }
  @Input() set clearable(v: boolean)    { this.clearableSignal.set(v !== false); }

  @Output() onChange = new EventEmitter<number>();

  maxSignal        = signal(5);
  colorSignal      = signal('#f59e0b');
  emptyColorSignal = signal('#e5e7eb');
  sizeSignal       = signal<'sm'|'md'|'lg'>('md');
  readonlySignal   = signal(false);
  disabledSignal   = signal(false);
  allowHalfSignal  = signal(false);
  showValueSignal  = signal(true);
  labelSignal      = signal('');
  tooltipsSignal   = signal<string[]>([]);
  clearableSignal  = signal(true);
  valueSignal      = signal(0);
  hoverSignal      = signal(0);

  starsSignal     = computed(() => Array.from({ length: this.maxSignal() }, (_, i) => i + 1));
  activeSignal    = computed(() => this.hoverSignal() || this.valueSignal());
  tooltipSignal   = computed(() => {
    const t = this.tooltipsSignal();
    const v = Math.ceil(this.activeSignal()) - 1;
    return t[v] ?? '';
  });

  getFill(star: number): number {
    const fill = this.activeSignal() - (star - 1);
    return fill <= 0 ? 0 : fill >= 1 ? 100 : Math.round(fill * 100);
  }

  hover(star: number, left = false): void {
    if (this.readonlySignal() || this.disabledSignal()) return;
    this.hoverSignal.set(left && this.allowHalfSignal() ? star - 0.5 : star);
  }

  clearHover(): void { this.hoverSignal.set(0); }

  pick(star: number, left = false): void {
    if (this.readonlySignal() || this.disabledSignal()) return;
    const val = left && this.allowHalfSignal() ? star - 0.5 : star;
    const next = this.clearableSignal() && this.valueSignal() === val ? 0 : val;
    this.valueSignal.set(next);
    this.onChange.emit(next);
    this._onChange(next);
  }

  get stars()        { return this.starsSignal(); }
  get value()        { return this.valueSignal(); }
  get active()       { return this.activeSignal(); }
  get color()        { return this.colorSignal(); }
  get emptyColor()   { return this.emptyColorSignal(); }
  get size()         { return this.sizeSignal(); }
  get label()        { return this.labelSignal(); }
  get max()          { return this.maxSignal(); }
  get showValue()    { return this.showValueSignal(); }
  get readonly()     { return this.readonlySignal(); }
  get disabled()     { return this.disabledSignal(); }
  get allowHalf()    { return this.allowHalfSignal(); }
  get tooltip()      { return this.tooltipSignal(); }

  private _onChange: (v: any) => void = () => {};
  private _onTouched: () => void = () => {};
  writeValue(v: number): void { this.valueSignal.set(v ?? 0); }
  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabledSignal.set(d); }
}
