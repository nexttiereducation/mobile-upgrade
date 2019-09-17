import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mean } from 'lodash';

import { ICollegeDetails } from '@nte/interfaces/college-details.interface';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-academic`,
  templateUrl: `college-academic.html`,
  styleUrls: [`college-academic.scss`],
  encapsulation: ViewEncapsulation.None
})
export class CollegeAcademicPage {
  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
  }

  get details(): ICollegeDetails {
    return this.college ? this.college.details : null;
  }

  get averageAct() {
    if (this.details) {
      return this.getRoundedMean(this.details.act_25, this.details.act_75);
    }
  }
  get averageSatMath() {
    if (this.details) {
      return this.getRoundedMean(this.details.sat_math_25, this.details.sat_math_75);
    }
  }
  get averageSatReading() {
    if (this.details) {
      return this.getRoundedMean(this.details.sat_reading_25, this.details.sat_reading_75);
    }
  }
  get averageSatWriting() {
    if (this.details) {
      return this.getRoundedMean(this.details.sat_writing_25, this.details.sat_writing_75);
    }
  }

  get admissionChart() {
    if (this.details && +this.details.admission_rate) {
      return {
        label: `Admission Rate`,
        value: +this.details.admission_rate
      };
    }
  }

  get retentionChart() {
    if (this.details && this.details.retention_pcf) {
      return {
        label: `Retention Rate`,
        value: this.details.retention_pcf
      };
    }
  }

  get graduationChart() {
    if (this.details && this.college.six_year_grad_pcf) {
      return {
        label: `Graduation Rate`,
        value: this.college.six_year_grad_pcf
      };
    }
  }

  get furtherStudyChart() {
    if (this.details && this.details.percentage_further_education_immediate) {
      return {
        label: `Immediately seek further education`,
        value: this.details.percentage_further_education_immediate
      };
    }
  }

  get jobMarketChart() {
    if (this.details && this.details.percentage_enter_work_one_year) {
      return {
        label: `Enter the workforce within 1 year`,
        value: this.details.percentage_enter_work_one_year
      };
    }
  }

  constructor(
    public collegeService: CollegeService,
    public route: ActivatedRoute,
    public router: Router) { }

  private getRoundedMean(firstValue: number, secondValue: number) {
    return Math.round(mean([firstValue, secondValue]));
  }

}
