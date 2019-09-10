import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({ providedIn: 'root' })
export class DatetimeService {
  get currentDay() {
    return dayjs().date(); // D (1, 2,.. 31)
  }

  get currentMonth() {
    return dayjs().month() + 1; // M (0, 1, 2,.. 12)
  }

  get currentYear() {
    return dayjs().year(); // YYYY (2017, etc)
  }

  get pickerOptions() {
    return {
      androidTheme: 1,
      date: this.today,
      mode: `date`
    };
  }

  get today() {
    return dayjs().format(`MM/DD/YYYY`); // M/D/YYYY
  }

  public maxYear(offset: number = 2) {
    return this.currentYear + offset;
  }

  public minYear(offset: number = 1) {
    return this.currentYear - offset;
  }

}
