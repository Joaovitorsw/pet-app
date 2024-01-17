import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const LIST_ANIMATION = trigger('listAnimation', [
  transition('* <=> *', [
    query(':leave', animate('50ms', style({ opacity: 0 })), {
      optional: true,
    }),
    query(
      ':enter',
      [
        style({ opacity: 0 }),
        stagger('50ms', animate('50ms ease-out', style({ opacity: 1 }))),
      ],
      { optional: true }
    ),
  ]),
]);
