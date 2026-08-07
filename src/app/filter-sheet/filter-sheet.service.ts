import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface FilterSheetConfig {
  categories?:  string[];
  brands?:      string[];
  priceMin?:    number;
  priceMax?:    number;
  colors?:      { name: string; hex: string }[];
  sizes?:       string[];
}

export interface FilterResult {
  sortBy:       string;
  priceMin:     number;
  priceMax:     number;
  categories:   string[];
  brands:       string[];
  minRating:    number;
  discount:     string;
  selectedColors: string[];
  selectedSizes:  string[];
  delivery:     string[];
  availability: string;
}

@Injectable({ providedIn: 'root' })
export class FilterSheetService {

  readonly visible = signal(false);
  readonly config  = signal<FilterSheetConfig>({});

  readonly onApply$ = new Subject<FilterResult>();
  readonly onReset$ = new Subject<void>();

  open(cfg?: FilterSheetConfig): void {
    if (cfg) this.config.set(cfg);
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
  }
}
