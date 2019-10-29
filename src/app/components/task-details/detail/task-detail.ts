import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Events, ToastController } from '@ionic/angular';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TASK_STATUSES, TaskStatus } from '@nte/constants/task.constants';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { TaskService } from '@nte/services/task.service';

dayjs.extend(relativeTime);

@Component({
  selector: `task-detail`,
  templateUrl: `task-detail.html`,
  styleUrls: [`task-detail.scss`]
})
export class TaskDetailPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  @Input() id: number;
  @Input() isParent: boolean;
  @Input() isUpdating: boolean;
  @Input() prompt: BackEndPrompt<any>;
  @Input() taskTracker: TaskTracker;
  @Input() typeImage: string;

  private ngUnsubscribe: Subject<any> = new Subject();

  get date1() {
    const date = this.taskTracker.started_on || this.taskTracker.start_date;
    return {
      color: 'secondary',
      date,
      label: `Start${this.taskTracker.started_on ? 'ed' : ''}`,
      relative: dayjs(date).fromNow()
    };
  }

  get date2() {
    const date = this.taskTracker.due_date || this.taskTracker.task.get_deadline.toString();
    return {
      color: 'tertiary',
      date,
      label: `Due`,
      relative: dayjs(date).fromNow()
    };
  }

  get description() {
    return this.taskTracker.task.description.replace(`�`, `'`);
  }

  get status() {
    if (this.taskTracker && typeof this.taskTracker.status === `string`) {
      return TASK_STATUSES[this.taskTracker.status];
    }
  }

  get task() {
    return this.taskTracker ? this.taskTracker.task : null;
  }

  constructor(public events: Events,
    public linkService: LinkService,
    public sanitizer: DomSanitizer,
    private mixpanel: MixpanelService,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    if (this.taskTracker) {
      this.init();
    } else {
      this.taskService.getTaskTrackerById(this.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (tracker: TaskTracker) => {
            this.taskTracker = tracker;
            this.init();
          }
        );
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.events.unsubscribe(`taskChange`);
    this.events.unsubscribe(`fakeTaskStatusChange`);
  }

  public getTrustedUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public goToSurvey() {
    this.router.navigate(
      [`survey`],
      {
        relativeTo: this.route,
        state: {
          taskTracker: this.taskTracker
        }
      }
    );
  }

  public updateStatus() {
    if (this.isUpdating) { return; }
    this.isUpdating = true;
    if (this.taskTracker.isStarted && this.taskTracker.prompt) {
      this.prompt = this.taskTracker.prompt;
      this.content.resize();
    }
    const completeTask = !(this.taskTracker.isSurveyTask || this.taskTracker.prompt);
    if (completeTask) {
      this.taskTracker.updatedStatus(TaskStatus.COMPLETED);
    } else {
      this.taskTracker.updatedStatus();
    }
    this.taskService.updateTaskStatus(this.taskTracker.id, this.taskTracker.status)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (change) => {
          this.isUpdating = false;
          if (change && (change.data instanceof TaskTracker)) {
            this.taskTracker = change.data;
            this.events.publish(`taskChange`, {
              taskTracker: this.taskTracker
            });
            if (this.taskTracker.isSurveyTask) {
              this.goToSurvey();
            } else {
              this.openTaskCompleteToast();
              // this.router.pop();
              // TODO: Implement logic to go back to task list
            }
          } else if (change) {
            // This is the case where there is a prompt
            this.prompt = this.taskTracker.prompt;
            this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
            this.content.resize();
          }
        },
        (err) => console.error(err)
      );
  }

  /* PRIVATE METHODS */

  private init() {
    this.setupEventSubs();
    this.mixpanel.event(`task_details_viewed`, {
      'task title': this.taskTracker.task.name,
      'task type': this.taskTracker.task.task_type
    });
  }

  private async openTaskCompleteToast() {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => {
          this.taskService.resetTask(this.taskTracker);
        },
        text: `Undo`
      }],
      duration: 5000,
      message: `Task completed.`
    });
    toast.present();
  }

  private setupEventSubs() {
    this.events.subscribe(
      `taskChange`,
      (data: any) => {
        this.taskTracker = data.taskTracker;
      }
    );
    // this.events.subscribe(
    //   `fakeTaskStatusChange`,
    //   (fakeStatus: string) => this.status = TASK_STATUSES[fakeStatus]
    // );
  }
}
