import { Component, OnDestroy, OnInit } from '@angular/core';
import { Events, ModalController, NavParams, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskStatus } from '@nte/constants/task.constants';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { Prompt } from '@nte/models/prompt.model';
import { Stakeholder } from '@nte/models/stakeholder.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `prompt`,
  templateUrl: `prompt.html`,
  styleUrls: [`prompt.scss`]
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

  private ngUnsubscribe: Subject<any> = new Subject();
  private today: string;

  constructor(params: NavParams,
    private events: Events,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private stakeholderService: StakeholderService,
    private taskService: TaskService,
    private toastCtrl: ToastController) {
    this.prompt = params.get(`prompt`);
    this.taskTracker = params.get(`taskTracker`);
    const todaysDate = new Date();
    this.today = todaysDate.toISOString().substring(0, 10);
  }

  ngOnInit() {
    this.setupEventSubs();
    this.stakeholder = this.stakeholderService.stakeholder;
    this.newPrompt = new Prompt<string[]>([], this.prompt.task);
    if (this.taskTracker.status === `ST`) {
      this.mixpanel.event(`task_started`, {
        'task title': this.taskTracker.task.name,
        'task type': this.taskTracker.task.task_type
      });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.events.unsubscribe(`promptSubmitted`);
  }

  public completeTask() {
    this.taskService.updateTaskStatus(this.taskTracker.id, TaskStatus.COMPLETED)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((tracker: any) => {
        if (tracker.data instanceof TaskTracker) {
          this.events.publish(
            `taskChange`,
            { taskTracker: tracker.data }
          );
          this.modalCtrl.dismiss();
        }
      });
  }

  public dismiss() {
    this.modalCtrl.dismiss();
  }


  private setupEventSubs() {
    this.events.subscribe(
      `promptSubmitted`,
      async (data: any) => {
        this.taskTracker.completed_on = this.today;
        const toast = await this.toastCtrl.create({
          duration: 5000,
          message: data.successMessage
        });
        toast.present()
          .then(() => this.completeTask())
          .catch(err => console.error(err));
      }
    );
  }

}
