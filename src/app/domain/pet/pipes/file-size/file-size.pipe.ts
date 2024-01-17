import { Pipe, PipeTransform } from '@angular/core';
import { BINARY_MULTIPLES } from '../../constants/binary';

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(size: number): string {
    return ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'][
      Math.floor(Math.log2(size / BINARY_MULTIPLES) / 10)
    ];
  }
}
