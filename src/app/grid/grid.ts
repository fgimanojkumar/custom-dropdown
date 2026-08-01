import {
  Component, Input, Output, EventEmitter,
  signal, computed, ContentChild, TemplateRef,
  AfterContentInit, ViewEncapsulation
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PageChangeEvent } from "../pagination/pagination";

export interface GridCol {
  key: string;
  label: string;
  sort?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

@Component({
  selector: "app-grid",
  exportAs: "appGrid",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./grid.html",
  styleUrls: ["./grid.scss"],
  encapsulation: ViewEncapsulation.None
})
export class Grid implements AfterContentInit {

  @Input() set data(v: any[])              { this.dataSignal.set(v ?? []); this.currentPageSignal.set(1); }
  @Input() set cols(v: GridCol[])          { this.colsSignal.set(v ?? []); }
  @Input() set pageSize(v: number)         { this.pageSizeSignal.set(+v || 10); }
  @Input() set pageSizeOptions(v: number[]){ this.pageSzOptsSignal.set(v ?? [5, 10, 25, 50]); }
  @Input() set color(v: string)            { this.colorSignal.set(v || "#6366f1"); }
  @Input() set striped(v: boolean)         { this.stripedSignal.set(!!v); }
  @Input() set showInfo(v: boolean)        { this.showInfoSignal.set(v !== false); }
  @Input() set showPageSize(v: boolean)    { this.showPageSizeSignal.set(v !== false); }

  @Output() onPageChange = new EventEmitter<PageChangeEvent>();
  @Output() onSort       = new EventEmitter<{ key: string; dir: "asc" | "desc" }>();

  // User defines row template: <ng-template #row let-r> ... </ng-template>
  @ContentChild("row", { read: TemplateRef }) rowTpl!: TemplateRef<any>;

  dataSignal         = signal<any[]>([]);
  colsSignal         = signal<GridCol[]>([]);
  colorSignal        = signal("#6366f1");
  pageSizeSignal     = signal(10);
  pageSzOptsSignal   = signal([5, 10, 25, 50]);
  stripedSignal      = signal(false);
  showInfoSignal     = signal(true);
  showPageSizeSignal = signal(true);
  sortKeySignal      = signal("");
  sortDirSignal      = signal<"asc" | "desc">("asc");
  currentPageSignal  = signal(1);

  sortedSignal = computed(() => {
    const key = this.sortKeySignal(), dir = this.sortDirSignal();
    const data = [...this.dataSignal()];
    if (!key) return data;
    return data.sort((a, b) => {
      const cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
  });

  totalPagesSignal = computed(() =>
    Math.max(1, Math.ceil(this.dataSignal().length / this.pageSizeSignal()))
  );

  pagedSignal = computed(() => {
    const p = this.currentPageSignal(), s = this.pageSizeSignal();
    return this.sortedSignal().slice((p - 1) * s, p * s);
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
    this.dataSignal().length === 0 ? 0 : (this.currentPageSignal() - 1) * this.pageSizeSignal() + 1
  );
  endSignal = computed(() =>
    Math.min(this.currentPageSignal() * this.pageSizeSignal(), this.dataSignal().length)
  );

  sort(key: string): void {
    if (this.sortKeySignal() === key) {
      this.sortDirSignal.update(d => d === "asc" ? "desc" : "asc");
    } else {
      this.sortKeySignal.set(key);
      this.sortDirSignal.set("asc");
    }
    this.currentPageSignal.set(1);
    this.onSort.emit({ key, dir: this.sortDirSignal() });
  }

  sortIcon(key: string): string {
    if (this.sortKeySignal() !== key) return " ⇅";
    return this.sortDirSignal() === "asc" ? " ↑" : " ↓";
  }

  thClass(col: GridCol): string {
    const sort   = col.sort ? "th-sort" : "";
    const active = col.sort && this.sortKeySignal() === col.key ? " th-active" : "";
    return sort + active;
  }

  goPage(p: number | string): void {
    if (typeof p !== "number") return;
    const page = Math.max(1, Math.min(p, this.totalPagesSignal()));
    this.currentPageSignal.set(page);
    const pageSize = this.pageSizeSignal();
    this.onPageChange.emit({ page, pageSize, skip: (page - 1) * pageSize, take: pageSize });
  }

  changePageSize(v: string): void {
    this.pageSizeSignal.set(+v);
    this.currentPageSignal.set(1);
  }

  rowCtx(row: any, i: number) { return { $implicit: row, i }; }

  ngAfterContentInit(): void {}

  get pagedData()      { return this.pagedSignal(); }
  get rows()           { return this.pagedSignal(); }  // alias — simpler naam
  get totalPages()     { return this.totalPagesSignal(); }
  get pageNumbers()    { return this.pageNumbersSignal(); }
  get currentPage()    { return this.currentPageSignal(); }
  get startRow()       { return this.startSignal(); }
  get endRow()         { return this.endSignal(); }
  get totalItems()     { return this.dataSignal().length; }
  get color()          { return this.colorSignal(); }
  get pageSizeVal()    { return this.pageSizeSignal(); }
  get pageSizeOptions(){ return this.pageSzOptsSignal(); }
  get cols()           { return this.colsSignal(); }
  get striped()        { return this.stripedSignal(); }
  get showInfo()       { return this.showInfoSignal(); }
  get showPageSize()   { return this.showPageSizeSignal(); }
}
