import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export interface StepItem {
  label:        string;
  description?: string;
  icon?:        string;
  optional?:    boolean;
}

@Component({
  selector: 'app-multi-stepper',
  exportAs: 'appMultiStepper',
  standalone: true,
  imports: [],
  templateUrl: './multi-stepper.html',
  styleUrl: './multi-stepper.scss',
})
export class MultiStepper {

  @Input() steps:       StepItem[] = [];
  @Input() color       = '#6366f1';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() clickable   = true;
  @Input() linear      = true;
  @Output() onStepChange = new EventEmitter<number>();

  currentStep    = signal(0);
  completedSteps = signal<number[]>([]);

  get isFirst(): boolean { return this.currentStep() === 0; }
  get isLast():  boolean { return this.currentStep() === this.steps.length - 1; }

  isActive(i: number):    boolean { return this.currentStep() === i; }
  isCompleted(i: number): boolean { return this.completedSteps().includes(i); }

  isReachable(i: number): boolean {
    if (!this.linear) return true;
    const maxDone = this.completedSteps().length ? Math.max(...this.completedSteps()) : -1;
    return i <= maxDone + 1;
  }

  next(): void {
    const curr = this.currentStep();
    if (curr >= this.steps.length - 1) return;
    this.completedSteps.update(s => s.includes(curr) ? s : [...s, curr]);
    this.currentStep.set(curr + 1);
    this.onStepChange.emit(curr + 1);
  }

  prev(): void {
    const curr = this.currentStep();
    if (curr <= 0) return;
    this.currentStep.set(curr - 1);
    this.onStepChange.emit(curr - 1);
  }

  goTo(i: number): void {
    if (!this.clickable || !this.isReachable(i)) return;
    this.currentStep.set(i);
    this.onStepChange.emit(i);
  }

  markComplete(): void {
    const curr = this.currentStep();
    this.completedSteps.update(s => s.includes(curr) ? s : [...s, curr]);
  }

  reset(): void {
    this.currentStep.set(0);
    this.completedSteps.set([]);
  }
}
