import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Events, IonContent, IonItemSliding, ModalController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SendComponent } from '@nte/components/send/send';
import {
  TASK_LIST_BASE_URL,
  TASK_LIST_EMPTY_STATES,
  TASK_SEARCH_EMPTY_STATE,
  TASK_STATUSES,
  TASK_TILES,
  TaskStatus
} from '@nte/constants/task.constants';
import { ICollegeTracker } from '@nte/interfaces/college-tracker.interface';
import { ICollege } from '@nte/interfaces/college.interface';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { IStudent } from '@nte/interfaces/student.interface';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ConnectionService } from '@nte/services/connection.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `tasks-list`,
  templateUrl: `tasks-list.html`,
  styleUrls: [`tasks-list.scss`]
})
export class TasksListPage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  @ViewChild(IonItemSliding, { static: false }) public animatedSlidingItem: IonItemSliding;

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

  private ngUnsubscribe: Subject<any> = new Subject();

  get isSearchAll() {
    return this.list ? this.list.name === `Search All` : this.listName === `Search All`;
  }

  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(public connectionService: ConnectionService,
    public events: Events,
    public nativeStorage: NativeStorage,
    public route: ActivatedRoute,
    public router: Router,
    public modalCtrl: ModalController,
    public stakeholderService: StakeholderService,
    public surveyService: SurveyService,
    public taskService: TaskService,
    public toastCtrl: ToastController,
    private mixpanel: MixpanelService,
    private renderer: Renderer2,
    navStateService: NavStateService) {
    const params: any = navStateService.data;
    this.collegeTracker = params.collegeTracker || null;
    this.connections = params.connections || null;
    this.impersonatedStudent = params.impersonatedStudent || null;
    this.list = params.tile || TASK_TILES[0];
  }

  ngOnInit() {
    if (this.impersonatedStudent && this.impersonatedStudent.id) {
      this.getTasks(this.impersonatedStudent.id);
    } else {
      this.getTasks();
    }
    this.events.subscribe(
      `taskChange`,
      (data: any) => {
        if (data.taskTracker.status === TaskStatus.COMPLETED) {
          this.taskService.removeTask(data.taskTracker);
        } else {
          this.taskService.updateTaskInList(data.taskTracker);
        }
      }
    );
    // this.taskService.resizeContent
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe(() => this.content.resize());
    this.mixpanel.event(`task_filter_selected`, {
      filter: this.listName
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.events.unsubscribe(`taskChange`);
  }

  public checkSwiper(_itemSliding: IonItemSliding, taskTracker: TaskTracker) {
    this.taskUpdated(null, taskTracker);
  }

  public clearSearch(_event: Event) {
    this.searchTerm = ``;
    this.search(null);
  }

  public closeKeyboard(event: Event) {
    if (event) { event.stopPropagation(); }
    // this.keyboard.close();
  }

  public getTasks(impersonationId?: number) {
    if (this.list.name) {
      this.iconUrl = this.list.iconUrl;
      this.listName = this.list.name;
      this.query = `${TASK_LIST_BASE_URL}${this.list.filter}`;
      this.emptyState = TASK_LIST_EMPTY_STATES[this.listName];
      if (impersonationId) {
        this.query.includes(`?`) ? this.query += `&` : this.query += `?`;
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
    this.taskService.moreToScroll
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (more) => {
          if (!more) {
            infiniteScroll.enable(false);
          }
          infiniteScroll.complete();
        }
      );
    this.taskService.getMoreTasks();
  }

  public async openSendModal(task: any) {
    const modal = await this.modalCtrl.create({
      backdropDismiss: true,
      component: SendComponent,
      componentProps: {
        imageUrl: this.getTaskImageUrl(task),
        item: task,
        type: `Task`
      },
      cssClass: `smallModal`,
      showBackdrop: false
    });
    return await modal.present();
  }

  public openTaskDetail(task: any, _prompt: BackEndPrompt<any> = null, page: string = null) {
    const imgUrl = this.getTaskImageUrl(task);
    // if (task.prompt && task.prompt.id) {
    //   this.router.navigate([PromptPage, {
    //     isParent: this.impersonatedStudent,
    //     page: page,
    //     prompt: task.prompt,
    //     taskTracker: task,
    //     taskTypeImg: imgUrl
    //   }]);
    // } else {
    this.router.navigateByUrl(
      `app/tasks/${task.id}`,
      {
        state: {
          isParent: this.impersonatedStudent,
          page,
          prompt: task.prompt,
          task,
          taskTypeImg: imgUrl
        }
      }
    );
    // }
  }

  public resetAnimatedItemSliding() {
    this.animatedSlidingItem.open(`end`);
    this.animatedSlidingItem.close();
  }

  public scrollToTop() {
    this.content.scrollToTop();
  }

  public search(event: any) {
    if (event) {
      this.searchTerm = event.detail.value;
      if (this.searchTerm === ``) {
        this.hasSearchTerm = false;
        this.taskService.getUserTasks(this.query);
      } else {
        this.hasSearchTerm = true;
        this.mixpanel.event(`search_entered`, {
          'search term entered': this.searchTerm,
          page: `Tasks`
        });
        const query = `${this.query}${this.isSearchAll && this.user.isStudent ? '?' : '&'}search=${this.searchTerm}`;
        this.taskService.getUserTasks(query);
      }
    }
  }

  public setCollegeImages(colleges: (ICollege | ICollegeTracker)[]) {
    if (colleges && colleges.length > 0) {
      colleges.forEach(
        (collegeTracker: any) => {
          const id = collegeTracker.institution || collegeTracker.id;
          this.collegeImgUrls[id] = collegeTracker.photo_url;
        }
      );
    }
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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (taskTrackerChange) => {
          if (taskTrackerChange && (taskTrackerChange.data instanceof TaskTracker)) {
            const newTracker: TaskTracker = taskTrackerChange.data;
            if (newTracker.isSurveyTask) {
              this.openTaskDetail(newTracker);
            } else {
              this.taskService.removeTask(newTracker);
              this.openTaskCompleteToast(newTracker);
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

  private async openTaskCompleteToast(taskTracker: TaskTracker) {
    const toast = await this.toastCtrl.create({
      buttons: [{
        handler: () => this.taskService.resetTask(taskTracker),
        text: `Undo`
      }],
      duration: 5000,
      message: `Task completed.`,
      position: `bottom`
    });
    toast.present();
  }
}
