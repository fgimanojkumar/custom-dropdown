import {
  Component, Input, Output, EventEmitter,
  signal, computed, ViewEncapsulation
} from "@angular/core";

export interface SortChangeEvent {
  key: string;
  dir: "asc" | "desc";
}

@Component({
  selector: "app-sort",
  exportAs: "appSort",
  standalone: true,
  template: "",                       // No UI — headless component
  encapsulation: ViewEncapsulation.None,
  host: { style: "display:none" }     // DOM mein kuch render nahi hoga
})
export class Sort {

  // Client mode: data do, sortedData milega
  @Input() set data(v: any[]) { this.dataSignal.set(v ?? []); }

  // Output: server-side API call ke liye
  @Output() onSort = new EventEmitter<SortChangeEvent>();

  dataSignal   = signal<any[]>([]);
  keySignal    = signal("");
  dirSignal    = signal<"asc" | "desc">("asc");

  // Client mode — sorted data
  sortedDataSignal = computed(() => {
    const key = this.keySignal(), dir = this.dirSignal();
    const data = [...this.dataSignal()];
    if (!key) return data;
    return data.sort((a, b) => {
      const cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
  });

  // ── Actions (accessible via #s="appSort") ─────────────────────────────────

  /** Column header par click karo — sort toggle karta hai */
  sort(key: string): void {
    if (this.keySignal() === key) {
      this.dirSignal.update(d => d === "asc" ? "desc" : "asc");
    } else {
      this.keySignal.set(key);
      this.dirSignal.set("asc");
    }
    this.onSort.emit({ key, dir: this.dirSignal() });
  }

  /** Sort clear karo */
  reset(): void {
    this.keySignal.set("");
    this.dirSignal.set("asc");
    this.onSort.emit({ key: "", dir: "asc" });
  }

  /** Th mein icon dikhao: ⇅ unsorted, ↑ asc, ↓ desc */
  sortIcon(key: string): string {
    if (this.keySignal() !== key) return ' ⇅';
    return this.dirSignal() === 'asc' ? ' ↑' : ' ↓';
  }

  /** Is column par sort chal raha hai? (CSS class ke liye) */
  isSorted(key: string): boolean { return this.keySignal() === key; }

  /** th ke liye combined class — [class]="s.thClass('name')" */
  thClass(key: string): string {
    return 'th-sort' + (this.isSorted(key) ? ' th-active' : '');
  }

  // ── Public Getters ────────────────────────────────────────────────────────
  get sortedData() { return this.sortedDataSignal(); }
  get sortKey()    { return this.keySignal(); }
  get sortDir()    { return this.dirSignal(); }
}
