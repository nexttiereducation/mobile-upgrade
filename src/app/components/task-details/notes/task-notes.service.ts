import { flatten } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { sortBy, uniqBy } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { isArray } from 'util';

import { ChatService } from '@nte/components/chat/chat.service';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { ApiService } from '@nte/services/api.service';
import { ListService } from '@nte/services/list.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { TaskService } from '@nte/services/task.service';

@Injectable()
export class TaskNotesService extends ListService {
  public taskTracker: any;

  private _isSending: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get isSending() {
    return this._isSending.getValue();
  }
  set isSending(isSending: boolean) {
    this._isSending.next(isSending);
  }
  get isSending$() {
    return this._isSending.asObservable();
  }

  constructor(private apiService: ApiService,
    private chatService: ChatService,
    private taskService: TaskService,
    private mixpanel: MixpanelService) {
    super();
  }

  public create(taskTracker: TaskTracker, note: string) {
    this.apiService.post(`/tasks/${taskTracker.id}/note/`, { note })
      .subscribe(
        () => {
          this.isSending = false;
          this.mixpanel.event(`task_note_added`, {
            'task title': taskTracker.task.name
          });
          this.get(taskTracker.id, true);
        },
        (error) => {
          console.error(error);
          this.isSending = false;
        }
      );
  }

  public delete(taskTrackerId: number, noteId: number, index: number) {
    this.apiService.delete(`/tasks/${taskTrackerId}/note/${noteId}`)
      .subscribe(
        () => {
          this.all.splice(index, 1);
          // this.events.publish(`noteChange`, { notes: this.notes });
        },
        (err) => console.error(err)
      );
  }

  public add(note: string, tracker: TaskTracker) {
    if (this.isSending) { return; }
    this.isSending = true;
    this.create(tracker, note);
  }

  public get(taskId: number, isLoadingMore: boolean = false) {
    const isNewTask = (this.taskService.activeTaskId !== taskId);
    let url = `/tasks/${taskId}/notes/`;
    let hasNextPage = false;
    if (!isNewTask) {
      hasNextPage = this.nextPage && this.nextPage.length > 0;
      if (hasNextPage) {
        url = this.nextPage;
      }
    } else {
      this.nextPage = null;
      this.taskService.activeTaskId = taskId;
    }
    this.apiService.get(url, hasNextPage)
      .subscribe(data => {
        let notes = data.results;
        this.count = data.count;
        this.nextPage = data.next;
        if (!isNewTask && this.all && this.all.length) {
          notes = uniqBy(flatten([notes, ...this.all]), `id`);
        } else {
          notes = isArray(notes) ? notes : [notes];
        }
        this.all = sortBy(notes, [`id`]);
        if (isLoadingMore) {
          this.chatService.scrollToBottom = true;
        }
      });
  }

}
