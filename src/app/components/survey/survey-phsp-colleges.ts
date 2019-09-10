import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { map } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { ICollegeTracker } from '@nte/models/college-tracker.interface';
import { ICollege } from '@nte/models/college.interface';
import { CollegeStatusItem, ICollegeStatusItem } from '@nte/models/status-item.interface';
import { CollegeProvider } from '@nte/services/college.service';
import { StakeholderProvider } from '@nte/services/stakeholder.service';
import { SurveyProvider } from '@nte/services/survey.service';

@Component({
  selector: `survey-phsp-colleges`,
  templateUrl: `survey-phsp-colleges.html`
})
export class SurveyPhspCollegesComponent implements OnInit, OnDestroy {
  @Input() public list: ICollegeStatusItem[];
  @Input() public startOnLastSlide: boolean;

  public collegeResults: ICollege[];

  private searchSub: Subscription;

  constructor(private collegeProvider: CollegeProvider,
    private events: Events,
    private surveyProvider: SurveyProvider,
    private stakeholderProvider: StakeholderProvider) { }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  ngOnInit() {
    this.events.subscribe(`search`, query => this.onSearch(query));
    if (!this.list) {
      this.list = this.formatColleges(this.stakeholderProvider.stakeholder.institution_trackers);
    }
    this.surveyProvider.hideButtons = true;
  }

  public formatColleges(colleges: ICollegeTracker[]) {
    return map(
      colleges,
      college => new CollegeStatusItem(college)
    );
  }

  public onSearch(query: string) {
    this.searchSub = this.collegeProvider.searchColleges(`?search=${query}`)
      .subscribe(response => this.collegeResults = response);
  }

}
