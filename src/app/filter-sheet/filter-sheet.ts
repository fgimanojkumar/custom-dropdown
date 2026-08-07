import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSheetService, FilterResult } from './filter-sheet.service';

@Component({
  selector: 'app-filter-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sheet.html',
  styleUrl: './filter-sheet.scss',
})
export class FilterSheet {

  readonly service = inject(FilterSheetService);

  readonly sortOptions = [
    { value: 'popular',    label: 'Popular' },
    { value: 'price_asc',  label: 'Low to High' },
    { value: 'price_desc', label: 'High to Low' },
    { value: 'newest',     label: 'Newest' },
    { value: 'rating',     label: 'Top Rated' },
  ];

  readonly stars = [1, 2, 3, 4, 5];

  // Currently selected left-panel key
  activeSection = signal('sort');

  // Swipe-down to close
  private dragStartY = 0;
  dragOffsetY = signal(0);

  onDragStart(e: TouchEvent): void {
    this.dragStartY = e.touches[0].clientY;
    this.dragOffsetY.set(0);
  }

  onDragMove(e: TouchEvent): void {
    const dy = e.touches[0].clientY - this.dragStartY;
    if (dy > 0) this.dragOffsetY.set(dy);
  }

  onDragEnd(): void {
    if (this.dragOffsetY() > 100) {
      this.close();
    }
    this.dragOffsetY.set(0);
  }

  // Filter state
  sortBy             = signal('popular');
  priceMin           = signal(0);
  priceMax           = signal(10000);
  selectedCategories = signal<string[]>([]);
  selectedBrands     = signal<string[]>([]);
  minRating          = signal(0);
  discount           = signal('');
  selectedColors     = signal<string[]>([]);
  selectedSizes      = signal<string[]>([]);
  delivery           = signal<string[]>([]);
  availability       = signal('all');

  readonly discountOptions = [
    { value: '10',  label: '10% & above' },
    { value: '20',  label: '20% & above' },
    { value: '30',  label: '30% & above' },
    { value: '50',  label: '50% & above' },
  ];

  readonly deliveryOptions = [
    { value: 'fast',     label: 'Fast Delivery' },
    { value: 'free',     label: 'Free Delivery' },
    { value: 'same_day', label: 'Same Day' },
  ];

  readonly availabilityOptions = [
    { value: 'all',      label: 'All' },
    { value: 'in_stock', label: 'In Stock Only' },
  ];

  get cfg()            { return this.service.config(); }
  get categories()     { return this.cfg.categories ?? []; }
  get brands()         { return this.cfg.brands     ?? []; }
  get colors()         { return this.cfg.colors     ?? []; }
  get sizes()          { return this.cfg.sizes      ?? []; }
  get configPriceMin() { return this.cfg.priceMin   ?? 0; }
  get configPriceMax() { return this.cfg.priceMax   ?? 10000; }

  get activeCount(): number {
    let n = 0;
    if (this.sortBy() !== 'popular') n++;
    if (this.priceMin() > this.configPriceMin || this.priceMax() < this.configPriceMax) n++;
    n += this.selectedCategories().length + this.selectedBrands().length;
    if (this.minRating() > 0) n++;
    if (this.discount()) n++;
    n += this.selectedColors().length + this.selectedSizes().length + this.delivery().length;
    if (this.availability() !== 'all') n++;
    return n;
  }

  sectionCount(key: string): number {
    if (key === 'sort')         return this.sortBy() !== 'popular' ? 1 : 0;
    if (key === 'price')        return (this.priceMin() > this.configPriceMin || this.priceMax() < this.configPriceMax) ? 1 : 0;
    if (key === 'category')     return this.selectedCategories().length;
    if (key === 'brand')        return this.selectedBrands().length;
    if (key === 'rating')       return this.minRating() > 0 ? 1 : 0;
    if (key === 'discount')     return this.discount() ? 1 : 0;
    if (key === 'color')        return this.selectedColors().length;
    if (key === 'size')         return this.selectedSizes().length;
    if (key === 'delivery')     return this.delivery().length;
    if (key === 'availability') return this.availability() !== 'all' ? 1 : 0;
    return 0;
  }

  constructor() {
    // Reset price bounds whenever sheet is opened
    effect(() => {
      if (this.service.visible()) {
        this.priceMin.set(this.configPriceMin);
        this.priceMax.set(this.configPriceMax);
      }
    });
  }

  toggleCategory(cat: string): void {
    this.selectedCategories.update(l =>
      l.includes(cat) ? l.filter(c => c !== cat) : [...l, cat]
    );
  }

  toggleBrand(brand: string): void {
    this.selectedBrands.update(l =>
      l.includes(brand) ? l.filter(b => b !== brand) : [...l, brand]
    );
  }

  toggleColor(name: string): void {
    this.selectedColors.update(l =>
      l.includes(name) ? l.filter(c => c !== name) : [...l, name]
    );
  }

  toggleSize(size: string): void {
    this.selectedSizes.update(l =>
      l.includes(size) ? l.filter(s => s !== size) : [...l, size]
    );
  }

  toggleDelivery(val: string): void {
    this.delivery.update(l =>
      l.includes(val) ? l.filter(d => d !== val) : [...l, val]
    );
  }

  setRating(r: number): void {
    this.minRating.set(this.minRating() === r ? 0 : r);
  }

  reset(): void {
    this.sortBy.set('popular');
    this.priceMin.set(this.configPriceMin);
    this.priceMax.set(this.configPriceMax);
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.minRating.set(0);
    this.discount.set('');
    this.selectedColors.set([]);
    this.selectedSizes.set([]);
    this.delivery.set([]);
    this.availability.set('all');
    this.service.onReset$.next();
  }

  apply(): void {
    const result: FilterResult = {
      sortBy:         this.sortBy(),
      priceMin:       Math.min(this.priceMin(), this.priceMax()),
      priceMax:       Math.max(this.priceMin(), this.priceMax()),
      categories:     this.selectedCategories(),
      brands:         this.selectedBrands(),
      minRating:      this.minRating(),
      discount:       this.discount(),
      selectedColors: this.selectedColors(),
      selectedSizes:  this.selectedSizes(),
      delivery:       this.delivery(),
      availability:   this.availability(),
    };
    this.service.onApply$.next(result);
    this.service.close();
  }

  close(): void {
    this.service.close();
  }
}
