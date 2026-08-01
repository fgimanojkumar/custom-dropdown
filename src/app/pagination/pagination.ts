import {
  Component, Input, Output, EventEmitter,
  signal, computed, OnChanges, SimpleChanges,
  ViewEncapsulation
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

export interface PageChangeEvent {
  page: number;      // current page (1-based)
  pageSize: number;  // items per page
  skip: number;      // SQL OFFSET  → (page-1) * pageSize
  take: number;      // SQL LIMIT   → pageSize
}

@Component({
  selector: "app-pagination",
  exportAs: "appPagination",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./pagination.html",
  styleUrls: ["./pagination.scss"],
  encapsulation: ViewEncapsulation.None
})
export class Pagination implements OnChanges {

  // ── Client mode: poora data do, component khud paginate karega ────────────
  @Input() set data(v: any[]) { this.dataSignal.set(v ?? []); }

  // ── Server mode: sirf total count do (API ka), data tum khud render karo ──
  @Input() set total(v: number) { this.totalSignal.set(+v || 0); }

  // ── Controlled current page (server mode mein use karo) ───────────────────
  @Input() set currentPage(v: number) {
    if (+v && +v !== this.currentPageSignal()) this.currentPageSignal.set(+v);
  }

  @Input() set pageSize(v: number)          { this.pageSizeSignal.set(+v || 10); }
  @Input() set pageSizeOptions(v: number[]) { this.pageSzOptsSignal.set(v ?? [5, 10, 25, 50]); }
  @Input() set color(v: string)             { this.colorSignal.set(v || "#6366f1"); }
  @Input() set showInfo(v: boolean)         { this.showInfoSignal.set(v !== false); }
  @Input() set showPageSize(v: boolean)     { this.showPageSizeSignal.set(v !== false); }

  // ── Output: page change event (server-side API call ke liye) ──────────────
  @Output() onPageChange = new EventEmitter<PageChangeEvent>();

  dataSignal          = signal<any[]>([]);
  totalSignal         = signal(0);
  pageSizeSignal      = signal(10);
  pageSzOptsSignal    = signal([5, 10, 25, 50]);
  colorSignal         = signal("#6366f1");
  showInfoSignal      = signal(true);
  showPageSizeSignal  = signal(true);
  currentPageSignal   = signal(1);

  // ── Computed ──────────────────────────────────────────────────────────────

  // Total items — server mode: use totalSignal, client mode: use data length
  totalItemsSignal = computed(() =>
    this.totalSignal() > 0 ? this.totalSignal() : this.dataSignal().length
  );

  totalPagesSignal = computed(() =>
    Math.max(1, Math.ceil(this.totalItemsSignal() / this.pageSizeSignal()))
  );

  // Client mode only: sliced data for @for loop
  pagedDataSignal = computed(() => {
    const data = this.dataSignal();
    if (!data.length) return [];
    const p = this.currentPageSignal(), s = this.pageSizeSignal();
    return data.slice((p - 1) * s, p * s);
  });

  pageNumbersSignal = computed(() => {
    const total = this.totalPagesSignal(), cur = this.currentPageSignal();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    if (cur > 3) pages.push("...");
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  });

  startSignal = computed(() =>
    this.totalItemsSignal() === 0 ? 0 : (this.currentPageSignal() - 1) * this.pageSizeSignal() + 1
  );
  endSignal = computed(() =>
    Math.min(this.currentPageSignal() * this.pageSizeSignal(), this.totalItemsSignal())
  );

  ngOnChanges(changes: SimpleChanges): void {
    // pageSize change hone par first page pe jao
    if (changes['pageSize'] && !changes['pageSize'].firstChange) {
      this.currentPageSignal.set(1);
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  goPage(p: number | string): void {
    if (typeof p !== "number") return;
    const clamped = Math.max(1, Math.min(p, this.totalPagesSignal()));
    if (clamped === this.currentPageSignal()) return;
    this.currentPageSignal.set(clamped);
    this._emit();
  }

  changePageSize(v: string): void {
    this.pageSizeSignal.set(+v);
    this.currentPageSignal.set(1);
    this._emit();
  }

  private _emit(): void {
    const page     = this.currentPageSignal();
    const pageSize = this.pageSizeSignal();
    this.onPageChange.emit({
      page,
      pageSize,
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }

  // ── Public API (via #pg="appPagination") ─────────────────────────────────
  get pagedData()       { return this.pagedDataSignal(); }
  get currentPage()     { return this.currentPageSignal(); }
  get totalPages()      { return this.totalPagesSignal(); }
  get totalItems()      { return this.totalItemsSignal(); }
  get pageNumbers()     { return this.pageNumbersSignal(); }
  get startRow()        { return this.startSignal(); }
  get endRow()          { return this.endSignal(); }
  get color()           { return this.colorSignal(); }
  get pageSizeVal()     { return this.pageSizeSignal(); }
  get pageSizeOptions() { return this.pageSzOptsSignal(); }
  get showInfo()        { return this.showInfoSignal(); }
  get showPageSize()    { return this.showPageSizeSignal(); }
}
