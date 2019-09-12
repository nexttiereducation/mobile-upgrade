import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Events } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TASK_STATUSES } from '@nte/constants/task.constants';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `task-survey`,
  templateUrl: `task-survey.html`,
  styleUrls: [`task-survey.scss`]
})
export class TaskSurveyPage implements OnInit, OnDestroy {
  public taskStatus: any;
  public taskStatuses: any = TASK_STATUSES;
  public taskTracker: any;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(public events: Events,
    public router: Router,
    public taskService: TaskService,
    public surveyService: SurveyService,
    private mixpanel: MixpanelService,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    const taskTracker = params.taskTracker;
    this.setTracker(taskTracker);
  }

  ngOnInit() {
    this.getSurvey(this.taskTracker.task.id);
    this.setupChangeSub();
    this.mixpanel.event(`navigated_to-Survey`);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.events.unsubscribe(`taskChange`);
  }

  public complete() {
    this.taskService.updateTaskStatus(this.taskTracker.id, this.taskTracker.status)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          if (response && response.data) {
            this.setTracker(response.data);
          }
        }
      );
  }

  private getSurvey(taskId: number) {
    this.surveyService.getSurveyData(taskId).subscribe();
  }

  private setTracker(tracker: any) {
    this.taskTracker = tracker;
    this.taskStatus = this.taskStatuses[tracker.status];
  }

  private setupChangeSub() {
    this.events
      .subscribe(
        `taskChange`,
        (data) => {
          this.setTracker(data.taskTracker);
          this.complete();
        }
      );
  }

}
