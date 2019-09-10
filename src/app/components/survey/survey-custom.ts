import { Component, Input, OnInit } from '@angular/core';
import { Events } from '@ionic/angular';

import { TaskStatus } from '@nte/constants/task.constants';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ApiProvider } from '@nte/services/api.service';
import { SurveyProvider } from '@nte/services/survey.service';

@Component({
  selector: `survey-custom`,
  templateUrl: `survey-custom.html`
})
export class SurveyCustomComponent implements OnInit {
  @Input() public taskTracker: TaskTracker;

  public data: any;
  public disableSubmitButton: boolean = true;
  public taskStatus: TaskStatus = TaskStatus;

  constructor(private apiProvider: ApiProvider,
    private events: Events,
    private surveyProvider: SurveyProvider) { }

  ngOnInit() {
    if (this.taskTracker.status === `C`) {
      this.disableSubmitButton = true;
    }
    this.surveyProvider.getSurveyData(this.taskTracker.task.id)
      .subscribe(
        (data) => {
          this.data = data.results;
        },
        err => console.error(err)
      );
  }

  public finishSurvey() {
    return this.apiProvider.patch(
      `/survey/${this.taskTracker.task.id}`,
      {
        results: this.data,
        survey_is_complete: true
      }
    ).map(
      (response) => {
        return response.json();
      }
    ).subscribe(
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
