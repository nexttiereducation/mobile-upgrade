import dayjs from 'dayjs';
import { upperFirst } from 'lodash';

import { TaskStatus } from '@nte/constants/task.constants';
import { ITask } from '@nte/interfaces/task.interface';
import { BackEndPrompt } from '@nte/models/back-end-prompt.model';
import { PromptSelectOptions } from '@nte/models/prompt-select-options.model';
import { PromptTestDatesOptions } from '@nte/models/prompt-test-dates-options.model';
import { YesNoOptions } from '@nte/models/yes-no-options.model';

interface ITemplate {
  file: string;
  file_name: string;
  id: number;
  stakeholder: number;
  stakeholder_full_name: string;
}

export class TaskTracker {
  public app_type: string = null;
  public archived: boolean = null;
  public attachment: string = null;
  public attachment_file_name: string = null;
  public begin_date: string = null;
  public completed: boolean = null;
  public completed_on: string = null;
  public counselor_due_date: string = null;
  public counselor_start_date: string = null;
  public created_on: string = null;
  public deadline: string = null;
  public due_date: string = null;
  public dueDate: any = null;
  public form_urls: any[] = null;
  public iconUrl: string;
  public id: number = null;
  public institution: number = null;
  public institution_name: string = null;
  public isExpanded = false;
  public isUpdating = false;
  public note_count: number = null;
  public overdue = false;
  public prompt: BackEndPrompt<any> = null;
  public prompt_task: string = null;
  public rank_score: any = null;
  public start_date: string = null;
  public startDate: any = null;
  public started_on: string = null;
  public status: TaskStatus | string = null;
  public student: number = null;
  public task: ITask = null;
  public taskType: string = null;
  public templates: ITemplate[] = null;
  public updated_on: string = null;
  public verified_by: number = null;
  public verified_on: string = null;

  get hasAttachment() {
    return (this.templates && this.templates.length > 0) || this.attachment;
  }

  get isComplete() {
    return this.status === TaskStatus.COMPLETED;
  }

  get isNotStarted() {
    return this.status === TaskStatus.NOT_STARTED;
  }

  get isStarted() {
    return this.status === TaskStatus.STARTED;
  }

  get isSurveyTask() {
    return this.task.task_type === `SURT`;
  }

  constructor(obj: any) {
    for (const prop in obj) {
      if (this.hasOwnProperty(prop)) {
        this[prop] = obj[prop];
      }
    }
    this.overdue = dayjs(this.due_date).isBefore(dayjs());
    this.start_date = this.begin_date ? this.begin_date : this.counselor_start_date;
    this.due_date = this.deadline ? this.deadline : this.counselor_due_date;
    if (this.start_date) {
      this.startDate = new Date(this.start_date);
    }
    if (this.due_date) {
      this.dueDate = new Date(this.due_date);
    }
    this.setTaskType();
    if (this.prompt_task) {
      this.createPrompt(this.prompt_task);
    }
  }

  public createPrompt(prompt: any) {
    if (prompt.choices === `None`) {
      this.prompt = new BackEndPrompt<string>(prompt);
    } else {
      switch (prompt.type) {
        case `multiple-choice`:
          prompt.choices = new PromptTestDatesOptions(prompt.choices);
          this.prompt = new BackEndPrompt<PromptTestDatesOptions>(prompt);
          break;
        case `drop-down`:
          prompt.choices = new PromptSelectOptions(prompt.choices);
          this.prompt = new BackEndPrompt<PromptSelectOptions>(prompt);
          break;
        case `polar`:
          prompt.choices = new YesNoOptions(prompt.choices);
          this.prompt = new BackEndPrompt<YesNoOptions>(prompt);
          break;
      }
    }
  }

  public setTaskType() {
    switch (this.task.task_type) {
      case `U`:
      case `UCS`:
        this.taskType = `general`;
        break;
      case `SURT`:
        this.taskType = `survey`;
        break;
      case `CT`:
        this.taskType = `counselor`;
        break;
      case `CS`:
        this.iconUrl = null;
        break;
      case `ST`:
        this.taskType = `scholarship`;
        break;
    }
    if (this.taskType) {
      this.iconUrl = `assets/image/task/type_${this.taskType}.svg`;
      this.taskType = upperFirst(this.taskType);
    }
  }

  public updatedStatus(manualUpdate?: TaskStatus) {
    if (manualUpdate) {
      this.status = manualUpdate;
      if (manualUpdate === TaskStatus.COMPLETED) {
        this.completed_on = dayjs().format(`MM/DD/YYYY`);
      }
    } else {
      switch (this.status) {
        case TaskStatus.NOT_STARTED:
          this.status = TaskStatus.STARTED;
          this.started_on = dayjs().format(`MM/DD/YYYY`);
          break;
        case TaskStatus.STARTED:
          this.status = TaskStatus.COMPLETED;
          this.completed_on = dayjs().format(`MM/DD/YYYY`);
          break;
        case TaskStatus.COMPLETED:
          this.status = TaskStatus.NOT_STARTED;
          break;
      }
    }
  }
}
