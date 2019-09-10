import { Component } from '@angular/core';
import { File } from '@ionic-native/file';
import { Events, IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import { IEmptyState } from '@nte/models/empty-state';
import { LinkService } from '@nte/services/link.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { TaskService } from '@nte/services/task.service';

@IonicPage({
  name: `task-attachments-page`
})
@Component({
  selector: `task-attachments`,
  templateUrl: `task-attachments.html`
})
export class TaskAttachmentsPage {
  public attachmentsEmptyState: IEmptyState = {
    body: `Attach a document, photo, or spreadsheet relevant to this task.`,
    imagePath: `task/detail_attachments`,
    title: `This task doesn’t have an attachment.`
  };
  public isLoading: boolean;
  public taskTracker: any;

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

  constructor(params: NavParams,
    public navCtrl: NavController,
    private events: Events,
    private file: File,
    private linkService: LinkService,
    private mixpanel: MixpanelService,
    private taskService: TaskService,
    private toastCtrl: ToastController) {
    this.taskTracker = params.get(`taskTracker`);
    // this.transfer = this.fileTransfer.create();
  }

  public back() {
    this.navCtrl.pop({ animation: `ios-transition` });
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
        () => {
          this.isLoading = false;
          const toast = this.toastCtrl.create({
            duration: 5000,
            message: `Unable to download file`
          });
          toast.present();
        }
      );
  }

  public upload(event) {
    this.isLoading = true;
    const file = event.target.files[0];
    this.taskService.uploadFile(this.taskTracker.id, file)
      .subscribe(
        (task) => {
          this.mixpanel.event(`file_uploaded`, {
            'task title': this.taskTracker.task.name
          });
          this.taskTracker = task;
          this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
          const toast = this.toastCtrl.create({
            duration: 5000,
            message: `Unable to upload file. Please make sure it is under 5 MB.`
          });
          toast.present();
        }
      );
  }
}
