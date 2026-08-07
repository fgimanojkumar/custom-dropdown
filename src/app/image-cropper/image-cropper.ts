import {
  Component, ElementRef, EventEmitter, HostListener,
  Input, Output, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperService } from './image-cropper.service';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-cropper.html',
  styleUrl: './image-cropper.scss',
})
export class ImageCropper {

  @Input() aspectRatio: number | null = null;
  @Input() color         = '#6366f1';
  @Input() outputQuality = 0.92;
  @Output() onCrop   = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  readonly svc = inject(ImageCropperService);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('img')       imgRef!: ElementRef<HTMLImageElement>;
  @ViewChild('fileIn')    fileInRef!: ElementRef<HTMLInputElement>;

  imageSrc       = signal('');
  isDraggingFile = signal(false);
  cropX = signal(60);
  cropY = signal(60);
  cropW = signal(200);
  cropH = signal(200);
  activeRatio: number | null = null;

  // Custom size inputs (display px, clamped to container on apply)
  customW = signal(200);
  customH = signal(200);

  applyCustomSize(): void {
    const c  = this.containerRef?.nativeElement;
    const mw = c ? c.clientWidth  : 9999;
    const mh = c ? c.clientHeight : 9999;
    const w  = Math.max(40, Math.min(this.customW(), mw));
    const h  = Math.max(40, Math.min(this.customH(), mh));
    this.aspectRatio = null;
    this.activeRatio = null;
    this.cropW.set(w);
    this.cropH.set(h);
    this.customW.set(w);
    this.customH.set(h);
    // Re-center crop box
    if (c) {
      this.cropX.set(Math.max(0, (mw - w) / 2));
      this.cropY.set(Math.max(0, (mh - h) / 2));
    }
  }

  private dragMode   = '';
  private dragStartX = 0;
  private dragStartY = 0;
  private startCrop  = { x: 0, y: 0, w: 0, h: 0 };

  // ── File input ─────────────────────────────────────────────────────────
  openFilePicker(): void { this.fileInRef.nativeElement.click(); }

  onFileInput(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file?.type.startsWith('image/')) this.loadFile(file);
  }

  onFileDragOver(e: DragEvent): void { e.preventDefault(); this.isDraggingFile.set(true); }
  onFileDragLeave(): void            { this.isDraggingFile.set(false); }
  onFileDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDraggingFile.set(false);
    const file = e.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) this.loadFile(file);
  }

  private loadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = ev => {
      this.imageSrc.set(ev.target!.result as string);
      setTimeout(() => this.initCropBox(), 50);
    };
    reader.readAsDataURL(file);
  }

  reset(): void { this.imageSrc.set(''); this.activeRatio = null; this.dragMode = ''; }

  cancelAndClose(): void {
    this.svc.close();
    this.reset();
    this.onCancel.emit();
  }

  // ── Crop box init ──────────────────────────────────────────────────────
  private initCropBox(): void {
    const c = this.containerRef.nativeElement;
    const w = c.clientWidth;
    const h = c.clientHeight;
    const size = Math.min(w, h) * 0.62;
    const cw   = size;
    const ch   = this.aspectRatio ? size / this.aspectRatio : size;
    this.cropX.set((w - cw) / 2);
    this.cropY.set((h - ch) / 2);
    this.cropW.set(cw);
    this.cropH.set(ch);
  }

  setAspectRatio(ratio: number | null): void {
    this.aspectRatio = ratio;
    this.activeRatio = ratio;
    if (ratio) this.cropH.set(this.cropW() / ratio);
  }

  // ── Mouse drag ─────────────────────────────────────────────────────────
  startMove(e: MouseEvent | TouchEvent): void {
    e.stopPropagation();
    this.beginDrag(e, 'move');
  }

  startResize(e: MouseEvent | TouchEvent, handle: string): void {
    e.stopPropagation();
    this.beginDrag(e, handle);
  }

  private beginDrag(e: MouseEvent | TouchEvent, mode: string): void {
    const p = 'touches' in e ? e.touches[0] : e;
    this.dragMode   = mode;
    this.dragStartX = p.clientX;
    this.dragStartY = p.clientY;
    this.startCrop  = { x: this.cropX(), y: this.cropY(), w: this.cropW(), h: this.cropH() };
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onPointerMove(e: MouseEvent | TouchEvent): void {
    if (!this.dragMode || !this.containerRef) return;
    const p  = 'touches' in e ? e.touches[0] : e;
    const dx = p.clientX - this.dragStartX;
    const dy = p.clientY - this.dragStartY;
    const c  = this.containerRef.nativeElement;
    const mw = c.clientWidth;
    const mh = c.clientHeight;
    const s  = this.startCrop;
    const MIN = 40;

    if (this.dragMode === 'move') {
      this.cropX.set(Math.max(0, Math.min(mw - s.w, s.x + dx)));
      this.cropY.set(Math.max(0, Math.min(mh - s.h, s.y + dy)));
      return;
    }

    let nx = s.x, ny = s.y, nw = s.w, nh = s.h;
    if (this.dragMode.includes('e'))  nw = Math.max(MIN, s.w + dx);
    if (this.dragMode.includes('s'))  nh = Math.max(MIN, s.h + dy);
    if (this.dragMode.includes('w')) { nx = s.x + dx; nw = Math.max(MIN, s.w - dx); }
    if (this.dragMode.includes('n')) { ny = s.y + dy; nh = Math.max(MIN, s.h - dy); }
    if (this.aspectRatio)             nh = nw / this.aspectRatio;

    this.cropX.set(Math.max(0, Math.min(nx, mw - MIN)));
    this.cropY.set(Math.max(0, Math.min(ny, mh - MIN)));
    this.cropW.set(Math.min(nw, mw - this.cropX()));
    this.cropH.set(Math.min(nh, mh - this.cropY()));
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onPointerUp(): void { this.dragMode = ''; }

  // ── Crop output ────────────────────────────────────────────────────────
  cropImage(): void {
    const img       = this.imgRef.nativeElement;
    const container = this.containerRef.nativeElement;
    const ir        = img.getBoundingClientRect();
    const cr        = container.getBoundingClientRect();

    const imgL   = ir.left - cr.left;
    const imgT   = ir.top  - cr.top;
    const scaleX = img.naturalWidth  / ir.width;
    const scaleY = img.naturalHeight / ir.height;

    const srcX = Math.max(0, (this.cropX() - imgL) * scaleX);
    const srcY = Math.max(0, (this.cropY() - imgT) * scaleY);
    const srcW = Math.min(this.cropW() * scaleX, img.naturalWidth  - srcX);
    const srcH = Math.min(this.cropH() * scaleY, img.naturalHeight - srcY);

    const canvas  = document.createElement('canvas');
    canvas.width  = Math.max(1, Math.round(srcW));
    canvas.height = Math.max(1, Math.round(srcH));
    canvas.getContext('2d')!.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', this.outputQuality);
    this.onCrop.emit(base64);
    this.svc.onCrop$.next(base64);
    this.svc.close();
    this.reset();
  }

  get cropSizeLabel(): string {
    return `${Math.round(this.cropW())} × ${Math.round(this.cropH())}`;
  }
}
