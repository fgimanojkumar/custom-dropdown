import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {

  readonly loaderService = inject(LoaderService);

  // Computed helpers so template stays simple
  get visibleSignal() { return this.loaderService.visible; }
  get cfg() { return this.loaderService.config(); }

  get title()       { return this.cfg.title       ?? 'Loading...'; }
  get message()     { return this.cfg.message     ?? 'Please wait while we process your request'; }
  get color()       { return this.cfg.color       ?? '#6366f1'; }
  get backdrop()    { return this.cfg.backdrop     ?? 'blur'; }
  get type()        { return this.cfg.type         ?? 'dots'; }
  get showTitle()   { return this.cfg.showTitle    ?? true; }
  get showMessage() { return this.cfg.showMessage  ?? true; }
  get fullscreen()  { return this.cfg.fullscreen   ?? true; }
  get image()                { return this.cfg.image                ?? ''; }
  get showImage()             { return this.cfg.showImage            ?? false; }
  get closeOnBackdropClick()  { return this.cfg.closeOnBackdropClick ?? false; }

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) this.loaderService.hide();
  }
}
