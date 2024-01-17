import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatCalendar,
  MatDateRangePicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Subject,
  distinctUntilChanged,
  map,
  share,
  switchMap,
  throttleTime,
} from 'rxjs';
import { SearchChipComponent } from '../../../../shared/components/search-chip/search-chip.component';
import { NotificationService } from '../../../../shared/services/notification/notification.service';
import { FormControlRangeDirective } from '../../directives/form-control-range/form-control-range.directive';
import { Owner, Pet } from '../../interfaces/pet';
import { PetService } from '../../services/pet/pet.service';

@Component({
  selector: 'app-search-pet-form',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatTooltipModule,
    FormControlRangeDirective,
    MatChipsModule,
    MatAutocompleteModule,
    SearchChipComponent,
  ],
  templateUrl: './search-pet-form.component.html',
  styleUrl: './search-pet-form.component.scss',
})
export class SearchPetFormComponent implements OnInit, AfterViewInit {
  @ViewChildren(MatDateRangePicker)
  matDateRangePicker: QueryList<MatDateRangePicker<Date>>;
  formGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl(),
    birthDate: new FormControl(),
    updatedAt: new FormControl(),
    createdAt: new FormControl(),
    owner: new FormControl(),
  });
  @Input() owners: WritableSignal<Owner[]>;
  currentPicker: string;
  calendarResponse: WritableSignal<{ day: string; total: number }[]> = signal(
    []
  );
  changeDetectorRef = inject(ChangeDetectorRef);
  dateNow = new Date();
  calendarResponse$ = new Subject<{
    field: string;
    year: number;
    month: number;
  }>();

  constructor(
    readonly notificationService: NotificationService,
    readonly matDialog: MatDialog,
    readonly petService: PetService
  ) {}

  ngOnInit(): void {
    this.calendarResponse$
      .pipe(
        throttleTime(2500),
        distinctUntilChanged((a, b) => {
          return (
            a.field === b.field && a.year === b.year && a.month === b.month
          );
        }),
        switchMap((request) => {
          this.calendarResponse.set([]);
          return this.petService.calendar(request);
        })
      )
      .subscribe((response) => {
        this.calendarResponse.set(response.data);

        const calendar = this.matDateRangePicker.find(
          (item) => item['_componentRef']?.instance
        )?.['_componentRef']?.instance?._calendar as MatCalendar<Date>;

        if (calendar) {
          calendar.updateTodaysDate();
        }
      });
  }
  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();
  }
  get optionsID() {
    return this.getFnPredicate('id');
  }
  get optionsName() {
    return this.getFnPredicate('name');
  }
  private getFnPredicate(field: (keyof Pet & 'id') | 'name') {
    return {
      getFn: (search: string) =>
        this.petService
          .searchPets({
            ...this.formGroup.value,
            ...(this.formGroup.value.owner?.length > 0
              ? { owner: this.formGroup.value.owner }
              : {}),
            [field]: `LIKE=${search}`,
          })
          .pipe(
            map((pets) => pets.data.items.map((pet) => pet[field]?.toString())),
            share()
          ),
    };
  }
  resetFormControl(controlName: string) {
    this.formGroup.get(controlName)?.reset(null);
  }
  getCalendarData() {
    this.calendarResponse$.next({
      field: this.currentPicker,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
  }
  dateClass(cellDate: Date, view: string) {
    this.calendarResponse$.next({
      field: this.currentPicker,
      year: cellDate.getFullYear(),
      month: cellDate.getMonth() + 1,
    });

    const date = this.calendarResponse().find((item) => {
      const date = new Date(item?.day?.replaceAll('-', '/'));
      return (
        date.getDate() === cellDate.getDate() &&
        date.getFullYear() === cellDate.getFullYear() &&
        date.getMonth() === cellDate.getMonth()
      );
    });

    if (date) {
      setTimeout(() => {
        const cell = [
          ...document.querySelectorAll<HTMLSpanElement>(
            '.mat-calendar-body-cell-content'
          ),
        ].find(
          (cell) => cell.innerText === cellDate.getDate().toString()
        )?.parentElement;

        cell?.style?.setProperty('--color', this.colorCalculate(date.total));
      }, 500);
    }

    return date ? 'custom-date-class' : '';
  }
  colorCalculate(percentual: number) {
    let red, green;
    const blue = 0;
    if (percentual < 50) {
      green = 255;
      red = Math.round(5.1 * percentual);
    } else {
      red = 155;
      green = Math.round(5.1 * percentual);
    }
    const hexadecimal = red * 0x10000 + green * 0x100 + blue * 0x1;
    return `#${('000000' + hexadecimal.toString(16)).slice(-6)}`;
  }
}
