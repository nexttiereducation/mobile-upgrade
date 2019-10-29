import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { find } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { TASK_BUCKETS, TaskStatus } from '@nte/constants/task.constants';
import { INote } from '@nte/interfaces/note.interface';
import { IStudent } from '@nte/interfaces/student.interface';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { TaskTrackerChange } from '@nte/models/task-tracker-change.model';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ApiService } from '@nte/services/api.service';
import { MixpanelService } from '@nte/services/mixpanel.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  public activeTaskId: number;
  public archivedTaskData: any = {
    count: 0,
    nextPage: ``,
    tasks: []
  };
  public completedTasksCount: number;
  public downloadedTaskId: number;
  public fetchingTasks = false;
  public impersonatedStudent: IStudent;
  public incompleteTaskCount: Map<number, number> = new Map<number, number>();
  public initializingTasks: boolean;
  public lastTaskIndex: number;
  public nextPage: string;
  public onlyTask: any = null;
  public taskBuckets: any = TASK_BUCKETS;
  public totalTaskCount: number;

  private _archivedTasks: BehaviorSubject<TaskTracker[]> = new BehaviorSubject<TaskTracker[]>(null);
  private _hasCounselorTasks = false;
  private _moreToScroll: Subject<boolean> = new Subject<boolean>();
  private _nextTasks: Map<string | number, TaskTracker> = new Map<string | number, TaskTracker>();
  private _resizeContent: Subject<boolean> = new Subject<boolean>();
  private _taskTrackers: BehaviorSubject<TaskTracker[]> = new BehaviorSubject<TaskTracker[]>(null);
  private _unverifiedTaskTrackers: BehaviorSubject<TaskTracker[]> = new BehaviorSubject<TaskTracker[]>(null);
  private _userTaskTrackers: BehaviorSubject<TaskTracker[]> = new BehaviorSubject<TaskTracker[]>([]);
  private allUserTaskTrackers: TaskTracker[] = new Array<TaskTracker>();

  get archivedTaskTrackers() {
    return this._archivedTasks.asObservable();
  }

  get hasCounselorTasks() {
    return this._hasCounselorTasks;
  }

  get moreToScroll() {
    return this._moreToScroll.asObservable();
  }

  get nextTasks() {
    return this._nextTasks;
  }

  get resizeContent() {
    return this._resizeContent.asObservable();
  }

  get taskTrackers() {
    return this._taskTrackers.asObservable();
  }

  get unverifiedTaskTrackers() {
    return this._unverifiedTaskTrackers.asObservable();
  }

  get userTaskTrackers() {
    return this._userTaskTrackers.asObservable();
  }

  constructor(private apiService: ApiService,
    private alertCtrl: AlertController,
    private mixpanel: MixpanelService) { }

  public addTaskBackToList(taskTracker: TaskTracker) {
    const allTasks = this._userTaskTrackers.getValue();
    allTasks.splice(this.lastTaskIndex, 0, taskTracker);
    this._userTaskTrackers.next(allTasks);
  }

  public downloadTaskFile(taskId: number): void {
    this.apiService.get(`/task_list/${taskId}/attachment`)
      .subscribe(
        (data) => {
          const link = document.createElement(`a`);
          link.setAttribute(`href`, data.url);
          link.download = data.file_name;
          link.target = `_blank`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        },
        err => console.error(err)
      );
  }

  public expandTask(taskId: number): void {
    const taskTracker = find(this._userTaskTrackers.value, (task) => task.id === taskId);
    if (taskTracker) {
      taskTracker.isExpanded = true;
    }
  }

  public getArchivedTasks(url: string, isAbsoluteUrl?: boolean): void {
    this.apiService.get(url, isAbsoluteUrl)
      .pipe(map(data => {
        if (isAbsoluteUrl) {
          this.archivedTaskData.tasks = this.archivedTaskData.tasks.concat(data.results);
        } else {
          this.archivedTaskData.tasks = data.results;
        }
        this.archivedTaskData.nextPage = data.next;
        this.archivedTaskData.count = data.results.length;
      }))
      .subscribe(
        () => {
          this._archivedTasks.next(this.archivedTaskData.tasks);
        },
        err => console.error(err)
      );
  }

  public getMoreTasks() {
    if (!this.nextPage) {
      this._moreToScroll.next(false);
      return;
    }
    this.getUserTasks(this.nextPage, true);
  }

  public getNextTask(path: string, type?: string) {
    this.apiService.get(path)
      .subscribe(
        (tasks) => {
          const next = tasks.results[0];
          if (!next) {
            if (type) {
              this.getTasks(type, path);
            }
            return;
          }
          if (type) {
            this._nextTasks.set(type, next);
            this.getTasks(type, path);
          } else {
            this._nextTasks.set(next.institution, next);
            this.incompleteTaskCount.set(next.institution, tasks.count);
          }
        }
      );
  }

  public getTasks(type, path) {
    const taskPath = path.replace(`status=NS`, `status=NS&status=C`);
    this.apiService.get(taskPath)
      .subscribe(
        (tasks) => {
          this.setupTaskBuckets(type, tasks);
        }
      );
  }

  public getTaskTrackerById(id: number) {
    return this.apiService.get(`/task_list/${id}`);
  }

  public getUnverifiedTasks(impersonationId: number) {
    let tasks = new Array<TaskTracker>();
    this.apiService.get(`/task_list/?status=C&student_id=${impersonationId}`)
      .pipe(map((response) => {
        tasks = response.results;
      }))
      .subscribe(() => {
        const unverifiedTasks = tasks.filter((task) => !task.verified_by);
        this._unverifiedTaskTrackers.next(unverifiedTasks);
      });
  }

  public getUserTasks(url: string, isAbsoluteUrl?: boolean, isInitialLoad?: boolean,
    _impersonationId?: number, openFirstTask?: boolean): void {
    this.fetchingTasks = true;
    this.initializingTasks = isInitialLoad;
    if (isInitialLoad) { this._userTaskTrackers.next([]); }
    let sortedTasks = new Array<TaskTracker>();
    this.apiService.get(url, isAbsoluteUrl)
      .pipe(map(data => {
        if (this.nextPage === data.next) {
          this.nextPage = null;
          this._moreToScroll.next(false);
        } else {
          this.nextPage = data.next;
          this._moreToScroll.next(true);
        }
        let instantiatedTasks;
        if (data.results) {
          instantiatedTasks = this.createTaskObjects(data.results);
        } else {
          this.onlyTask = data;
          instantiatedTasks = this.createTaskObjects([data]);
        }
        if (isAbsoluteUrl) {
          this.allUserTaskTrackers = this.allUserTaskTrackers.concat(instantiatedTasks);
        } else {
          this.allUserTaskTrackers = instantiatedTasks;
        }
        sortedTasks = this.allUserTaskTrackers;
        this.totalTaskCount = data.count || 1;
        this.completedTasksCount = data.completed_count || 0;
        if (openFirstTask) {
          this.allUserTaskTrackers[0].isExpanded = true;
        }
      }))
      .subscribe(
        () => {
          this._userTaskTrackers.next(sortedTasks);
          this.fetchingTasks = false;
          if (this.initializingTasks && sortedTasks.length) {
            this._resizeContent.next(true);
          }
          this.initializingTasks = false;
        },
        (err) => {
          this.fetchingTasks = false;
          this.initializingTasks = false;
          this.showErrorAlert(err);
        }
      );
  }

  public removeTask(taskTracker: TaskTracker) {
    const allTasks = this._userTaskTrackers.getValue();
    this.lastTaskIndex = allTasks.findIndex(t => t.id === taskTracker.id);
    if (this.lastTaskIndex > -1) {
      allTasks.splice(this.lastTaskIndex, 1);
      this._userTaskTrackers.next(allTasks);
    }
  }

  public resetTask(taskTracker: TaskTracker) {
    taskTracker.updatedStatus(TaskStatus.NOT_STARTED);
    this.updateTaskStatus(taskTracker.id, taskTracker.status)
      .subscribe((taskTrackerChange) => {
        if (taskTrackerChange.data instanceof TaskTracker) {
          const newTracker: TaskTracker = taskTrackerChange.data;
          this.addTaskBackToList(newTracker);
        }
      });
  }

  public setArchivedTasks() {
    this.nextPage = this.archivedTaskData.nextPage;
    this.totalTaskCount = this.archivedTaskData.count;
  }

  public setupTaskBuckets(type, tasks) {
    // tasks.percentage_of_completed_tasks = (tasks.completed_count / tasks.count) * 100;
    this.taskBuckets[type] = tasks;
  }

  public updateNote(taskId: number, note: INote): Observable<any> {
    return this.apiService.patch(`/tasks/${taskId}/note/${note.id}`, { note: note.note });
  }

  public updateTaskInList(taskTracker: TaskTracker) {
    const taskTrackers = this._userTaskTrackers.getValue();
    const trackerIndex = taskTrackers.findIndex((tracker) => {
      return tracker.id === taskTracker.id;
    });
    if (trackerIndex > -1) {
      taskTrackers.splice(trackerIndex, 1, taskTracker);
    }
  }

  public updateTaskStatus(id: number, status: TaskStatus):
    Observable<TaskTrackerChange<TaskTracker | BackEndPrompt<any>>> {
    return this.apiService.patch(`/task_list/${id}`, { status })
      .pipe(map((response) => {
        if (response.status !== 299) {
          const newTaskTracker = new TaskTrackerChange<TaskTracker>(new TaskTracker(response));
          const mixpanelData = {
            'school name': newTaskTracker.data.institution_name,
            'task title': newTaskTracker.data.task.name,
            'task type': newTaskTracker.data.task.task_type
          };
          if (newTaskTracker.data.status === `C`) {
            this.mixpanel.event(`task_completed`, mixpanelData);
          } else if (newTaskTracker.data.status === `ST`) {
            this.mixpanel.event(`task_started`, mixpanelData);
          }
          return newTaskTracker;
        } else {
          return new TaskTrackerChange<BackEndPrompt<any>>(null);
        }
      }));
  }

  public uploadFile(id: number, file: File): Observable<TaskTracker> {
    return this.apiService.patchFile(`/task_list/${id}`, file)
      .pipe(
        map((response: any) => new TaskTracker(response)),
        tap((taskTracker) => {
          const tracker: any = taskTracker;
          const trackerIndex = this.allUserTaskTrackers.findIndex((tt) => tt.id === tracker.id);
          this.allUserTaskTrackers[trackerIndex] = tracker;
        })
      );
  }

  public verifyStudentTask(taskTracker: TaskTracker): void {
    this.apiService.patch(`/task_list/${taskTracker.id}/verify/`)
      .pipe(map((response) => response))
      .subscribe(
        (newTaskTracker) => {
          const taskTrackerIndex = this._unverifiedTaskTrackers.value.indexOf(taskTracker);
          this._unverifiedTaskTrackers.value[taskTrackerIndex] = newTaskTracker;
        },
        err => console.error(err)
      );
  }

  private createTaskObjects(tasks: TaskTracker[]): TaskTracker[] {
    return [...tasks].map(t => new TaskTracker(t));
  }

  private async showErrorAlert(err) {
    const alert = await this.alertCtrl.create({
      buttons: [`Dismiss`],
      subHeader: `An error has occurred. Please try again. ${err}`,
      header: `Error`
    });
    alert.present();
  }
}
