import { Component, Input, ViewEncapsulation } from '@angular/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Component({
  selector: 'date',
  templateUrl: 'date.html',
  styleUrls: [`date.scss`],
  encapsulation: ViewEncapsulation.None
})
export class DateComponent {
  @Input() color: string = `danger`;
  @Input() date: any;

  get colorVar() {
    return `var(--ion-color-${this.color})`;
  }

  get dateObj() {
    return dayjs(this.date);
  }

  get dayOfMonth() {
    return this.dateObj.date();
  }

  get dayOfWeek() {
    return this.dateObj.format('dddd');
  }

  get month() {
    return this.dateObj.format('MMM');
  }

  get year() {
    return this.dateObj.year();
  }

  constructor() { }
}
