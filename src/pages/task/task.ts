import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Events, ModalController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PromptComponent } from '@nte/components/prompt/prompt';
import { TASK_NOTES_EMPTY_STATE, TASK_STATUSES, TaskStatus } from '@nte/constants/task.constants';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `task`,
  templateUrl: `task.html`,
  styleUrls: [`task.scss`]
})
export class TaskPage implements OnInit, OnDestroy {
  @ViewChild(`Content`, { static: false }) public content;

  public addingNote: boolean;
  public id: number;
  public isParent: boolean;
  public isUpdating: boolean;
  public notes: any[];
  public notesCount: number;
  public prompt: BackEndPrompt<any>;
  public task: any;
  public taskStatus: any;
  public taskTracker: any;
  public typeImage: string;

  private ngUnsubscribe: Subject<any> = new Subject();
  private page: string;
  private taskNotesEmptyState: IEmptyState;

  constructor(public events: Events,
    public linkService: LinkService,
    public sanitizer: DomSanitizer,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    private taskService: TaskService,
    private toastCtrl: ToastController,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.id = params.id;
    this.isParent = params.isParent;
    this.page = params.page;
    this.prompt = params.prompt;
    this.taskTracker = params.task;
    this.typeImage = params.taskTypeImg;
    this.taskNotesEmptyState = TASK_NOTES_EMPTY_STATE;
  }

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
    this.events.unsubscribe(`loadMore`);
    this.events.unsubscribe(`sendMessage`);
    this.events.unsubscribe(`taskChange`);
    this.events.unsubscribe(`fakeTaskStatusChange`);
    this.surveyService.currentSurvey = null;
    this.notes = null;
    this.taskService.activeTaskId = null;
  }

  public addNote(note: string) {
    if (this.addingNote) { return; }
    this.addingNote = true;
    this.taskService.createNote(this.taskTracker.id, note)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.getNotes();
          this.addingNote = false;
          this.mixpanel.event(`task_note_added`, {
            'task title': this.taskTracker.task.name
          });
        },
        (error) => {
          console.error(error);
          this.addingNote = false;
        }
      );
  }

  public deleteNote(noteId: number, index) {
    this.taskService.deleteNote(this.taskTracker.id, noteId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.notes.splice(index, 1);
          this.events.publish(`noteChange`, { notes: this.notes });
        },
        (err) => console.error(err)
      );
  }

  public getTrustedUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public goToAttachments() {
    this.router.navigate(
      [
        `app`,
        `tasks`,
        this.taskTracker.id,
        `attachments`
      ],
      {
        state: {
          taskTracker: this.taskTracker
        }
      }
    );
  }

  public goToNotes() {
    this.router.navigate(
      [
        `app`,
        `tasks`,
        this.taskTracker.id,
        `notes`
      ],
      {
        state: {
          emptyState: this.taskNotesEmptyState,
          messages: this.notes,
          messageType: `note`,
          subtitle: this.taskTracker.task.name
        }
      }
    );
  }

  public goToSurvey() {
    this.router.navigate(
      [
        `app`,
        `tasks`,
        this.taskTracker.id,
        `survey`
      ],
      {
        state: {
          taskTracker: this.taskTracker
        }
      }
    );
  }

  public async openPromptModal() {
    const modal = await this.modalCtrl.create({
      backdropDismiss: true,
      component: PromptComponent,
      componentProps: {
        prompt: this.prompt,
        taskTracker: this.taskTracker
      },
      showBackdrop: false
    });
    return await modal.present();
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
            this.taskStatus = TASK_STATUSES[this.taskTracker.status];
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

  private getNotes(loadingMore?: boolean) {
    this.taskService.getNotes(this.taskTracker.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (response) => {
          this.notes = response.notes;
          this.notesCount = response.count;
        },
        (err) => console.error(err),
        () => {
          const eventName = loadingMore ? `moreNotes` : `noteChange`;
          this.events.publish(eventName, { notes: this.notes });
        }
      );
  }

  private init() {
    this.taskStatus = TASK_STATUSES[this.taskTracker.status];
    this.taskService.activeTaskId = this.taskTracker.id;
    this.taskTracker.task.description = this.taskTracker.task.description.replace(`�`, `'`);
    if (this.prompt) {
      this.openPromptModal();
    }
    if (this.page) {
      if (this.page === `attach`) {
        this.goToAttachments();
      }
      if (this.page === `notes`) {
        this.goToNotes();
      }
    }
    this.setupEventSubs();
    this.getNotes();
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
          this.taskStatus = TASK_STATUSES[TaskStatus.NOT_STARTED];
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
      `loadMore`,
      () => this.getNotes(true)
    );
    this.events.subscribe(
      `sendMessage`,
      (data: any) => this.addNote(data.message)
    );
    this.events.subscribe(
      `taskChange`,
      (data: any) => {
        this.taskTracker = data.taskTracker;
        this.taskStatus = TASK_STATUSES[this.taskTracker.status];
      }
    );
    this.events.subscribe(
      `fakeTaskStatusChange`,
      (fakeStatus: string) => this.taskStatus = TASK_STATUSES[fakeStatus]
    );
  }
}
