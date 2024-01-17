import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EnvironmentInjector,
  Signal,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EMPTY, Subject, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
import {
  ApiResponse,
  PaginationResponse,
  Role,
} from '../../../pet/interfaces/pet';
import { RolesService } from '../../services/roles.service';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatSortModule,
  ],
  templateUrl: './roles-page.component.html',
  styleUrl: './roles-page.component.scss',
})
export class RolesPageComponent implements AfterViewInit {
  displayedColumns: (keyof Role | 'actions')[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<Role>([]);
  injector = inject(EnvironmentInjector);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('roleTemplateForm') roleTemplateForm: TemplateRef<unknown>;
  formGroup = new FormGroup({
    id: new FormControl(),
    name: new FormControl<string | null>(null, [Validators.required]),
  });
  rolesService = inject(RolesService);
  matDialog = inject(MatDialog);
  sortDirection: string = 'id,asc';
  pageIndex: number = 0;
  pageSize: number = 5;
  data$$ = new Subject<ApiResponse<PaginationResponse<Role>> | undefined>();
  response: Signal<ApiResponse<PaginationResponse<Role>> | undefined> =
    this.getResponse();

  getResponse() {
    return toSignal(this.data$$.asObservable());
  }

  openDialog(element?: Role) {
    if (element) this.formGroup.patchValue(element);
    this.matDialog
      .open(this.roleTemplateForm, {
        width: '500px',
        panelClass: 'role-dialog-container',
      })
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (!result) return EMPTY;
          const method = element ? 'updateRole' : 'createRole';
          return this.rolesService[method]({
            ...this.formGroup.value,
          } as Role);
        })
      )
      .subscribe((result) => {
        this.getData();
        this.formGroup.reset();
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getData();
  }
  sortChange(event: Sort) {
    this.sortDirection =
      event.active && event.direction
        ? `${event.active},${event.direction}`
        : 'id,asc';
    this.getData();
  }
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getData();
  }

  getData() {
    this.rolesService
      .getRoles({
        page: this.pageIndex,
        size: this.pageSize,
        sort: this.sortDirection,
      })
      .subscribe((result) => {
        this.data$$.next(result);
      });
  }

  removeRole(id: number) {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não será capaz de recuperar este animal de estimação!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, exclua-o!',
      customClass: {
        confirmButton:
          'mdc-button mdc-button--raised mat-mdc-raised-button mat-primary mat-mdc-button-base',
        cancelButton:
          'mdc-button mdc-button--outlined mat-mdc-outlined-button mat-warn mat-mdc-button-base',
      },
      cancelButtonText: 'Não, mantenha-o',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rolesService.removeRole(id).subscribe((result) => {
          this.getData();
        });
      }
    });
  }
}
