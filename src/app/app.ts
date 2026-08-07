import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms'; 
import { Dropdown2 } from './dropdown2/dropdown2';
import { Toggle } from './toggle/toggle';
import { Range } from './range/range';
import { Loader } from './loader/loader';
import { LoaderService } from './loader/loader.service';
import { FilterSheet } from './filter-sheet/filter-sheet';
import { FilterSheetService, FilterResult } from './filter-sheet/filter-sheet.service';
import { Progress } from './progress/progress';
import { ToastComponent } from './toast/toast';
import { ToastService } from './toast/toast.service';
import { Otp } from './otp/otp';
import { FileUpload } from './file-upload/file-upload';
import { NumberInput } from './number-input/number-input';
import { ImageCropper } from './image-cropper/image-cropper';
import { ImageCropperService } from './image-cropper/image-cropper.service';
import { MultiStepper, StepItem } from './multi-stepper/multi-stepper';
import { Calendar } from './calendar/calendar';
import { Rating } from './rating/rating';
import { Pagination, PageChangeEvent } from './pagination/pagination';
import { Sort } from './sort/sort';
import { Grid, GridCol } from './grid/grid';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, Dropdown2, Toggle, Range, Loader, FilterSheet, Progress, ToastComponent, Otp, FileUpload, NumberInput, ImageCropper, MultiStepper, Calendar, Rating, Pagination, Sort, Grid],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-dropdown');

  private loaderService      = inject(LoaderService);
  private filterSheetService = inject(FilterSheetService);
  readonly toastSvc          = inject(ToastService);
  readonly imageCropperSvc   = inject(ImageCropperService);

  filterResult = signal<FilterResult | null>(null);

  // Progress demo
  pgValue  = signal(65);
  pgBuffer = signal(80);
  pgStep(n: number) { this.pgValue.update(v => Math.min(100, Math.max(0, v + n))); }

  // OTP demo
  otpValue = signal('');

  // Image cropper demo
  croppedImg = signal('');

  // Multi-stepper demo
  readonly demoSteps: StepItem[] = [
    { label: 'Account',  description: 'Basic info',    icon: '👤' },
    { label: 'Details',  description: 'Personal data', icon: '📋' },
    { label: 'Payment',  description: 'Billing',       icon: '💳' },
    { label: 'Confirm',  description: 'Review & done', icon: '✅' },
  ];

  // Number input demo
  niValue = signal(1);

  showLoader(): void {
    this.loaderService.show();
  }

  hideLoader(): void {
    this.loaderService.hide();
  }

  openFilter(): void {
    this.filterSheetService.open({
      categories: ['Mobiles', 'Laptops', 'Tablets', 'Accessories', 'Cameras', 'Audio'],
      brands:     ['Apple', 'Samsung', 'OnePlus', 'Sony', 'boAt', 'Xiaomi'],
      priceMin:   0,
      priceMax:   150000,
      colors: [
        { name: 'Black', hex: '#1e293b' },
        { name: 'White', hex: '#f1f5f9' },
        { name: 'Red',   hex: '#ef4444' },
        { name: 'Blue',  hex: '#3b82f6' },
        { name: 'Green', hex: '#22c55e' },
        { name: 'Gold',  hex: '#f59e0b' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    });
    this.filterSheetService.onApply$.subscribe(result => {
      this.filterResult.set(result);
    });
  }

  // Plain string array
  states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Object array with groups + icons + badges + disabled
  // techSkills: DropdownOption[] = [
  //   { label: 'Angular', value: 'angular', group: 'Frontend', badgeColor: '#dd0031' },
  //   { label: 'React', value: 'react', group: 'Frontend', badge: 'Hot', badgeColor: '#61dafb', tags: ['jsx', 'hooks'] },
  //   { label: 'Vue', value: 'vue', group: 'Frontend', badge: 'Stable', badgeColor: '#42b883' },
  //   { label: 'Svelte', value: 'svelte', group: 'Frontend', disabled: true },
  //   { label: 'Node.js', value: 'nodejs', group: 'Backend', icon: '\u{1F7E2}', badge: 'LTS', badgeColor: '#339933' },
  //   { label: 'Django', value: 'django', group: 'Backend', icon: '\u{1F40D}', tags: ['python', 'orm'] },
  //   { label: 'Spring', value: 'spring', group: 'Backend', icon: '\u2615', badge: 'Enterprise', badgeColor: '#6aad3d' },
  //   { label: 'Laravel', value: 'laravel', group: 'Backend', icon: '\u{1F534}', disabled: true },
  //   { label: 'PostgreSQL', value: 'postgresql', group: 'Database', icon: '\u{1F418}', badge: 'Open Source', badgeColor: '#336791' },
  //   { label: 'MongoDB', value: 'mongodb', group: 'Database', icon: '\u{1F343}', tags: ['nosql', 'document'] },
  //   { label: 'Redis', value: 'redis', group: 'Database', icon: '\u{1F53A}' },
  // ];




  techSkills =  [
    {
        id: 1,
        name: "Amit Sharma",
        email: "amit@example.com",
        address: { // Nested Object
            city: "Mumbai",
            pincode: 400001
        },
        skills: ["JavaScript", "React", "Node.js"] // Nested Array
    },
    {
        id: 2,
        name: "Priya Verma",
        email: "priya@example.com",
        address: { // Nested Object
            city: "Delhi",
            pincode: 110001
        },
        skills: ["Python", "Data Science", "Machine Learning"] // Nested Array
    }
];









  asyncData: string[] = [];
  isLoading = false;

  loadAsync(): void {
    this.isLoading = true;
    this.asyncData = [];
    setTimeout(() => {
      this.asyncData = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
      this.isLoading = false;
    }, 2000);
  }

  pins = ['243001', '201301', '750001', '800001'];

  // Dropdown2 — yahan apna koi bhi array bind karo
  fruitOptions = [
    { label: 'Apple', value: 'apple', group: 'Fruits', icon: '🍎', badge: 'Fresh', badgeColor: '#e53e3e' },
    { label: 'Banana', value: 'banana', group: 'Fruits', icon: '🍌' },
    { label: 'Mango', value: 'mango', group: 'Fruits', icon: '🥭', badge: 'Season', badgeColor: '#dd6b20' },
    { label: 'Orange', value: 'orange', group: 'Fruits', icon: '🍊' },
    { label: 'Grapes', value: 'grapes', group: 'Fruits', icon: '🍇', disabled: true },
    { label: 'Carrot', value: 'carrot', group: 'Vegetables', icon: '🥕' },
    { label: 'Broccoli', value: 'broccoli', group: 'Vegetables', icon: '🥦' },
    { label: 'Tomato', value: 'tomato', group: 'Vegetables', icon: '🍅', badge: 'Organic', badgeColor: '#38a169' },
    { label: 'Spinach', value: 'spinach', group: 'Vegetables', icon: '🌿', disabled: true },
  ];
  dd2SelectedValue: any = null;
  dd2SelectedValues: any[] = [];
  onFruitChange(val: any) {
    this.dd2SelectedValue = val;
    console.log('Dropdown2 selected:', val);
  }
  onFruitMultiChange(vals: any[]) {
    this.dd2SelectedValues = vals;
    console.log('Dropdown2 multi:', vals);
  }

  parentValue: any;
  parentValue2: any;
  parentValue3: any;
  parentValue4: any;





  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) { }

  state(value: any) { this.parentValue = value; console.log('state:', value); }
 
  skill(value: any) {
    this.parentValue2 = value;
    console.log('skill:', value);
    this.dd2SelectedValues=value;
  }

  pin(value: any) { this.parentValue3 = value; console.log('pin:', value); }
  async_(value: any) { this.parentValue4 = value; console.log('async:', value); }


  // #######################################################


  toggleChanged(value: boolean) {
    console.log(value); // true / false
  }

  // ####################3###############################3


  onTableSelect(rows: any[]) { console.log('selected:', rows); }
  onSortChanged(sort: { key: string; dir: 'asc' | 'desc' }) { console.log('sort:', sort); }
  // ── Server-side example ───────────────────────────────────────────────────
  serverData: any[] = [];       // API se aaya hua current page ka data
  serverTotal = 0;              // API se aaya total count

  loadServerData(event: PageChangeEvent): void {
    console.log('API call karoge:', event);
    // event.page     → page number (1-based)
    // event.pageSize → rows per page
    // event.skip     → OFFSET (SQL)
    // event.take     → LIMIT  (SQL)

    // Example: HTTP call
    // this.http.get(`/api/users?skip=${event.skip}&take=${event.take}`)
    //   .subscribe(res => {
    //     this.serverData  = res.data;
    //     this.serverTotal = res.total;
    //   });
  }

  onServerSort(event: { key: string; dir: 'asc' | 'desc' }): void {
    console.log('Sort changed:', event);
  }

  onPageChange(event: PageChangeEvent): void {
    console.log('page:', event.page, '| skip:', event.skip, '| take:', event.take);
  }

  // ── Grid cols ─────────────────────────────────────────────────────────────
  tableData = [
    { name: 'Rahul Sharma', role: 'Admin', status: 'Active', joined: '2024-01-15', verified: true },
    { name: 'Priya Singh', role: 'Manager', status: 'Active', joined: '2024-03-20', verified: true },
    { name: 'Amit Verma', role: 'User', status: 'Inactive', joined: '2024-05-10', verified: false },
    { name: 'Neha Gupta', role: 'User', status: 'Active', joined: '2024-06-01', verified: true },
    { name: 'Rohit Kumar', role: 'Intern', status: 'Pending', joined: '2024-07-22', verified: false },
    { name: 'Sunita Patel', role: 'Manager', status: 'Active', joined: '2023-11-05', verified: true },
    { name: 'Vijay Reddy', role: 'User', status: 'Active', joined: '2024-02-18', verified: true },
    { name: 'Kavya Joshi', role: 'Admin', status: 'Active', joined: '2023-09-30', verified: true },
    { name: 'Deepak Nair', role: 'User', status: 'Inactive', joined: '2024-04-14', verified: false },
    { name: 'Anita Mishra', role: 'Intern', status: 'Pending', joined: '2024-08-01', verified: false },
    { name: 'Suresh Pillai', role: 'User', status: 'Active', joined: '2024-01-28', verified: true },
    { name: 'Meena Iyer', role: 'Manager', status: 'Active', joined: '2023-12-15', verified: true },
  ];

  gridCols: GridCol[] = [
    { key: 'name', label: 'Name', sort: true },
    { key: 'role', label: 'Role', sort: true },
    { key: 'status', label: 'Status', sort: true },
    { key: 'joined', label: 'Joined', sort: true },
    { key: 'verified', label: 'Verified', align: 'center' },
  ];

  rangeChanged(value: number) { console.log(value); }
  dateChanged(value: any) { console.log('date:', value); }

  // ── Rating ──────────────────────────────────────────────────────────────
  ratingValue = 0;
  ratingChanged(v: number) { this.ratingValue = v; console.log('rating:', v); }



  // Calendar min/max (today ± 30 days example)
  minDate = new Date(new Date().setDate(new Date().getDate() - 30));
  maxDate = new Date(new Date().setDate(new Date().getDate() + 60));

  // ###################3##############################3



}

