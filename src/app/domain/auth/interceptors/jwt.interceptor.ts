import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification/notification.service';
import { StorageService } from '../../../shared/services/storage/storage.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const user = JSON.parse(inject(StorageService).getItem('user') ?? '{}');
  const notificationService = inject(NotificationService);

  if (user?.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  }
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        notificationService.showError('Unauthorized');
      }
      notificationService.showError(err);

      return throwError(() => err);
    })
  );
};
