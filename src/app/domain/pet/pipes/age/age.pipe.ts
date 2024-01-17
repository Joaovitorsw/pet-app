import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration, intervalToDuration } from 'date-fns';

@Pipe({
  name: 'age',
  standalone: true,
})
export class AgePipe implements PipeTransform {
  transform(birthday: string): string {
    const startDate = Date.parse(birthday);
    const endDate = new Date().getTime();

    const duration = intervalToDuration({ start: startDate, end: endDate });

    const durationInWords = formatDuration(duration, {
      format: ['years', 'months', 'days'],
    });
    return durationInWords || '0';
  }
}
