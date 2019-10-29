import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { Events, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

const { Toast } = Plugins;

import { IEmptyState } from '@nte/interfaces/empty-state.interface';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { TaskService } from '@nte/services/task.service';

@Component({
  selector: `task-attachments`,
  templateUrl: `task-attachments.html`,
  styleUrls: [`task-attachments.scss`]
})
export class TaskAttachmentsPage implements OnDestroy {
  @Input() taskTracker: TaskTracker;

  public emptyState: IEmptyState = {
    body: `Attach a document, photo, or spreadsheet relevant to this task.`,
    imagePath: `task/detail_attachments`,
    title: `This task doesn’t have an attachment.`
  };
  public isLoading: boolean;

  private ngUnsubscribe: Subject<any> = new Subject();
  private transfer: any; // FileTransferObject;

  get attachmentName() {
    return this.taskTracker.attachment ? this.taskTracker.attachment_file_name :
      this.taskTracker.templates[0].file_name;
  }

  get attachmentUrl() {
    return this.taskTracker.attachment ? this.taskTracker.attachment :
      this.taskTracker.templates[0].file;
  }

  get hasAttachment() {
    return (this.taskTracker.templates && this.taskTracker.templates.length > 0) || this.taskTracker.attachment;
  }

  constructor(public router: Router,
    private events: Events,
    private file: File,
    private linkService: LinkService,
    private mixpanel: MixpanelService,
    private taskService: TaskService) { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public download() {
    this.isLoading = true;
    this.transfer.download(this.attachmentUrl, this.file.dataDirectory + this.attachmentName)
      .then(
        (response) => {
          this.mixpanel.event(`file_downloaded`, {
            'task title': this.taskTracker.task.name
          });
          const downloadUrl = response.toURL();
          this.linkService.open(downloadUrl);
          this.isLoading = false;
        },
        async () => {
          this.isLoading = false;
          await Toast.show({
            text: `Can't download file.`
            });
        }
      );
  }

  public upload(event) {
    this.isLoading = true;
    const file = event.target.files[0];
    this.taskService.uploadFile(this.taskTracker.id, file)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (task) => {
          this.mixpanel.event(`file_uploaded`, {
            'task title': this.taskTracker.task.name
          });
          this.taskTracker = task;
          this.events.publish(`taskChange`, {
            taskTracker: this.taskTracker
          });
          this.isLoading = false;
        },
        async () => {
          this.isLoading = false;
          await Toast.show({
            text: `Can't upload file. Please ensure it is < 5 MB.`
            });
        }
      );
  }
}
