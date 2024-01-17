import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoaderService } from '../../../shared/services/loader/loader.service';
import { NotificationService } from '../../../shared/services/notification/notification.service';
import { StorageService } from '../../../shared/services/storage/storage.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const user = JSON.parse(inject(StorageService).getItem('user') ?? '{}');
  const notificationService = inject(NotificationService);
  const loader = inject(LoaderService);

  if (user?.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }
  loader.showLoader();
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        notificationService.showError('Unauthorized');
      }
      notificationService.showError(err);

      return throwError(() => err);
    }),
    finalize(() => loader.hideLoader())
  );
};
