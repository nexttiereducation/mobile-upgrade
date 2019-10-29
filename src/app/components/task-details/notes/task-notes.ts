import { Component, Input, OnInit } from '@angular/core';

import { ChatService } from '@nte/components/chat/chat.service';
import { TaskNotesService } from '@nte/components/task-details/notes/task-notes.service';
import { TASK_NOTES_EMPTY_STATE } from '@nte/constants/task.constants';
import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `task-notes`,
  templateUrl: `task-notes.html`,
  styleUrls: [`task-notes.scss`]
})
export class TaskNotesPage implements OnInit {
  @Input() taskTracker: TaskTracker;

  public emptyState: IEmptyState = TASK_NOTES_EMPTY_STATE;

  constructor(public taskNotesService: TaskNotesService,
    private chatService: ChatService,
    private taskService: TaskService) { }

  ngOnInit() {
    this.chatService.messageType = `note`;
    this.chatService.subtitle = this.taskTracker.task.name;
    if (!this.taskNotesService.all || !this.taskNotesService.all.length) {
      this.taskNotesService.get(this.taskService.activeTaskId);
    }
  }

  send(ev: any) {
    this.taskNotesService.create(this.taskTracker, ev);
  }
}
