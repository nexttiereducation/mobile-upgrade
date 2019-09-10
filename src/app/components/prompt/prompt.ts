import { Component, OnDestroy, OnInit } from '@angular/core';
import { Events, NavParams, ToastController, ViewController } from '@ionic/angular';

import { TaskStatus } from '@nte/constants/task.constants';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { Prompt } from '@nte/models/prompt.model';
import { Stakeholder } from '@nte/models/stakeholder.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { MixpanelProvider } from '@nte/services/mixpanel.service';
import { StakeholderProvider } from '@nte/services/stakeholder.service';
import { TaskProvider } from '@nte/services/task.service';

@Component({
  selector: `prompt`,
  templateUrl: `prompt.html`
})
export class PromptComponent implements OnInit, OnDestroy {
  // @Output() promptCompleted = new EventEmitter<null>();

  public chosenOption = null;
  public chosenOptions = [];
  public inProgress: boolean = true;
  public newPrompt: Prompt<any>;
  public prompt: BackEndPrompt<any>;
  public stakeholder: Stakeholder;
  public taskTracker: TaskTracker;
  private today: string;

  constructor(params: NavParams,
    public viewCtrl: ViewController,
    private events: Events,
    private mixpanel: MixpanelProvider,
    private stakeholderProvider: StakeholderProvider,
    private taskProvider: TaskProvider,
    private toastCtrl: ToastController) {
    this.prompt = params.get(`prompt`);
    this.taskTracker = params.get(`taskTracker`);
    const todaysDate = new Date();
    this.today = todaysDate.toISOString().substring(0, 10);
  }

  public completeTask() {
    const updateSub = this.taskProvider.updateTaskStatus(this.taskTracker.id, TaskStatus.COMPLETED)
      .subscribe((tracker) => {
        if (tracker.data instanceof TaskTracker) {
          this.events.publish(`taskChange`, { taskTracker: tracker.data });
          this.viewCtrl.dismiss();
        }
        updateSub.unsubscribe();
      });
  }

  ngOnDestroy() {
    this.events.unsubscribe(`promptSubmitted`);
  }

  ngOnInit() {
    this.setupEventSubs();
    this.stakeholder = this.stakeholderProvider.stakeholder;
    this.newPrompt = new Prompt<string[]>([], this.prompt.task);
    if (this.taskTracker.status === `ST`) {
      this.mixpanel.event(`task_started`, {
        'task title': this.taskTracker.task.name,
        'task type': this.taskTracker.task.task_type
      });
    }
  }

  private setupEventSubs() {
    this.events.subscribe(
      `promptSubmitted`,
      (data: any) => {
        this.taskTracker.completed_on = this.today;
        this.toastCtrl.create({
          duration: 5000,
          message: data.successMessage
        }).present()
          .then(() => {
            this.completeTask();
          })
          .catch(
            (err) => console.error(err)
          );
      }
    );
  }

}
