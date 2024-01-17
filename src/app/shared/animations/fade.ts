import { animate, style, transition, trigger } from '@angular/animations';

export const FADE_ANIMATION = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('600ms', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('600ms', style({ opacity: 0 })),
  ]),
]);
