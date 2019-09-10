export interface IStatusItem {
  decision: string;
  id: number;
  name: string;
  photo_url?: string;
}

export interface ICollegeStatusItem extends IStatusItem {
  deferred: boolean;
  waitlisted: boolean;
}

export interface IScholarshipStatusItem extends IStatusItem {
  amount_awarded: number;
  isActive: boolean;
  status: string;
}

export class StatusItem {
  public decision: string = ``;
  public id: number = 0;
  public name: string = ``;
  public photo_url?: string = ``;

  constructor(statusItem?: any) {
    if (statusItem) {
      this.decision = statusItem.decision;
      this.id = statusItem.id || statusItem.institution || statusItem.scholarship.id;
      this.name = statusItem.name || statusItem.institution_name || statusItem.scholarship.name;
      this.photo_url = statusItem.photo_url;
    } else {
      this.decision = ``;
      this.id = 0;
      this.name = ``;
      this.photo_url = ``;
    }
  }
}

export class CollegeStatusItem extends StatusItem {
  public deferred: boolean = false;
  public waitlisted: boolean = false;

  constructor(collegeStatusItem?: any) {
    super(collegeStatusItem);
    if (collegeStatusItem) {
      this.deferred = collegeStatusItem.deferred;
      this.waitlisted = collegeStatusItem.waitlisted;
    }
  }
}

export class ScholarshipStatusItem extends StatusItem {
  public amount_awarded: number = 0;
  public isActive: boolean = false;
  public photo_url: string = `assets/image/avatar/scholarship-green.svg`;
  public status: string = ``;

  constructor(scholarshipStatusItem?: any) {
    super(scholarshipStatusItem);
    if (scholarshipStatusItem) {
      this.amount_awarded = scholarshipStatusItem.amount_awarded;
      this.isActive = scholarshipStatusItem.isActive;
      this.photo_url = scholarshipStatusItem.photo_url;
      this.status = scholarshipStatusItem.status;
    }
  }
}
