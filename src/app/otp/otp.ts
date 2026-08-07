import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.scss',
})
export class Otp implements OnInit {

  @Input() length   = 6;
  @Input() masked   = false;
  @Input() color    = '#6366f1';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Output() onChange   = new EventEmitter<string>();
  @Output() onComplete = new EventEmitter<string>();

  @ViewChildren('otpBox') boxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits  = signal<string[]>([]);
  indices: number[] = [];

  get sepAfter(): number { return this.length === 6 ? 2 : -1; }

  ngOnInit(): void {
    this.digits.set(Array(this.length).fill(''));
    this.indices = Array.from({ length: this.length }, (_, i) => i);
  }

  onInput(i: number, e: Event): void {
    const raw   = (e.target as HTMLInputElement).value;
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr   = [...this.digits()];
    arr[i]      = digit;
    this.digits.set(arr);
    (e.target as HTMLInputElement).value = digit;
    if (digit && i < this.length - 1) this.focusAt(i + 1);
    this.emit(arr);
  }

  onKeyDown(i: number, e: KeyboardEvent): void {
    if (e.key === 'Backspace' && !this.digits()[i] && i > 0) this.focusAt(i - 1);
  }

  onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const nums = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, this.length);
    const arr  = Array(this.length).fill('');
    nums.split('').forEach((n, i) => (arr[i] = n));
    this.digits.set(arr);
    this.focusAt(Math.min(nums.length, this.length - 1));
    this.emit(arr);
  }

  private focusAt(i: number): void {
    setTimeout(() => this.boxes.get(i)?.nativeElement.focus());
  }

  private emit(arr: string[]): void {
    const val = arr.join('');
    this.onChange.emit(val);
    if (arr.every(d => d !== '') && val.length === this.length) this.onComplete.emit(val);
  }

  clear(): void {
    this.digits.set(Array(this.length).fill(''));
    this.focusAt(0);
    this.onChange.emit('');
  }
}
