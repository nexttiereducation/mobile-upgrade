import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: `moment`
})
export class MomentPipe implements PipeTransform {
  public transform(date: string, dateFormat: string = `MM/DD/YYYY`): any {
    const formattedDate = dayjs(date).format(dateFormat);
    return formattedDate;
  }
}
