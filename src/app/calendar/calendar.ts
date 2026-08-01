import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  forwardRef,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Calendar),
    multi: true
  }]
})
export class Calendar implements ControlValueAccessor {

  // ── Inputs ──────────────────────────────────────────────────────────────
  @Input() set color(v: string)     { this.colorSignal.set(v || '#6366f1'); }
  @Input() set mode(v: 'single' | 'range' | 'multiple') { this.modeSignal.set(v || 'single'); }
  @Input() set minDate(v: Date | null)   { this.minDateSignal.set(v ?? null); }
  @Input() set maxDate(v: Date | null)   { this.maxDateSignal.set(v ?? null); }
  @Input() set disabledDates(v: Date[])  { this.disabledDatesSignal.set(v ?? []); }
  @Input() set showToday(v: boolean)     { this.showTodaySignal.set(v !== false); }
  @Input() set firstDayOfWeek(v: 0 | 1) { this.firstDaySignal.set(v ?? 1); }
  @Input() set placeholder(v: string)    { this.placeholderSignal.set(v || 'Select date'); }
  @Input() set readonly(v: boolean)      { this.readonlySignal.set(!!v); }
  @Input() set disabled(v: boolean)      { this.disabledSignal.set(!!v); }
  @Input() set inline(v: boolean)        { this.inlineSignal.set(!!v); }
  /** Date format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'DD MMM YYYY' */
  @Input() set dateFormat(v: string)     { this.dateFormatSignal.set(v || 'DD/MM/YYYY'); }

  @Output() onChange = new EventEmitter<any>();

  // ── Signals ──────────────────────────────────────────────────────────────
  colorSignal           = signal('#6366f1');
  modeSignal            = signal<'single' | 'range' | 'multiple'>('single');
  minDateSignal         = signal<Date | null>(null);
  maxDateSignal         = signal<Date | null>(null);
  disabledDatesSignal   = signal<Date[]>([]);
  showTodaySignal       = signal(true);
  firstDaySignal        = signal<0 | 1>(1);
  placeholderSignal     = signal('Select date');
  readonlySignal        = signal(false);
  disabledSignal        = signal(false);
  inlineSignal          = signal(false);
  dateFormatSignal      = signal('DD/MM/YYYY');

  showCalendarSignal    = signal(false);
  viewYearSignal        = signal(new Date().getFullYear());
  viewMonthSignal       = signal(new Date().getMonth());
  viewModeSignal        = signal<'days' | 'months' | 'years'>('days');

  selectedDateSignal    = signal<Date | null>(null);
  selectedDatesSignal   = signal<Date[]>([]);
  rangeStartSignal      = signal<Date | null>(null);
  rangeEndSignal        = signal<Date | null>(null);
  hoverDateSignal       = signal<Date | null>(null);

  // ── Static Data ──────────────────────────────────────────────────────────
  readonly MONTH_NAMES  = ['January','February','March','April','May','June',
                           'July','August','September','October','November','December'];
  readonly MONTH_SHORT  = ['Jan','Feb','Mar','Apr','May','Jun',
                           'Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── Computed ─────────────────────────────────────────────────────────────
  weekDaysSignal = computed(() => {
    const all = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return this.firstDaySignal() === 1 ? [...all.slice(1), all[0]] : all;
  });

  calendarDaysSignal = computed(() => {
    const year  = this.viewYearSignal();
    const month = this.viewMonthSignal();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay();
    if (this.firstDaySignal() === 1) startDow = (startDow + 6) % 7;

    const days: Date[] = [];
    for (let i = startDow - 1; i >= 0; i--)
      days.push(new Date(year, month, -i));
    for (let d = 1; d <= lastDay.getDate(); d++)
      days.push(new Date(year, month, d));
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++)
      days.push(new Date(year, month + 1, i));

    return days;
  });

  yearRangeSignal = computed(() => {
    const base = Math.floor(this.viewYearSignal() / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => base + i);
  });

  headerLabelSignal = computed(() => {
    const vm = this.viewModeSignal();
    if (vm === 'days')   return this.MONTH_NAMES[this.viewMonthSignal()] + ' ' + this.viewYearSignal();
    if (vm === 'months') return String(this.viewYearSignal());
    const yr = this.yearRangeSignal();
    return yr[0] + ' – ' + yr[11];
  });

  displayValueSignal = computed(() => {
    const mode = this.modeSignal();
    if (mode === 'single') {
      const d = this.selectedDateSignal();
      return d ? this._fmt(d) : '';
    }
    if (mode === 'range') {
      const s = this.rangeStartSignal(), e = this.rangeEndSignal();
      if (!s) return '';
      return e ? this._fmt(s) + ' → ' + this._fmt(e) : this._fmt(s) + ' → ...';
    }
    const arr = this.selectedDatesSignal();
    if (!arr.length) return '';
    return arr.length === 1 ? this._fmt(arr[0]) : arr.length + ' dates selected';
  });

  // ── Constructor ───────────────────────────────────────────────────────────
  constructor(private _el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.inlineSignal() && !this._el.nativeElement.contains(e.target))
      this.showCalendarSignal.set(false);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  toggleCalendar(): void {
    if (this.disabledSignal() || this.readonlySignal()) return;
    this.showCalendarSignal.update(v => !v);
  }

  navigate(dir: -1 | 1): void {
    const vm = this.viewModeSignal();
    if (vm === 'days') {
      const m = this.viewMonthSignal() + dir;
      if (m < 0)  { this.viewMonthSignal.set(11); this.viewYearSignal.update(y => y - 1); }
      else if (m > 11) { this.viewMonthSignal.set(0); this.viewYearSignal.update(y => y + 1); }
      else this.viewMonthSignal.set(m);
    } else if (vm === 'months') {
      this.viewYearSignal.update(y => y + dir);
    } else {
      this.viewYearSignal.update(y => y + dir * 12);
    }
  }

  setViewMode(mode: 'days' | 'months' | 'years'): void {
    this.viewModeSignal.set(mode);
  }

  pickMonth(i: number): void {
    this.viewMonthSignal.set(i);
    this.viewModeSignal.set('days');
  }

  pickYear(y: number): void {
    this.viewYearSignal.set(y);
    this.viewModeSignal.set('months');
  }

  selectDate(date: Date): void {
    if (this.isDisabled(date)) return;
    const mode = this.modeSignal();

    if (mode === 'single') {
      this.selectedDateSignal.set(date);
      this._emit(date);
      setTimeout(() => this.showCalendarSignal.set(false), 160);

    } else if (mode === 'multiple') {
      const arr = this.selectedDatesSignal();
      const idx = arr.findIndex(d => this.sameDay(d, date));
      const next = idx > -1 ? arr.filter((_, i) => i !== idx) : [...arr, date];
      this.selectedDatesSignal.set(next);
      this._emit(next);

    } else {
      const s = this.rangeStartSignal(), e = this.rangeEndSignal();
      if (!s || (s && e)) {
        this.rangeStartSignal.set(date);
        this.rangeEndSignal.set(null);
      } else {
        const [start, end] = date < s ? [date, s] : [s, date];
        this.rangeStartSignal.set(start);
        this.rangeEndSignal.set(end);
        this._emit({ start, end });
        setTimeout(() => this.showCalendarSignal.set(false), 160);
      }
    }
  }

  goToday(): void {
    const t = new Date();
    this.viewMonthSignal.set(t.getMonth());
    this.viewYearSignal.set(t.getFullYear());
    this.viewModeSignal.set('days');
    if (this.modeSignal() === 'single') this.selectDate(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
  }

  clear(e: Event): void {
    e.stopPropagation();
    this.selectedDateSignal.set(null);
    this.selectedDatesSignal.set([]);
    this.rangeStartSignal.set(null);
    this.rangeEndSignal.set(null);
    this._emit(null);
  }

  hover(date: Date | null): void { this.hoverDateSignal.set(date); }

  // ── State helpers ─────────────────────────────────────────────────────────
  isSelected(d: Date): boolean {
    const m = this.modeSignal();
    if (m === 'single')   return !!this.selectedDateSignal() && this.sameDay(this.selectedDateSignal()!, d);
    if (m === 'multiple') return this.selectedDatesSignal().some(x => this.sameDay(x, d));
    return this.isRangeStart(d) || this.isRangeEnd(d);
  }

  isRangeStart(d: Date): boolean { const s = this.rangeStartSignal(); return !!s && this.sameDay(s, d); }
  isRangeEnd(d: Date): boolean   { const e = this.rangeEndSignal();   return !!e && this.sameDay(e, d); }

  isInRange(d: Date): boolean {
    if (this.modeSignal() !== 'range') return false;
    let s = this.rangeStartSignal(), e = this.rangeEndSignal();
    if (s && !e) {
      const h = this.hoverDateSignal();
      if (h) { if (h > s) e = h; else { e = s; s = h; } }
    }
    if (!s || !e) return false;
    return d > s && d < e;
  }

  isToday(d: Date):        boolean { return this.sameDay(d, new Date()); }
  isCurMonth(d: Date):     boolean { return d.getMonth() === this.viewMonthSignal() && d.getFullYear() === this.viewYearSignal(); }
  isDisabled(d: Date):     boolean {
    const mn = this.minDateSignal(), mx = this.maxDateSignal();
    if (mn && d < this._strip(mn)) return true;
    if (mx && d > this._strip(mx)) return true;
    return this.disabledDatesSignal().some(x => this.sameDay(x, d));
  }

  sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private _strip(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  private _fmt(d: Date): string {
    const dd  = String(d.getDate()).padStart(2, '0');
    const mm  = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    const mmm = this.MONTH_SHORT[d.getMonth()];
    switch (this.dateFormatSignal()) {
      case 'MM/DD/YYYY':  return `${mm}/${dd}/${yyyy}`;
      case 'YYYY-MM-DD':  return `${yyyy}-${mm}-${dd}`;
      case 'DD-MM-YYYY':  return `${dd}-${mm}-${yyyy}`;
      case 'DD MMM YYYY': return `${dd} ${mmm} ${yyyy}`;
      default:            return `${dd}/${mm}/${yyyy}`;
    }
  }
  private _emit(v: any): void { this.onChange.emit(v); this._onModelChange(v); }

  // ── Getters for template ──────────────────────────────────────────────────
  get showCalendar(): boolean  { return this.showCalendarSignal() || this.inlineSignal(); }
  get displayValue(): string   { return this.displayValueSignal(); }
  get headerLabel(): string    { return this.headerLabelSignal(); }
  get weekDays(): string[]     { return this.weekDaysSignal(); }
  get calDays(): Date[]        { return this.calendarDaysSignal(); }
  get yearRange(): number[]    { return this.yearRangeSignal(); }
  get viewMonth(): number      { return this.viewMonthSignal(); }
  get viewYear(): number       { return this.viewYearSignal(); }
  get viewMode(): string       { return this.viewModeSignal(); }
  get color(): string          { return this.colorSignal(); }
  get placeholder(): string    { return this.placeholderSignal(); }
  get disabled(): boolean      { return this.disabledSignal(); }
  get readonly(): boolean      { return this.readonlySignal(); }
  get inline(): boolean        { return this.inlineSignal(); }
  get showToday(): boolean     { return this.showTodaySignal(); }

  // ── ControlValueAccessor ──────────────────────────────────────────────────
  private _onModelChange: (v: any) => void = () => {};
  private _onTouched: () => void = () => {};

  writeValue(v: any): void {
    if (!v) return;
    const m = this.modeSignal();
    if (m === 'single' && v instanceof Date) {
      this.selectedDateSignal.set(v);
      this.viewMonthSignal.set(v.getMonth());
      this.viewYearSignal.set(v.getFullYear());
    } else if (m === 'multiple' && Array.isArray(v)) {
      this.selectedDatesSignal.set(v);
    } else if (m === 'range' && v?.start) {
      this.rangeStartSignal.set(v.start);
      this.rangeEndSignal.set(v.end ?? null);
    }
  }

  registerOnChange(fn: any): void { this._onModelChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabledSignal.set(d); }
}
