import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { mean } from 'lodash';

import { COLLEGE_PRE_PROFESSIONAL_PROGRAMS, COLLEGE_ROTC_BRANCHES } from '@nte/constants/college.constants';
import { ICollegeDetails } from '@nte/interfaces/college-details.interface';
import { CollegeService } from '@nte/services/college.service';

@Component({
  selector: `college-academic`,
  templateUrl: `college-academic.html`,
  styleUrls: [
    `./../college-details.scss`,
    `college-academic.scss`
  ],
  encapsulation: ViewEncapsulation.None
})
export class CollegeAcademicComponent {
  public charts: any[];
  public rotcBranches: any[] = COLLEGE_ROTC_BRANCHES;
  public preProPrograms: any[] = COLLEGE_PRE_PROFESSIONAL_PROGRAMS;

  get college() {
    return this.collegeService.active;
  }
  get college$() {
    return this.collegeService.active$;
  }

  get details(): ICollegeDetails {
    return this.college ? this.college.details : null;
  }

  get scoreCharts() {
    if (this.details) {
      const avgs: any = [];
      if (this.details.avg_gpa) {
        avgs.push({
          name: `GPA`,
          range: this.range.gpa,
          value: this.details.avg_gpa
        });
      }
      if (this.details.act_25 && this.details.act_75) {
        avgs.push({
          name: `ACT`,
          range: this.range.act,
          value: this.getRoundedMean(this.details.act_25, this.details.act_75)
        });
      }
      if (this.details.sat_math_25 && this.details.sat_math_75) {
        avgs.push({
          name: `SAT Math`,
          range: this.range.sat,
          value: this.getRoundedMean(this.details.sat_math_25, this.details.sat_math_75)
        });
      }
      if (this.details.sat_reading_25 && this.details.sat_reading_75) {
        avgs.push({
          name: `SAT Reading`,
          range: this.range.sat,
          value: this.getRoundedMean(this.details.sat_reading_25, this.details.sat_reading_75)
        });
      }
      if (this.details.sat_writing_25 && this.details.sat_writing_75) {
        avgs.push({
          name: `SAT Writing`,
          range: this.range.sat,
          value: this.getRoundedMean(this.details.sat_writing_25, this.details.sat_writing_75)
        });
      }
      return avgs;
    }
  }

  get range() {
    return {
      act: [0, 36],
      gpa: [0, 5],
      sat: [200, 800]
    };
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
        label: `Enter the workforce w/in 1 year`,
        value: this.details.percentage_enter_work_one_year
      };
    }
  }

  constructor(
    public collegeService: CollegeService,
    public route: ActivatedRoute,
    public router: Router) { }

  private getRoundedMean(firstValue: number, secondValue: number) {
    if (firstValue && secondValue) {
      return Math.round(mean([firstValue, secondValue]));
    } else {
      return null;
    }
  }

}
