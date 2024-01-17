import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { combineLatest, startWith } from 'rxjs';

import { IN_OUT_ANIMATION } from '../../../../shared/animations/in-out-animation';
import { LIST_ANIMATION } from '../../../../shared/animations/list-animation';
import { SearchChipComponent } from '../../../../shared/components/search-chip/search-chip.component';
import { IfHasRoleDirective } from '../../../../shared/directives/if-has-role/if-has-role.directive';
import { NotificationService } from '../../../../shared/services/notification/notification.service';
import { StorageService } from '../../../../shared/services/storage/storage.service';
import { PetCardComponent } from '../../components/pet-card/pet-card.component';
import { PetFormComponent } from '../../components/pet-form/pet-form.component';
import { SearchPetFormComponent } from '../../components/search-pet-form/search-pet-form.component';
import { eStep } from '../../enum/step.enum';
import {
  Owner,
  PaginationOptions,
  PaginationResponse,
  Pet,
} from '../../interfaces/pet';
import { PetService } from '../../services/pet/pet.service';

@Component({
  selector: 'app-pet-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    SearchChipComponent,
    MatPaginatorModule,
    PetFormComponent,
    SearchPetFormComponent,
    PetCardComponent,
    MatDividerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    PetCardComponent,
    IfHasRoleDirective,
  ],
  animations: [IN_OUT_ANIMATION, LIST_ANIMATION],
  templateUrl: './pet-page.component.html',
  styleUrl: './pet-page.component.scss',
})
export class PetPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.has-search') get hasSearch() {
    return this.petService.search$$.value;
  }
  eStep = eStep;
  @ViewChild('main') main: ElementRef<HTMLElement>;
  @ViewChildren(MatExpansionPanel)
  matExpansionPanel: QueryList<MatExpansionPanel>;

  @ViewChild(PetFormComponent)
  petForm: PetFormComponent;

  @ViewChild(SearchPetFormComponent)
  searchPetForm: SearchPetFormComponent;

  step: WritableSignal<number | null> = signal(null);
  owners: WritableSignal<Owner[]> = signal([]);
  pets: WritableSignal<Pet[]> = signal([]);

  sortOptions = [
    {
      value: 'id',
      label: 'Id',
    },
    {
      value: 'name',
      label: 'Nome',
    },
    {
      value: 'birthDate',
      label: 'Data de nascimento',
    },
    {
      value: 'updatedAt',
      label: 'Data de atualização',
    },
    {
      value: 'createdAt',
      label: 'Data de criação',
    },
  ];
  sort = new FormControl('id');
  direction = new FormControl('asc');
  changeDetectorRef = inject(ChangeDetectorRef);
  response: PaginationResponse<Pet> | null;

  paginationOptions: PaginationOptions = {
    page: 0,
    size: 5,
    sort: 'id,asc',
  };

  constructor(
    readonly storageService: StorageService,
    readonly notificationService: NotificationService,
    readonly matDialog: MatDialog,
    readonly petService: PetService
  ) {}

  ngOnInit() {
    const paginationOptions = this.getPaginationOptionsInStorage();
    this.paginationOptions = {
      ...this.paginationOptions,
      ...paginationOptions,
    };
    this.paginationOptions.page = 0;
    this.sort.setValue(this.paginationOptions.sort.split(',')[0]);
    this.direction.setValue(this.paginationOptions.sort.split(',')[1]);
    this.step.set(null);
    this.searchData();
    this.closeAllPanels();
  }

  onPageChange({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }) {
    if (this.paginationOptions.size != pageSize) {
      this.main?.nativeElement?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    this.paginationOptions.page = pageIndex;
    this.paginationOptions.size = pageSize;
    this.searchData();
  }

  ngAfterViewInit(): void {
    this.petService.getOwners().subscribe((owners) => {
      this.owners.set(owners.data.items);
    });
    combineLatest([
      this.sort.valueChanges.pipe(startWith(this.sort.value)),
      this.direction.valueChanges.pipe(startWith(this.direction.value)),
    ]).subscribe(([sort, direction]) => {
      this.paginationOptions.sort = `${sort},${direction}`;
      this.searchData();
    });
    this.changeDetectorRef.detectChanges();
  }
  searchData() {
    this.petService
      .getPets(
        {
          ...this.searchPetForm?.formGroup?.value,
          owner:
            this.searchPetForm?.formGroup?.value.owner?.length > 0
              ? this.searchPetForm.formGroup.value.owner
              : null,
        },
        this.paginationOptions
      )
      .subscribe({
        next: (pets) => {
          this.closeAllPanels();
          this.response = pets.data;
          this.pets.set(pets.data.items);
          this.notificationService.showSnackBarSuccess(pets);
          this.setPaginationOptionsInStorage();
        },
      });
  }
  ngOnDestroy(): void {
    this.setPaginationOptionsInStorage();
  }

  private getPaginationOptionsInStorage() {
    return JSON.parse(this.storageService.getItem('paginationOptions') ?? '{}');
  }
  private setPaginationOptionsInStorage() {
    this.storageService.setItem(
      'paginationOptions',
      JSON.stringify(this.paginationOptions)
    );
  }

  private closeAllPanels() {
    this.matExpansionPanel?.forEach((panel) => panel.close());
  }
}
