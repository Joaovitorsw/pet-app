import { Directive, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { distinctUntilChanged, tap } from 'rxjs';

@Directive({
  selector: '[matStartDate][formControlName]',
  standalone: true,
})
export class FormControlRangeDirective implements OnInit {
  firstValue: string | null;
  secondValue: string | null;
  constructor(private readonly ngControl: NgControl) {}

  ngOnInit(): void {
    this.ngControl.control?.valueChanges
      .pipe(
        tap((value) => {
          if (!value) {
            this.firstValue = null;
            this.secondValue = null;
          }
          if (!this.firstValue) {
            this.firstValue = value;
            return;
          }
          if (this.firstValue && !this.secondValue) {
            this.secondValue = value;
          }
        }),
        distinctUntilChanged(),
        tap(() => {
          if (this.firstValue && this.secondValue) {
            if (
              new Date(this.firstValue).getTime() >
              new Date(this.secondValue).getTime()
            ) {
              const temp = this.firstValue;
              this.firstValue = this.secondValue;
              this.secondValue = temp;
            }

            this.ngControl.control?.setValue(
              [new Date(this.firstValue), new Date(this.secondValue)],
              {
                emitViewToModelChange: false,
                emitModelToViewChange: false,
                emitEvent: false,
              }
            );
          }
        })
      )
      .subscribe();
  }
}
