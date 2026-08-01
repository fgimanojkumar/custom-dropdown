import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
  Output,
  EventEmitter,
  signal,
  computed,
  effect,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

// ─── Public Interface ──────────────────────────────────────────────────────────
export interface DropdownOption {
  label: string;
  value: any;
  group?: string;
  disabled?: boolean;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  tags?: string[];
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Dropdown),
    multi: true
  }]
})
export class Dropdown implements OnInit {

  // Existing Inputs
  @Input() set placeholder(v: string) { this.placeholderSignal.set(v ?? 'Select'); }
  @Input() set disabled(v: boolean) { this.disabledSignal.set(!!v); }
  @Input() set canSearch(v: boolean) { this.canSearchSignal.set(v !== false); }
  @Input() set selectedValue(v: any) { this.selectedValueSignal.set(v); }
  @Input() set multipleSelect(v: boolean) { this.multipleSelectSignal.set(!!v); }
  @Input() set multiSelectCheckboxColor(v: any) { this.checkboxColorSignal.set(v ?? 'mediumblue'); }
  @Input() set dataArray(v: any[]) { this.dataArraySignal.set(v ?? []); }

  // New Inputs
  /** Max items selectable in multi-select mode. 0 = unlimited */
  @Input() set maxSelect(v: any) { this.maxSelectSignal.set(+v || 0); }
  /** Show a loading spinner instead of the list */
  @Input() set loading(v: boolean) { this.loadingSignal.set(!!v); }
  /** Readonly: shows selection but blocks interaction */
  @Input() set readonly(v: boolean) { this.readonlySignal.set(!!v); }
  /** Show recent-selection history at top of list */
  @Input() set showRecentHistory(v: boolean) { this.showRecentHistorySignal.set(!!v); }
  /** localStorage key for persisting history */
  @Input() set historyKey(v: string) { this.historyKeySignal.set(v || 'dd-history'); }
  /** Property name used as value when dataArray is object array */
  @Input() set valueKey(v: string) { this.valueKeySignal.set(v || 'value'); }
  /** Property name used as display label when dataArray is object array */
  @Input() set labelKey(v: string) { this.labelKeySignal.set(v || 'label'); }
  /** Extra object fields included in search */
  @Input() set searchFields(v: string[]) { this.searchFieldsSignal.set(v ?? []); }
  /** Property name used as group key in dataArray objects */
  @Input() set grouping(v: string) { this.groupKeySignal.set(v || 'group'); }
  /** Property name used as badge text in dataArray objects */
  @Input() set badges(v: string) { this.badgeKeySignal.set(v || 'badge'); }
  /** Default badge background color (overridden per-item by badgeColor field) */
  @Input() set badgesColor(v: string) { this.defaultBadgeColorSignal.set(v || '#667eea'); }
  /** Show or hide badges */
  @Input() set showBadges(v: boolean) { this.showBadgesSignal.set(v !== false); }
  /** Property name used as icon in dataArray objects */
  @Input() set icons(v: string) { this.iconKeySignal.set(v || 'icon'); }
  /** Show or hide icons */
  @Input() set showIcons(v: boolean) { this.showIconsSignal.set(v !== false); }
  /** Group header background color */
  @Input() set groupingColor(v: string) { this.groupingColorSignal.set(v || '#6366f1'); }
  /** Property name used as group icon in dataArray objects */
  @Input() set groupingIcon(v: string) { this.groupingIconSignal.set(v || ''); }
  /** Show or hide grouping */
  @Input() set showGrouping(v: boolean) { this.showGroupingSignal.set(v !== false); }

  @ViewChild('searchInput') inputElement!: ElementRef;
  @Output() onChange = new EventEmitter<any>();

  // Signals
  placeholderSignal = signal('Select');
  disabledSignal = signal(false);
  canSearchSignal = signal(true);
  selectedValueSignal = signal<any>('');
  multipleSelectSignal = signal(false);
  checkboxColorSignal = signal('mediumblue');
  dataArraySignal = signal<any[]>([]);
  showDropdownSignal = signal(false);
  searchTextSignal = signal('');
  selectedValueArrSignal = signal<any[]>([]);
  allSelectCheckedSignal = signal(false);

  maxSelectSignal = signal(0);
  loadingSignal = signal(false);
  readonlySignal = signal(false);
  showRecentHistorySignal = signal(false);
  historyKeySignal = signal('dd-history');
  valueKeySignal = signal('value');
  labelKeySignal = signal('label');
  searchFieldsSignal = signal<string[]>([]);
  focusedIndexSignal = signal(-1);
  recentHistorySignal = signal<any[]>([]);
  groupKeySignal = signal('group');
  badgeKeySignal = signal('badge');
  defaultBadgeColorSignal = signal('#667eea');
  showBadgesSignal = signal(true);
  iconKeySignal = signal('icon');
  showIconsSignal = signal(true);
  groupingColorSignal = signal('#6366f1');
  groupingIconSignal = signal('');
  showGroupingSignal = signal(true);

  // Computed
  disabledClassSignal = computed(() => {
    const cls: string[] = [];
    if (this.disabledSignal()) cls.push('disabled');
    if (this.readonlySignal()) cls.push('readonly');
    return cls.join(' ');
  });

  isObjectModeSignal = computed(() => {
    const d = this.dataArraySignal();
    return d.length > 0 && typeof d[0] === 'object' && d[0] !== null;
  });

  filteredDataSignal = computed(() => {
    const data = this.dataArraySignal();
    const q = this.searchTextSignal().toLowerCase().trim();
    const extra = this.searchFieldsSignal();
    const lKey = this.labelKeySignal();

    if (!q || !data.length) return data;

    return data.filter(item => {
      if (typeof item === 'string') return item.toLowerCase().includes(q);
      const fields = [lKey, 'tags', ...extra];
      return fields.some(f => {
        const v = item[f];
        if (Array.isArray(v)) return v.some((x: any) => String(x).toLowerCase().includes(q));
        return v != null && String(v).toLowerCase().includes(q);
      });
    });
  });

  groupedDataSignal = computed((): { group: string; options: any[] }[] | null => {
    if (!this.showGroupingSignal()) return null;
    const data = this.filteredDataSignal();
    if (!data.length || !this.isObjectModeSignal()) return null;
    const gKey = this.groupKeySignal();
    if (!data.some((i: any) => i[gKey])) return null;

    const map = new Map<string, any[]>();
    data.forEach((item: any) => {
      const g = item[gKey] || 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    });
    return Array.from(map.entries()).map(([group, options]) => ({ group, options }));
  });

  selectedCountSignal = computed(() => this.selectedValueArrSignal().length);

  selectedLabelSignal = computed(() => {
    const val = this.selectedValueSignal();
    if (!val) return '';
    const item = this.dataArraySignal().find(i => this.getValue(i) === val);
    return item ? this.getLabel(item) : String(val);
  });

  limitReachedSignal = computed(() => {
    const max = this.maxSelectSignal();
    return max > 0 && this.selectedValueArrSignal().length >= max;
  });

  indeterminateSignal = computed(() => {
    const sel = this.selectedValueArrSignal().length;
    const total = this.dataArraySignal().filter(i => !this.isItemDisabled(i)).length;
    return sel > 0 && sel < total;
  });

  constructor(private elementRef: ElementRef) {
    effect(() => {
      const def = this.selectedValueSignal();
      const data = this.dataArraySignal();
      if (def && data.length) {
        const vals = data.map((i: any) => this.getValue(i));
        if (vals.includes(def)) this.selectedValueArrSignal.set([def]);
      }
    });
  }

  ngOnInit(): void {
    this._loadHistory();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(e.target)) {
      this.showDropdownSignal.set(false);
      this.focusedIndexSignal.set(-1);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.disabledSignal() || this.readonlySignal()) return;

    if (!this.showDropdownSignal()) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.changeDropdown(); }
      return;
    }

    const opts = this.filteredDataSignal();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusedIndexSignal.update(i => Math.min(i + 1, opts.length - 1));
        this._scrollFocused();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusedIndexSignal.update(i => Math.max(i - 1, 0));
        this._scrollFocused();
        break;
      case 'Enter': {
        e.preventDefault();
        const fi = this.focusedIndexSignal();
        if (fi >= 0 && fi < opts.length) this.toggleItem(opts[fi]);
        break;
      }
      case 'Escape':
        e.preventDefault();
        this.showDropdownSignal.set(false);
        this.focusedIndexSignal.set(-1);
        break;
      case 'Tab':
        this.showDropdownSignal.set(false);
        this.focusedIndexSignal.set(-1);
        break;
    }
  }

  // Helpers
  getLabel(item: any): string {
    if (typeof item === 'string') return item;
    return item[this.labelKeySignal()] ?? String(item);
  }

  getValue(item: any): any {
    if (typeof item === 'string') return item;
    return item[this.valueKeySignal()] ?? item;
  }

  getIcon(item: any): string { return typeof item === 'object' ? (item[this.iconKeySignal()] ?? '') : ''; }
  getBadge(item: any): string { return typeof item === 'object' ? (item[this.badgeKeySignal()] ?? '') : ''; }
  getBadgeColor(item: any): string { return typeof item === 'object' ? (item.badgeColor ?? this.defaultBadgeColorSignal()) : this.defaultBadgeColorSignal(); }
  isItemDisabled(item: any): boolean { return typeof item === 'object' && !!item.disabled; }

  isInDataArray(val: any): boolean {
    return this.dataArraySignal().some(item => this.getValue(item) === val);
  }

  /** Prevents native checkbox toggle when maxSelect limit is reached */
  onCheckboxClick(event: MouseEvent, item: any): void {
    event.stopPropagation();
    const isCurrentlyChecked = this.isChecked(item);
    if (!isCurrentlyChecked && this.limitReachedSignal()) {
      event.preventDefault();
    }
  }

  /** Label click: preventDefault stops browser from auto-activating checkbox (prevents double-fire);
   *  stopPropagation prevents bubble to parent div; toggleItem handles both single & multi-select */
  onLabelClick(event: MouseEvent, item: any): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isItemDisabled(item)) {
      this.toggleItem(item);
    }
  }

  // Core Actions
  changeDropdown(): void {
    if (this.disabledSignal() || this.readonlySignal()) return;
    const opening = !this.showDropdownSignal();
    this.showDropdownSignal.set(opening);
    if (!opening) this.focusedIndexSignal.set(-1);
  }

  toggleItem(item: any): void {
    if (this.isItemDisabled(item)) return;
    const val = this.getValue(item);
    const arr = [...this.selectedValueArrSignal()];

    if (this.multipleSelectSignal()) {
      const idx = arr.indexOf(val);
      if (idx > -1) {
        arr.splice(idx, 1);
      } else {
        if (this.limitReachedSignal()) return;
        arr.push(val);
        this._addToHistory(val);
      }
      this.selectedValueArrSignal.set(arr);
      this.sendDataToParent(arr);
    } else {
      this.selectedValueSignal.set(val);
      this.selectedValueArrSignal.set([val]);
      this._addToHistory(val);
      this.sendDataToParent(val);
      setTimeout(() => this.showDropdownSignal.set(false), 100);
    }
    this._updateAllSelectChecked();
  }

  selectAll(e: any): void {
    if (this.readonlySignal()) return;
    if (e.target.checked) {
      const max = this.maxSelectSignal();
      let vals = this.dataArraySignal()
        .filter(i => !this.isItemDisabled(i))
        .map(i => this.getValue(i));
      if (max > 0) vals = vals.slice(0, max);
      this.allSelectCheckedSignal.set(true);
      this.selectedValueArrSignal.set(vals);
      this.sendDataToParent(vals);
    } else {
      this.allSelectCheckedSignal.set(false);
      this.selectedValueArrSignal.set([]);
      this.sendDataToParent([]);
    }
  }

  isChecked(item: any): boolean {
    return this.selectedValueArrSignal().includes(this.getValue(item));
  }

  clearSearch(e: Event): void {
    e.stopPropagation();
    this.searchTextSignal.set('');
    if (this.inputElement) setTimeout(() => this.inputElement.nativeElement.focus(), 0);
  }

  clearAllValue(e: Event): void {
    e.stopPropagation();
    this.showDropdownSignal.set(true);
    this.selectedValueArrSignal.set([]);
    this.allSelectCheckedSignal.set(false);
    if (this.inputElement) setTimeout(() => this.inputElement.nativeElement.focus(), 0);
    this.sendDataToParent([]);
  }

  removeSelectedValue(e: Event, val: any): void {
    e.stopPropagation();
    const arr = this.selectedValueArrSignal().filter(v => v !== val);
    this.selectedValueArrSignal.set(arr);
    this.sendDataToParent(arr);
    this._updateAllSelectChecked();
  }

  sendDataToParent(data: any): void { this.onChange.emit(data); }

  private _updateAllSelectChecked(): void {
    const total = this.dataArraySignal().filter(i => !this.isItemDisabled(i)).length;
    const sel = this.selectedValueArrSignal().length;
    this.allSelectCheckedSignal.set(sel === total && total > 0);
  }

  private _addToHistory(val: any): void {
    if (!this.showRecentHistorySignal()) return;
    let h = this.recentHistorySignal().filter(v => v !== val);
    h.unshift(val);
    h = h.slice(0, 5);
    this.recentHistorySignal.set(h);
    try { localStorage.setItem(this.historyKeySignal(), JSON.stringify(h)); } catch { }
  }

  private _loadHistory(): void {
    if (!this.showRecentHistorySignal()) return;
    try {
      const raw = localStorage.getItem(this.historyKeySignal());
      if (raw) this.recentHistorySignal.set(JSON.parse(raw));
    } catch { }
  }

  private _scrollFocused(): void {
    setTimeout(() => {
      document.querySelector('.option.focused')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 0);
  }

  // Getters for template
  get showDropdown(): boolean { return this.showDropdownSignal(); }
  get searchText(): string { return this.searchTextSignal(); }
  set searchText(v: string) { this.searchTextSignal.set(v); }
  get placeholder(): string { return this.placeholderSignal(); }
  get disabled(): boolean { return this.disabledSignal(); }
  get canSearch(): boolean { return this.canSearchSignal(); }
  get multipleSelect(): boolean { return this.multipleSelectSignal(); }
  get checkboxColor(): string { return this.checkboxColorSignal(); }
  get dataArray(): any[] { return this.dataArraySignal(); }
  get filteredData(): any[] { return this.filteredDataSignal(); }
  get groupedData(): { group: string; options: any[] }[] | null { return this.groupedDataSignal(); }
  get selectedValueArr(): any[] { return this.selectedValueArrSignal(); }
  get allSelectChecked(): boolean { return this.allSelectCheckedSignal(); }
  get selectedValue(): any { return this.selectedValueSignal(); }
  get selectedLabel(): string { return this.selectedLabelSignal(); }
  get selectedCount(): number { return this.selectedCountSignal(); }
  get disabledClass(): string { return this.disabledClassSignal(); }
  get loading(): boolean { return this.loadingSignal(); }
  get readonly(): boolean { return this.readonlySignal(); }
  get maxSelect(): number { return this.maxSelectSignal(); }
  get limitReached(): boolean { return this.limitReachedSignal(); }
  get indeterminate(): boolean { return this.indeterminateSignal(); }
  get focusedIndex(): number { return this.focusedIndexSignal(); }
  get recentHistory(): any[] { return this.recentHistorySignal(); }
  get showRecentHistory(): boolean { return this.showRecentHistorySignal(); }
  get showBadges(): boolean { return this.showBadgesSignal(); }
  get showIcons(): boolean { return this.showIconsSignal(); }
  get groupingColor(): string { return this.groupingColorSignal(); }
  get groupingIcon(): string { return this.groupingIconSignal(); }
  get showGrouping(): boolean { return this.showGroupingSignal(); }
}
