import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { TaskStatus } from '@nte/constants/task.constants';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ApiService } from '@nte/services/api.service';
import { SurveyService } from '@nte/services/survey.service';

@Component({
  selector: `survey-custom`,
  templateUrl: `survey-custom.html`
})
export class SurveyCustomComponent implements OnInit, OnDestroy {
  @Input() taskTracker: TaskTracker;

  public data: any;
  public disableSubmitButton: boolean = true;
  public taskStatus: TaskStatus = TaskStatus;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private api: ApiService,
    private events: Events,
    private surveyService: SurveyService) { }

  ngOnInit() {
    if (this.taskTracker.status === `C`) {
      this.disableSubmitButton = true;
    }
    this.surveyService.getSurveyData(this.taskTracker.task.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        data => this.data = data.results,
        err => console.error(err)
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public finishSurvey() {
    return this.api
      .patch(
        `/survey/${this.taskTracker.task.id}`,
        {
          results: this.data,
          survey_is_complete: true
        }
      )
      .pipe(
        map(response => response),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => {
          if (this.taskTracker.isStarted) {
            this.taskTracker.updatedStatus();
          }
          this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
          this.disableSubmitButton = true;
        },
        err => console.error(err)
      );
  }

}
