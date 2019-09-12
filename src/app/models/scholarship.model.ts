import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { upperFirst } from 'lodash';

import { ENROLLMENT_LEVEL_ORDER } from '@nte/constants/scholarship.constants';
import { IIdentifiable } from '@nte/interfaces/global.interface';
import { IAwardStat, IContact, ICriteria, ISponsor } from '@nte/interfaces/scholarship.interface';

dayjs.extend(relativeTime);

const pseudoBooleans = new Set(
  [
    `awarded_annually`,
    `renewable`,
    `repay_required`,
    `school_specific`,
    `separate_app_required`,
    `unlimited_awards`
  ]
);

export class Scholarship {
  /* AWARD # COUNT */
  public application_url: string = null;
  public applying: boolean = null;
  public art: any[] = null;
  public associated_college: string = null;
  public associated_highschool: string = null;
  public avail_to_detail: string = null;
  public avail_to_details: string = null;
  public avg_awards?: any = null;
  public award_amount?: any = null;
  public award_amount_avg?: any = null;
  public award_amount_max: number = null;
  public award_amount_min: number = null;
  public award_count?: any = null;
  public award_coverage?: any = null;
  public award_coverage_details: string = null;
  public award_coverage_id?: any = null;
  public award_schedule: string = null;
  public award_type: string = null;
  public award_type_detail: string = null;
  public award_type_details: string = null;
  public award_type_id: number = null;
  public awardAvg?: IAwardStat = {
    amount: null,
    count: null
  };
  public awarded_annually: string = null;
  public awardMax?: IAwardStat = {
    amount: null,
    count: null
  };
  public awardMin?: IAwardStat = {
    amount: null,
    count: null
  };
  public citizenship: any[] = null;
  public city: any[] = null;
  public club: string[] = null;
  public contact: IContact = null;
  public contact_id: number = null;
  public corp_aff: any[] = null;
  public country: any[] = null;
  public county: any[] = null;
  public criteria: ICriteria = null;
  public criteria_details: string = null;
  public deadline_details: string = null;
  public deadlines?: any[] = null;
  public deadlines_formatted?: any[] = null;
  public disability: any[] = null;
  public district?: any = null;
  public enrollment_level: string[] = null;
  public ethnicity: any[] = null;
  public gender: string = null;
  public grade: string = null;
  public grant_pct?: any = null;
  public greek_org: any[] = null;
  public high_school: any[] = null;
  public id: number = null;
  public interest: any[] = null;
  public isExpanded: boolean = null;
  public major: any[] = null;
  public marital_status: any[] = null;
  public max_age: string = null;
  public max_awards?: any = null;
  public military_aff: any[] = null;
  public min_age: string = null;
  public min_awards?: any = null;
  public name: string = null;
  public national_merit: any[] = null;
  public num_apps: number = null;
  public prof_circum: any[] = null;
  public prof_org: any[] = null;
  public profession: any[] = null;
  public race: any[] = null;
  public recommendation_count: number = null;
  public religion: string[] = null;
  public renew_details: string = null;
  public renewable: string = null;
  public repay_detail: string = null;
  public repay_details: string = null;
  public repay_required: string = null;
  public saved: boolean = null;
  public scholarship_cats: string = null;
  public scholarship_id: number = null;
  public school: any[] = null;
  public school_details: string = null;
  public school_restricted: string = null;
  public school_specific: string = null;
  public school_state: any[] = null;
  public selected: IIdentifiable[] = null;
  public separate_app_required: string = null;
  public sponsor: ISponsor = null;
  public sponsor_id: number = null;
  public sport: any[] = null;
  public state: any[] = null;
  public status: string = null;
  public study_areas: string = null;
  public type: string = null;
  public union: any[] = null;
  public unlimited_awards: string = null;

  /* AWARD $ AMOUNT */

  get hasAwardAmtAvg() {
    return this.awardAvg.amount && this.awardAvg.amount > 0;
  }

  get hasAwardAmtMax() {
    return this.awardMax.amount && this.awardMax.amount > 0;
  }

  get hasAwardAmtMin() {
    return this.awardMin.amount && this.awardMin.amount > 0;
  }

  get hasAwardAmtRange() {
    return this.hasAwardAmtMax && this.hasAwardAmtMin && (this.awardMax.amount !== this.awardMin.amount);
  }

  get hasAwardCountAvg() {
    return this.awardAvg.count && this.awardAvg.count > 0;
  }

  get hasAwardCountMax() {
    return this.awardMax.count && this.awardMax.count > 0;
  }

  get hasAwardCountMin() {
    return this.awardMin.count && this.awardMin.count > 0;
  }

  get hasAwardCountRange() {
    return this.hasAwardCountMax && this.hasAwardCountMin && (this.awardMax.count !== this.awardMin.count);
  }

  constructor(obj: any) {
    for (const prop in obj) {
      if (this.hasOwnProperty(prop)) {
        const objPropValue = obj[prop];
        if (objPropValue && pseudoBooleans.has(prop)) {
          this[prop] = this.getBooleanFromString(objPropValue);
        } else {
          this[prop] = objPropValue;
        }
      }
    }
    this.formatDeadlines();
    this.sortEnrollmentLevels();
    this.setAwardStats();
  }

  public getBooleanFromString(str: string) {
    switch (str) {
      case `Y`:
        return true;
      case `N`:
        return false;
      default:
        return null;
    }
  }

  private formatDeadlines() {
    if (this.deadlines && this.deadlines.length) {
      this.deadlines_formatted = [];
      this.deadlines.forEach(deadline => {
        const deadlineDateObj = dayjs(deadline).format(`MM/DD/YY`);
        const deadlineDate = dayjs(deadlineDateObj).endOf(`day`);
        const deadlineObj = {
          date: dayjs(deadlineDate).format(`MM/DD/YY`),
          distance: dayjs(deadlineDate).fromNow()
        };
        this.deadlines_formatted.push(deadlineObj);
      });
    }
  }

  private getCurrency(amount: number) {
    return amount.toLocaleString(`en-US`, {
      currency: `USD`,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: `currency`
    });
  }

  private getSortedEnrollment(item1: string, item2: string) {
    return ENROLLMENT_LEVEL_ORDER[item1] - ENROLLMENT_LEVEL_ORDER[item2];
  }

  private setAwardAmount() {
    if (this.hasAwardAmtAvg) {
      this.award_amount = this.getCurrency(this.awardAvg.amount);
    } else {
      if (this.hasAwardAmtRange) {
        this.award_amount = this.getCurrency(this.awardMin.amount) + ` - ` + this.getCurrency(this.awardMax.amount);
      } else if (this.hasAwardAmtMin) {
        this.award_amount = this.getCurrency(this.awardMin.amount) + `+`;
      } else if (this.hasAwardAmtMax) {
        this.award_amount = `up to ` + this.getCurrency(this.awardMax.amount);
      } else if (this.award_coverage) {
        this.award_amount = this.award_coverage;
      }
    }
  }

  private setAwardCount() {
    if (this.hasAwardCountAvg) {
      this.award_count = `~${this.awardAvg.count}`;
      this.setAwardCountFrequency();
    } else {
      if (this.hasAwardCountRange) {
        this.award_count = `${this.awardMin.count} ` + decodeURI(`%E2%80%93`) + ` ${this.awardMax.count}`;
      } else if (this.hasAwardCountMin) {
        this.award_count = `${this.awardMin.count}+`;
      } else if (this.hasAwardCountMax) {
        this.award_count = `up to ${this.awardMax.count}`;
      }
      this.setAwardCountFrequency();
    }
  }

  private setAwardCountFrequency() {
    if (this.award_count && this.award_count.length) {
      this.award_count += ` awarded`;
      if (this.awarded_annually === `Y`) {
        this.award_count += ` per year`;
      }
    } else {
      if (this.awarded_annually === `Y`) {
        this.award_count = `awarded annually`;
      }
    }
  }

  private setAwardStats() {
    const types = [`avg`, `max`, `min`];
    types.forEach(type => {
      const statName = `award${upperFirst(type)}`;
      const statAmtName = `award_amount_${type}`;
      const statCountName = `${type}_awards`;
      this[statName] = {
        amount: this[statAmtName],
        count: this[statCountName]
      };
    });
    this.setAwardAmount();
    this.setAwardCount();
  }

  private sortEnrollmentLevels() {
    if (this.enrollment_level && this.enrollment_level.length) {
      const enrollment_level = this.enrollment_level.sort(this.getSortedEnrollment);
      this.enrollment_level = enrollment_level;
    }
  }
}
