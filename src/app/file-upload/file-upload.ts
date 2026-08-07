import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, signal } from '@angular/core';

export interface UploadedFile {
  id:       string;
  file:     File;
  preview?: string;
  error?:   string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {

  @Input() accept     = '*';
  @Input() multiple   = true;
  @Input() maxSizeMB  = 10;
  @Input() maxFiles   = 20;
  @Input() color      = '#6366f1';
  @Input() label      = 'Drop files here or click to browse';
  @Output() onSelect  = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragging = signal(false);
  files      = signal<UploadedFile[]>([]);

  get validCount(): number { return this.files().filter(f => !f.error).length; }

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging.set(true); }
  onDragLeave(): void             { this.isDragging.set(false); }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    this.addFiles(Array.from(e.dataTransfer?.files ?? []));
  }

  onBrowse(): void { this.fileInput.nativeElement.click(); }

  onFileInput(e: Event): void {
    this.addFiles(Array.from((e.target as HTMLInputElement).files ?? []));
    (e.target as HTMLInputElement).value = '';
  }

  remove(id: string): void    { this.files.update(f => f.filter(x => x.id !== id)); }
  clear(): void               { this.files.set([]); }

  formatSize(bytes: number): string {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1048576)     return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  private addFiles(files: File[]): void {
    const existing = this.files();
    const toAdd: UploadedFile[] = [];

    for (const file of files) {
      if (existing.length + toAdd.length >= this.maxFiles) break;
      const id    = Math.random().toString(36).slice(2);
      const error = file.size > this.maxSizeMB * 1048576
        ? `Too large — max ${this.maxSizeMB} MB`
        : undefined;
      const uf: UploadedFile = { id, file, error };
      if (!error && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          this.files.update(list =>
            list.map(f => f.id === id ? { ...f, preview: ev.target!.result as string } : f)
          );
        };
        reader.readAsDataURL(file);
      }
      toAdd.push(uf);
    }

    this.files.update(f => [...f, ...toAdd]);
    this.onSelect.emit([...existing, ...toAdd].filter(f => !f.error).map(f => f.file));
  }
}
