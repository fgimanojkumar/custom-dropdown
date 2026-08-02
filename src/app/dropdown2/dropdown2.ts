import {
  Component, Input, Output, EventEmitter,
  AfterContentInit, OnInit, OnDestroy,
  ContentChild, ElementRef, ViewChild,
  HostListener, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dropdown2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown2.html',
  styleUrl: './dropdown2.scss'
})
export class Dropdown2 implements OnInit, AfterContentInit, OnDestroy {

  // -- Mat-form-field style inputs -------------------------------------------
  @Input() label    = '';
  @Input() hint     = '';
  @Input() error    = '';
  @Input() outlined = false;
  @Input() required = false;

  // -- Dropdown feature inputs -----------------------------------------------
  @Input() set placeholder(v: string)              { this.placeholderSignal.set(v ?? 'Select'); }
  @Input() set disabled(v: boolean)                { this.disabledSignal.set(!!v); }
  @Input() set readonly(v: boolean)                { this.readonlySignal.set(!!v); }
  @Input() set canSearch(v: boolean)               { this.canSearchSignal.set(v !== false); }
  @Input() set showSearchFields(v: boolean)        { this.canSearchSignal.set(v !== false); }
  @Input() set loading(v: boolean)                 { this.loadingSignal.set(!!v); }
  @Input() set dataArray(v: any[])                 { this._extDataSet.set(true); this.dataArraySignal.set((v ?? []).map((item, i) => typeof item === 'object' && item ? { ...item, _idx: i } : { label: String(item), value: item, _idx: i })); }
  @Input() set selectedValue(v: any)               { this.selectedValueSignal.set(v); }
  @Input() set multipleSelect(v: boolean)          { this.multipleSelectSignal.set(!!v); }
  @Input() set multiSelectCheckboxColor(v: string) { this.checkboxColorSignal.set(v || '#6366f1'); }
  @Input() set maxSelect(v: any)                   { this.maxSelectSignal.set(+v || 0); }
  @Input() set valueKey(v: string)                 { this.valueKeySignal.set(v || 'value'); }
  @Input() set labelKey(v: string)                 { this.labelKeySignal.set(v || 'label'); }
  @Input() set searchFields(v: string[])           { this.searchFieldsSignal.set(v ?? []); }
  @Input() set grouping(v: string)                 { this.groupKeySignal.set(v || 'group'); }
  @Input() set groupingColor(v: string)            { this.groupingColorSignal.set(v || '#6366f1'); }
  @Input() set showGrouping(v: boolean)            { this.showGroupingSignal.set(v !== false); }
  @Input() set badges(v: string)                   { this.badgeKeySignal.set(v || 'badge'); }
  @Input() set badgesColor(v: string)              { this.defaultBadgeColorSignal.set(v || '#667eea'); }
  @Input() set showBadges(v: boolean)              { this.showBadgesSignal.set(v !== false); }
  @Input() set icons(v: string)                    { this.iconKeySignal.set(v || 'icon'); }
  @Input() set showIcons(v: boolean)               { this.showIconsSignal.set(v !== false); }
  @Input() set showRecentHistory(v: boolean)       { this.showRecentHistorySignal.set(!!v); }
  @Input() set historyKey(v: string)               { this.historyKeySignal.set(v || 'dd2-history'); }

  @ContentChild('mksDropdown') selectRef!: ElementRef<HTMLSelectElement>;
  @ViewChild('searchInput')  searchInputRef!: ElementRef;
  @Output() onChange = new EventEmitter<any>();

  // -- Private ---------------------------------------------------------------
  private _extDataSet         = signal(false);
  private _mutationObserver?: MutationObserver;
  private _onNativeFocus      = () => this.focusedSignal.set(true);
  private _onNativeBlur       = () => this.focusedSignal.set(false);

  // -- Signals ---------------------------------------------------------------
  focusedSignal           = signal(false);
  placeholderSignal       = signal('Select');
  disabledSignal          = signal(false);
  readonlySignal          = signal(false);
  canSearchSignal         = signal(true);
  loadingSignal           = signal(false);
  dataArraySignal         = signal<any[]>([]);
  selectedValueSignal     = signal<any>('');
  multipleSelectSignal    = signal(false);
  checkboxColorSignal     = signal('#6366f1');
  maxSelectSignal         = signal(0);
  valueKeySignal          = signal('value');
  labelKeySignal          = signal('label');
  searchFieldsSignal      = signal<string[]>([]);
  groupKeySignal          = signal('group');
  groupingColorSignal     = signal('#6366f1');
  showGroupingSignal      = signal(true);
  badgeKeySignal          = signal('badge');
  defaultBadgeColorSignal = signal('#667eea');
  showBadgesSignal        = signal(true);
  iconKeySignal           = signal('icon');
  showIconsSignal         = signal(true);
  showRecentHistorySignal = signal(false);
  historyKeySignal        = signal('dd2-history');
  showDropdownSignal      = signal(false);
  searchTextSignal        = signal('');
  selectedValueArrSignal  = signal<any[]>([]);
  allSelectCheckedSignal  = signal(false);
  focusedIndexSignal      = signal(-1);
  recentHistorySignal     = signal<any[]>([]);

  // -- Computed --------------------------------------------------------------
  /**
   * Custom UI is active when:
   *  - multipleSelect is true  (native select can't do multi)
   *  - OR explicit [dataArray] was provided
   * Otherwise: native <select> is shown with mat-form-field wrapper styling.
   */
  useCustomUI = computed(() => this.multipleSelectSignal() || this._extDataSet());

  filteredData = computed(() => {
    const data  = this.dataArraySignal();
    const q     = this.searchTextSignal().toLowerCase().trim();
    const extra = this.searchFieldsSignal();
    const lKey  = this.labelKeySignal();
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

  groupedData = computed((): { group: string; options: any[] }[] | null => {
    if (!this.showGroupingSignal()) return null;
    const data = this.filteredData();
    if (!data.length) return null;
    const gKey = this.groupKeySignal();
    if (!data.some((i: any) => typeof i === 'object' && i && i[gKey])) return null;
    const map = new Map<string, any[]>();
    data.forEach((item: any) => {
      const g = (typeof item === 'object' && item ? item[gKey] : null) || 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    });
    return Array.from(map.entries()).map(([group, options]) => ({ group, options }));
  });

  selectedLabel = computed(() => {
    const val = this.selectedValueSignal();
    if (!val) return '';
    const item = this.dataArraySignal().find(i => this.getValue(i) === val);
    return item ? this.getLabel(item) : String(val);
  });

  selectedCount = computed(() => this.selectedValueArrSignal().length);
  limitReached  = computed(() => { const m = this.maxSelectSignal(); return m > 0 && this.selectedValueArrSignal().length >= m; });
  indeterminate = computed(() => { const s = this.selectedValueArrSignal().length; const t = this.dataArraySignal().filter(i => !this.isItemDisabled(i)).length; return s > 0 && s < t; });

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void { this._loadHistory(); }

  ngAfterContentInit(): void {
    const sel = this.selectRef?.nativeElement;
    if (!sel) return;

    sel.addEventListener('focus', this._onNativeFocus);
    sel.addEventListener('blur',  this._onNativeBlur);

    // If no external [dataArray], read options from the native <select>
    if (!this._extDataSet()) {
      this._syncFromSelect();
      this._mutationObserver = new MutationObserver(() => {
        if (!this._extDataSet()) this._syncFromSelect();
      });
      this._mutationObserver.observe(sel, { childList: true, subtree: true });
    }
  }

  ngOnDestroy(): void {
    this._mutationObserver?.disconnect();
    const sel = this.selectRef?.nativeElement;
    if (!sel) return;
    sel.removeEventListener('focus', this._onNativeFocus);
    sel.removeEventListener('blur',  this._onNativeBlur);
  }

  // -- Select sync helpers ---------------------------------------------------
  /** Read <option> elements from the projected <select> into dataArraySignal */
  private _syncFromSelect(): void {
    const sel = this.selectRef?.nativeElement;
    if (!sel) return;
    const opts = Array.from(sel.options)
      .filter(o => o.value !== '')
      .map((o, i) => ({
        label:    o.text.trim(),
        value:    o.value,
        _idx:     i,
        disabled: o.disabled,
        group:    o.getAttribute('data-group') || undefined,
        badge:    o.getAttribute('data-badge') || undefined,
        icon:     o.getAttribute('data-icon')  || undefined,
      }));
    this.dataArraySignal.set(opts);
  }

  /** Push selected value back to native <select> so [(ngModel)] stays in sync */
  private _syncToSelect(val: any): void {
    const sel = this.selectRef?.nativeElement;
    if (!sel) return;
    sel.value = String(val ?? '');
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    sel.dispatchEvent(new Event('input',  { bubbles: true }));
  }

  // -- Host Listeners --------------------------------------------------------
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.elRef.nativeElement.contains(e.target)) {
      this.showDropdownSignal.set(false);
      this.focusedIndexSignal.set(-1);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.useCustomUI() || this.disabledSignal() || this.readonlySignal()) return;
    if (!this.showDropdownSignal()) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggleDropdown(); }
      return;
    }
    const opts = this.filteredData();
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.focusedIndexSignal.update(i => Math.min(i + 1, opts.length - 1)); this._scrollFocused(); break;
      case 'ArrowUp':   e.preventDefault(); this.focusedIndexSignal.update(i => Math.max(i - 1, 0)); this._scrollFocused(); break;
      case 'Enter': { e.preventDefault(); const fi = this.focusedIndexSignal(); if (fi >= 0 && fi < opts.length) this.toggleItem(opts[fi]); break; }
      case 'Escape': e.preventDefault(); this.showDropdownSignal.set(false); this.focusedIndexSignal.set(-1); break;
      case 'Tab':    this.showDropdownSignal.set(false); this.focusedIndexSignal.set(-1); break;
    }
  }

  // -- Core Actions ----------------------------------------------------------
  toggleDropdown(): void {
    if (this.disabledSignal() || this.readonlySignal()) return;
    this.showDropdownSignal.set(!this.showDropdownSignal());
    if (!this.showDropdownSignal()) this.focusedIndexSignal.set(-1);
  }

  toggleItem(item: any): void {
    if (this.isItemDisabled(item)) return;
    const uid = this.getUid(item);
    const val = this.getValue(item);
    const arr = [...this.selectedValueArrSignal()];
    if (this.multipleSelectSignal()) {
      const idx = arr.indexOf(uid);
      if (idx > -1) { arr.splice(idx, 1); }
      else { if (this.limitReached()) return; arr.push(uid); this._addToHistory(uid); }
      this.selectedValueArrSignal.set(arr);
      this.onChange.emit(arr.map(u => this.getValueByUid(u)));
    } else {
      this.selectedValueSignal.set(val);
      this.selectedValueArrSignal.set([uid]);
      this._addToHistory(uid);
      this._syncToSelect(val);
      this.onChange.emit(val);
      setTimeout(() => this.showDropdownSignal.set(false), 100);
    }
    this._updateAllSelectChecked();
  }

  selectAll(e: any): void {
    if (this.readonlySignal()) return;
    if (e.target.checked) {
      const max  = this.maxSelectSignal();
      let uids = this.dataArraySignal().filter(i => !this.isItemDisabled(i)).map(i => this.getUid(i));
      if (max > 0) uids = uids.slice(0, max);
      this.allSelectCheckedSignal.set(true);
      this.selectedValueArrSignal.set(uids);
      this.onChange.emit(uids.map(u => this.getValueByUid(u)));
    } else {
      this.allSelectCheckedSignal.set(false);
      this.selectedValueArrSignal.set([]);
      this.onChange.emit([]);
    }
  }

  removeTag(e: Event, uid: any): void {
    e.stopPropagation();
    const arr = this.selectedValueArrSignal().filter(u => u !== uid);
    this.selectedValueArrSignal.set(arr);
    this.onChange.emit(arr.map(u => this.getValueByUid(u)));
    this._updateAllSelectChecked();
  }

  clearAll(e: Event): void {
    e.stopPropagation();
    this.showDropdownSignal.set(true);
    this.selectedValueArrSignal.set([]);
    this.selectedValueSignal.set('');
    this.allSelectCheckedSignal.set(false);
    this._syncToSelect('');
    this.onChange.emit(this.multipleSelectSignal() ? [] : null);
  }

  clearSearch(e: Event): void {
    e.stopPropagation();
    this.searchTextSignal.set('');
    if (this.searchInputRef) setTimeout(() => this.searchInputRef.nativeElement.focus(), 0);
  }

  getUid(item: any): any         { return typeof item === 'object' && item && '_idx' in item ? item._idx : this.getValue(item); }
  getValueByUid(uid: any): any   { const item = this.dataArraySignal().find(i => this.getUid(i) === uid); return item ? this.getValue(item) : uid; }
  isChecked(item: any): boolean  { return this.selectedValueArrSignal().includes(this.getUid(item)); }

  onCheckboxClick(e: MouseEvent, item: any): void {
    e.stopPropagation();
    if (!this.isChecked(item) && this.limitReached()) e.preventDefault();
  }

  onLabelClick(e: MouseEvent, item: any): void {
    e.preventDefault(); e.stopPropagation();
    if (!this.isItemDisabled(item)) this.toggleItem(item);
  }

  // -- Helpers ---------------------------------------------------------------
  getLabel(item: any): string      { return typeof item === 'string' ? item : (item[this.labelKeySignal()] ?? String(item)); }
  getValue(item: any): any         { return typeof item === 'string' ? item : (item[this.valueKeySignal()] ?? item); }
  getIcon(item: any): string       { return typeof item === 'object' && item ? (item[this.iconKeySignal()] ?? '') : ''; }
  getBadge(item: any): string      { return typeof item === 'object' && item ? (item[this.badgeKeySignal()] ?? '') : ''; }
  getBadgeColor(item: any): string { return typeof item === 'object' && item ? (item.badgeColor ?? this.defaultBadgeColorSignal()) : this.defaultBadgeColorSignal(); }
  isItemDisabled(item: any): boolean { return typeof item === 'object' && !!item?.disabled; }

  getLabelForVal(uid: any): string {
    const item = this.dataArraySignal().find(i => this.getUid(i) === uid);
    return item ? this.getLabel(item) : String(uid);
  }

  private _updateAllSelectChecked(): void {
    const total = this.dataArraySignal().filter(i => !this.isItemDisabled(i)).length;
    this.allSelectCheckedSignal.set(this.selectedValueArrSignal().length === total && total > 0);
  }

  private _addToHistory(val: any): void {
    if (!this.showRecentHistorySignal()) return;
    let h = this.recentHistorySignal().filter(v => v !== val);
    h.unshift(val); h = h.slice(0, 5);
    this.recentHistorySignal.set(h);
    try { localStorage.setItem(this.historyKeySignal(), JSON.stringify(h)); } catch { }
  }

  private _loadHistory(): void {
    if (!this.showRecentHistorySignal()) return;
    try { const raw = localStorage.getItem(this.historyKeySignal()); if (raw) this.recentHistorySignal.set(JSON.parse(raw)); } catch { }
  }

  private _scrollFocused(): void {
    setTimeout(() => document.querySelector('.dd2-option.focused')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 0);
  }

  // -- Template getters ------------------------------------------------------
  get placeholder()      { return this.placeholderSignal(); }
  get disabled()         { return this.disabledSignal(); }
  get readonly()         { return this.readonlySignal(); }
  get canSearch()        { return this.canSearchSignal(); }
  get loading()          { return this.loadingSignal(); }
  get dataArray()        { return this.dataArraySignal(); }
  get multipleSelect()   { return this.multipleSelectSignal(); }
  get checkboxColor()    { return this.checkboxColorSignal(); }
  get maxSelect()        { return this.maxSelectSignal(); }
  get showDropdown()     { return this.showDropdownSignal(); }
  get searchText()       { return this.searchTextSignal(); }
  set searchText(v: string) { this.searchTextSignal.set(v); }
  get selectedValueArr() { return this.selectedValueArrSignal(); }
  get allSelectChecked() { return this.allSelectCheckedSignal(); }
  get focusedIndex()     { return this.focusedIndexSignal(); }
  get recentHistory()    { return this.recentHistorySignal(); }
  get showRecentHistory(){ return this.showRecentHistorySignal(); }
  get showBadges()       { return this.showBadgesSignal(); }
  get showIcons()        { return this.showIconsSignal(); }
  get groupingColor()    { return this.groupingColorSignal(); }
  get showGrouping()     { return this.showGroupingSignal(); }
  get focused()          { return this.focusedSignal(); }
}
