import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  SkipSelf,
  ViewChild,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, Observable, of } from 'rxjs';
import { share, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'search-chip',
  templateUrl: 'search-chip.component.html',
  styleUrls: ['search-chip.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchChipComponent),
      multi: true,
    },
  ],
})
export class SearchChipComponent
  implements ControlValueAccessor, AfterViewInit
{
  separatorKeysCodes: number[] = [ENTER, COMMA];
  itemsControl = new FormControl();
  @Input() options: {
    getFn: (search: string) => Observable<string[]>;
  };
  @Input() items: string[] = [];
  allItems: string[] = [];
  @Input() placeholder: string = 'Search';
  @Input() label: string;
  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);
  changeDetectorRef = inject(ChangeDetectorRef);
  onChange: any;
  onTouch: any;
  value: any;
  search$: Observable<string[]>;

  constructor(@SkipSelf() private form: FormGroupDirective) {}

  ngAfterViewInit(): void {
    this.form.valueChanges?.subscribe((value) => {
      this.search$ = this.options.getFn(this.itemsControl.value ?? '').pipe(
        tap((items) => {
          this.allItems = items;
        }),
        switchMap((items) => {
          return of(items.filter((item) => !this.items.includes(item)));
        }),
        share()
      );
    });
    this.itemsControl.valueChanges
      .pipe(startWith(this.itemsControl.value))
      .subscribe((value) => {
        if (this.onChange) this.onChange(this.items.join(','));
      });
  }

  get filteredItems() {
    return this.search$ ?? EMPTY;
  }

  writeValue(obj: any): void {
    this.value = obj;
    if (this.itemInput?.nativeElement) this.itemInput.nativeElement.value = '';
    this.itemsControl.setValue(null);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    const action = isDisabled ? 'disable' : 'enable';
    this.itemsControl[action]();
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const index = this.items.indexOf(value);

    if (value && index < 0) {
      this.items.push(value);
      this.writeValue(this.items.join(', '));
    }
    event.chipInput.clear();
    this.itemsControl.setValue(null);
  }

  remove(item: string): void {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
      this.writeValue(this.items.join(', '));
      this.announcer.announce(`Removed ${item}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = (event.option.viewValue || '').trim();
    const index = this.items.indexOf(value);

    if (value && index < 0) {
      this.items.push(value);
      this.writeValue(this.items.join(', '));
    }
    this.itemsControl.setValue(null);
  }
}
