import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Content, Events, IonicPage, ModalController, NavController, NavParams, ToastController } from '@ionic/angular';

import { PromptComponent } from '@nte/components/prompt/prompt';
import { TASK_NOTES_EMPTY_STATE, TASK_STATUSES, TaskStatus } from '@nte/constants/task.constants';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { IEmptyState } from '@nte/models/empty-state';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { TaskAttachmentsPage } from './../../pages/task-attachments/task-attachments';
import { TaskSurveyPage } from './../../pages/task-survey/task-survey';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';
import { MessagesPage } from './../messages/messages';

@IonicPage({
  name: `task-page`
})
@Component({
  selector: `task`,
  templateUrl: `task.html`
})
export class TaskPage {
  @ViewChild(Content) public content: Content;

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

  private page: string;
  private taskNotesEmptyState: IEmptyState;

  constructor(params: NavParams,
    public events: Events,
    public linkService: LinkService,
    public sanitizer: DomSanitizer,
    private mixpanel: MixpanelService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private surveyService: SurveyService,
    private taskService: TaskService,
    private toastCtrl: ToastController) {
    this.id = params.get(`id`);
    this.isParent = params.get(`isParent`);
    this.page = params.get(`page`);
    this.prompt = params.get(`prompt`);
    this.taskTracker = params.get(`task`) || null;
    this.typeImage = params.get(`taskTypeImg`);
    this.taskNotesEmptyState = TASK_NOTES_EMPTY_STATE;
  }

  ionViewDidLoad() {
    if (this.taskTracker) {
      this.init();
    } else {
      this.taskService.getTaskTrackerById(this.id)
        .subscribe((tracker: TaskTracker) => {
          this.taskTracker = tracker;
          this.init();
        });
    }
  }

  ionViewWillUnload() {
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
    this.taskService.createNote(this.taskTracker, note);
  }

  public deleteNote(noteId: number, index) {
    this.taskService.deleteNote(this.taskTracker.id, noteId)
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
    this.navCtrl.push(
      TaskAttachmentsPage,
      { taskTracker: this.taskTracker },
      { animation: `ios-transition` }
    );
  }

  public goToNotes() {
    this.navCtrl.push(
      MessagesPage,
      {
        emptyState: this.taskNotesEmptyState,
        messages: this.notes,
        messageType: `note`,
        subtitle: this.taskTracker.task.name,
        status: this.taskStatus,
        taskTracker: this.taskTracker
      },
      { animation: `ios-transition` }
    );
  }

  public goToSurvey() {
    this.navCtrl.push(
      TaskSurveyPage,
      { taskTracker: this.taskTracker },
      { animation: `ios-transition` }
    );
  }

  public openPromptModal() {
    this.modalCtrl.create(
      PromptComponent,
      {
        prompt: this.prompt,
        taskTracker: this.taskTracker
      },
      {
        enableBackdropDismiss: true,
        showBackdrop: false
      }
    ).present();
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
      .subscribe(
        (change) => {
          this.isUpdating = false;
          if (change && (change.data instanceof TaskTracker)) {
            this.taskTracker = change.data;
            this.taskStatus = TASK_STATUSES[this.taskTracker.status];
            this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
            if (this.taskTracker.isSurveyTask) {
              this.goToSurvey();
            } else {
              const toast = this.toastCtrl.create({
                closeButtonText: `UNDO`,
                duration: 5000,
                message: `Task Completed.`,
                showCloseButton: true
              });
              toast.present();
              toast.onDidDismiss((_data, role) => {
                if (role === `close`) {
                  this.taskService.resetTask(this.taskTracker);
                  this.taskStatus = TASK_STATUSES[TaskStatus.NOT_STARTED];
                }
              });
              this.navCtrl.pop();
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
    const noteSub = this.taskService.getNotes(this.taskTracker.id)
      .subscribe(
        (response) => {
          this.notes = response.notes;
          this.notesCount = response.count;
        },
        err => console.error(err),
        () => {
          const eventName = loadingMore ? `moreNotes` : `noteChange`;
          this.events.publish(eventName, { notes: this.notes });
          noteSub.unsubscribe();
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
