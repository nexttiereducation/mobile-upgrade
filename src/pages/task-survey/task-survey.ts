import { Component } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from '@ionic/angular';

import { TASK_STATUSES } from '@nte/constants/task.constants';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';

@IonicPage({
  name: `task-survey-page`,
  priority: `off`
})
@Component({
  selector: `task-survey`,
  templateUrl: `task-survey.html`
})
export class TaskSurveyPage {
  public taskChangeSub: any;
  public taskStatus: any;
  public taskStatuses: any = TASK_STATUSES;
  public taskTracker: any;

  constructor(params: NavParams,
    public events: Events,
    public navCtrl: NavController,
    public taskService: TaskService,
    public surveyService: SurveyService,
    private mixpanel: MixpanelService) {
    const taskTracker = params.get(`taskTracker`);
    this.setTracker(taskTracker);
  }

  public complete() {
    this.taskService.updateTaskStatus(this.taskTracker.id, this.taskTracker.status)
      .subscribe(
        (response) => {
          if (response && response.data) {
            this.setTracker(response.data);
          }
        }
      );
  }

  public ionViewDidLoad() {
    this.getSurvey(this.taskTracker.task.id);
    this.setupChangeSub();
    this.mixpanel.event(`navigated_to-Survey`);
  }

  public ionViewWillUnload() {
    if (this.taskChangeSub) { this.taskChangeSub.unsubscribe(); }
  }

  private getSurvey(taskId: number) {
    this.surveyService.getSurveyData(taskId).subscribe();
  }

  private setTracker(tracker: any) {
    this.taskTracker = tracker;
    this.taskStatus = this.taskStatuses[tracker.status];
  }

  private setupChangeSub() {
    this.taskChangeSub = this.events.subscribe(`taskChange`, (data) => {
      this.setTracker(data.taskTracker);
      this.complete();
    });
  }

}
