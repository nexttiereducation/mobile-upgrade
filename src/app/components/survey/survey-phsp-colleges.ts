import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { CollegeStatusItem, ICollegeStatusItem } from '@nte/interfaces/status-item.interface';
import { CollegeService } from '@nte/services/college.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { SurveyService } from '@nte/services/survey.service';

@Component({
  selector: `survey-phsp-colleges`,
  templateUrl: `survey-phsp-colleges.html`
})
export class SurveyPhspCollegesComponent implements OnInit, OnDestroy {
  @Input() list: ICollegeStatusItem[];
  @Input() startOnLastSlide: boolean;

  public collegeResults: ICollege[];

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private collegeService: CollegeService,
    private events: Events,
    private surveyService: SurveyService,
    private stakeholderService: StakeholderService) { }

  ngOnInit() {
    this.events.subscribe(`search`, query => this.onSearch(query));
    if (!this.list) {
      this.list = this.formatColleges(this.stakeholderService.stakeholder.institution_trackers);
    }
    this.surveyService.hideButtons = true;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public formatColleges(colleges: ICollegeTracker[]) {
    return colleges.map(c => new CollegeStatusItem(c));
  }

  public onSearch(query: string) {
    this.collegeService.search(`?search=${query}`)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: ICollege[]) => this.collegeResults = response);
  }

}
