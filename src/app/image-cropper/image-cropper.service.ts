import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageCropperService {

  readonly visible = signal(false);
  readonly onCrop$ = new Subject<string>(); // emits base64 cropped image

  open(): void  { this.visible.set(true); }
  close(): void { this.visible.set(false); }
}
