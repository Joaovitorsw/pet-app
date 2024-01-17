import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { SnackbarComponent } from '../../components/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private _snackBar: MatSnackBar) {}
  duration = 2000;
  showSnackBarSuccess<T>(data: T) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: data,
      panelClass: 'snackbar-success',
      duration: this.duration,
    });
  }
  showSnackBarError<T>(data: T) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: data,
      panelClass: 'snackbar-error',
      duration: this.duration,
    });
  }
  showError(error: any) {
    const message =
      error.error.message instanceof Array
        ? error.error.message
            .map((m: { message: string }) => `<p>${m.message}</p>`)
            .join('\r\n')
        : `<p>${error.error.message || error.message}</p>`;
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      customClass: {
        confirmButton:
          'mdc-button mdc-button--raised mat-mdc-raised-button mat-primary mat-mdc-button-base',
      },
      html: message,
    });
  }
}
