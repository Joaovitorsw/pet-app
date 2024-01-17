import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideAnimations } from '@angular/platform-browser/animations';
import { withViewTransitions } from '@angular/router';
import {
  FileInputConfig,
  NGX_MAT_FILE_INPUT_CONFIG,
} from 'ngx-custom-material-file-input';
import { routes } from './app.routes';
import { jwtInterceptor } from './domain/auth/interceptors/jwt.interceptor';
import { getPtBRPaginatorIntl } from './shared/helpers/ptbr-paginator-intl';

export const config: FileInputConfig = {
  sizeUnit: 'Octet',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([...routes], withViewTransitions()),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: NGX_MAT_FILE_INPUT_CONFIG, useValue: config },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR',
    },
    { provide: MatPaginatorIntl, useValue: getPtBRPaginatorIntl() },
  ],
};
