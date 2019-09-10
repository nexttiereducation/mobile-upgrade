import { Component, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { NativeStorage } from '@ionic-native/native-storage';
import {
  Content,
  Events,
  IonicPage,
  ItemSliding,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

import { SendComponent } from '@nte/components/send/send';
import {
  TASK_LIST_BASE_URL,
  TASK_LIST_EMPTY_STATES,
  TASK_SEARCH_EMPTY_STATE,
  TASK_STATUSES,
  TASK_TILES,
  TaskStatus
} from '@nte/constants/task.constants';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { ICollegeTracker } from '@nte/models/college-tracker.interface';
import { ICollege } from '@nte/models/college.interface';
import { IEmptyState } from '@nte/models/empty-state';
import { IStudent } from '@nte/models/student.interface';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ConnectionService } from '@nte/services/connection.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';
import { TaskPage } from './../task/task';

@IonicPage({
  name: `tasks-list-page`
})
@Component({
  selector: `tasks-list`,
  templateUrl: `tasks-list.html`
})
export class TasksListPage {
  @ViewChild(Content) public content: Content;
  @ViewChild(ItemSliding) public animatedSlidingItem: ItemSliding;

  public collegeImgUrls: any = {};
  public collegeTracker: ICollege | ICollegeTracker | any;
  public connections: any[];
  public emptyState: IEmptyState;
  public hasSearchTerm: boolean;
  public iconUrl: string;
  public impersonatedStudent: IStudent;
  public list: any;
  public listName: string;
  public query: string;
  public searchControl: AbstractControl = new FormControl(``);
  public searchEmptyState: IEmptyState = TASK_SEARCH_EMPTY_STATE;
  public searchTerm: string;
  public taskStatus: any = TaskStatus;
  public taskStatuses: any = TASK_STATUSES;

  private parentUpdateSub: any;
  private resizeContentSub: any;
  private searchControlSub: any;
  private taskChangeSub: any;

  get isSearchAll() {
    return this.list ? this.list.name === `Search All` : this.listName === `Search All`;
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(params: NavParams,
    public connectionService: ConnectionService,
    public events: Events,
    public keyboard: KeyboardService,
    public nativeStorage: NativeStorage,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public stakeholderService: StakeholderService,
    public surveyService: SurveyService,
    public taskService: TaskService,
    public toastCtrl: ToastController,
    private mixpanel: MixpanelService,
    private renderer: Renderer2) {
    this.collegeTracker = params.get(`collegeTracker`);
    this.connections = params.get(`connections`);
    this.impersonatedStudent = params.get(`impersonatedStudent`);
    this.list = params.get(`tile`) || TASK_TILES[0];
  }

  ionViewDidLoad() {
    if (this.impersonatedStudent) {
      this.getTasks(this.impersonatedStudent.id);
    } else {
      this.getTasks();
    }
    this.taskChangeSub = this.events.subscribe(
      `taskChange`,
      (data: any) => {
        if (data.taskTracker.status === TaskStatus.COMPLETED) {
          this.taskService.removeTask(data.taskTracker);
        } else {
          this.taskService.updateTaskInList(data.taskTracker);
        }
      }
    );
    this.resizeContentSub = this.taskService.resizeContent
      .subscribe(() => {
        this.content.resize();
      });
    this.mixpanel.event(`task_filter_selected`, {
      filter: this.listName
    });
  }

  ionViewWillUnload() {
    if (this.searchControlSub) {
      this.searchControlSub.unsubscribe();
    }
    if (this.taskChangeSub) {
      this.taskChangeSub.unsubscribe();
    }
    if (this.parentUpdateSub) {
      this.parentUpdateSub.unsubscribe();
    }
    if (this.resizeContentSub) {
      this.resizeContentSub.unsubscribe();
    }
  }

  public checkSwiper(_itemSliding: ItemSliding, taskTracker: TaskTracker) {
    this.taskUpdated(null, taskTracker);
  }

  public clearSearch(_event: Event) {
    this.searchTerm = ``;
    this.search(null);
  }

  public closeKeyboard(event: Event) {
    if (event) { event.stopPropagation(); }
    this.keyboard.close();
  }

  public getTasks(impersonationId?: number) {
    if (this.list.name) {
      this.iconUrl = this.list.iconUrl;
      this.listName = this.list.name;
      this.query = `${TASK_LIST_BASE_URL}${this.list.filter}`;
      this.emptyState = TASK_LIST_EMPTY_STATES[this.listName];
      if (impersonationId) {
        this.query += this.query.includes(`?`) ? `&` : `?`;
        this.query += `student_id=${impersonationId}`;
      }
      this.taskService.getUserTasks(this.query, false, true);
      if (this.isSearchAll) {
        const colleges = this.impersonatedStudent ?
          this.impersonatedStudent.institutions : this.user.institution_trackers;
        this.setCollegeImages(colleges);
      }
    }
  }

  public infiniteScrollLoad(infiniteScroll: any) {
    if (!this.taskService.userTaskTrackers || !this.taskService.nextPage) {
      infiniteScroll.enable(false);
      return;
    }
    const loadMoreSub: Subscription = this.taskService.moreToScroll
      .subscribe((more) => {
        if (!more) {
          infiniteScroll.enable(false);
        }
        infiniteScroll.complete();
        loadMoreSub.unsubscribe();
      });
    this.taskService.getMoreTasks();
  }

  public openSendModal(task: any) {
    const sendModal = this.modalCtrl.create(
      SendComponent,
      {
        imageUrl: this.getTaskImageUrl(task),
        item: task,
        type: `Task`
      },
      {
        cssClass: `smallModal`,
        enableBackdropDismiss: true,
        showBackdrop: false
      }
    );
    sendModal.present();
  }

  public openTaskDetail(task: any, _prompt: BackEndPrompt<any> = null, page: string = null) {
    const imgUrl = this.getTaskImageUrl(task);
    // if (task.prompt && task.prompt.id) {
    //   this.navCtrl.push(PromptPage, {
    //     isParent: this.impersonatedStudent,
    //     page: page,
    //     prompt: task.prompt,
    //     taskTracker: task,
    //     taskTypeImg: imgUrl
    //   });
    // } else {
    this.navCtrl.push(TaskPage, {
      isParent: this.impersonatedStudent,
      page,
      prompt: task.prompt,
      task,
      taskTypeImg: imgUrl
    });
    // }
  }

  public resetAnimatedItemSliding() {
    this.animatedSlidingItem.startSliding(0);
    this.animatedSlidingItem.endSliding(0);
  }

  public scrollToTop() {
    this.content.scrollToTop();
  }

  public search(event: Event) {
    if (event) { event.stopPropagation(); }
    if (this.searchTerm === ``) {
      this.hasSearchTerm = false;
      this.taskService.getUserTasks(this.query);
    } else {
      this.hasSearchTerm = true;
      this.mixpanel.event(`search_entered`, {
        'search term entered': this.searchTerm,
        'page': `Tasks`
      });
      this.taskService.getUserTasks(`${this.query}${this.isSearchAll && this.user.isStudent ? `?` : `&`}search=${this.searchTerm}`);
    }
  }

  public setCollegeImages(colleges: (ICollege | ICollegeTracker)[]) {
    colleges.forEach(
      (collegeTracker: any) => {
        const id = collegeTracker.institution || collegeTracker.id;
        this.collegeImgUrls[id] = collegeTracker.photo_url;
      }
    );
  }

  public setViewedTasksListPage() {
    this.resetAnimatedItemSliding();
    const user = this.user;
    user.showTaskAnimation = false;
    this.nativeStorage.getItem(user.id.toString())
      .then((storedItems) => {
        storedItems.hasViewedPage = { tasksList: true };
        this.nativeStorage.setItem(user.id.toString(), storedItems);
      })
      .catch((err) => console.error(err));
    const el = document.getElementsByClassName(`itemSlidingAnimation`)[0];
    if (el) {
      this.renderer.removeClass(el, `itemSlidingAnimation`);
    }
  }

  public taskUpdated(event: Event, taskTracker: TaskTracker) {
    if (event) { event.stopPropagation(); }
    if (taskTracker.isStarted && taskTracker.isSurveyTask) {
      this.surveyService.getSurveyData(taskTracker.id);
    }
    this.updateTaskStatus(taskTracker);
  }

  public updateTaskStatus(taskTracker: TaskTracker) {
    if (taskTracker.isUpdating) { return; }
    taskTracker.isUpdating = true;
    if (taskTracker.isSurveyTask || taskTracker.prompt) {
      if (taskTracker.isStarted) {
        this.openTaskDetail(taskTracker, taskTracker.prompt);
        taskTracker.isUpdating = false;
        return;
      } else {
        taskTracker.updatedStatus();
      }
    } else {
      taskTracker.updatedStatus(TaskStatus.COMPLETED);
    }
    this.taskService.updateTaskStatus(taskTracker.id, taskTracker.status)
      .subscribe(
        (taskTrackerChange) => {
          if (taskTrackerChange && (taskTrackerChange.data instanceof TaskTracker)) {
            const newTracker: TaskTracker = taskTrackerChange.data;
            if (newTracker.isSurveyTask) {
              this.openTaskDetail(newTracker);
            } else {
              this.taskService.removeTask(newTracker);
              const toast = this.toastCtrl.create({
                closeButtonText: `UNDO`,
                duration: 5000,
                message: `Task Completed.`,
                position: `bottom`,
                showCloseButton: true
              });
              toast.present();
              toast.onDidDismiss((_data, role) => {
                if (role === `close`) {
                  this.taskService.resetTask(taskTracker);
                }
              });
            }
          } else if (taskTrackerChange) {
            // This is the case where there is a prompt
            this.openTaskDetail(taskTracker, taskTracker.prompt);
          }
        },
        err => console.error(err)
      );
  }

  /* PRIVATE METHODS */

  private getTaskImageUrl(task: any) {
    return this.isSearchAll ? (task.iconUrl || this.collegeImgUrls[task.institution]) : this.iconUrl;
  }
}
