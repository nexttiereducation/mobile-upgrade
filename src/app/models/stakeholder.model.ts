import { ICollegeTracker } from './college-tracker.interface';
import { ICollege } from './college.interface';
import { IResult } from './interest-profiler.models';
import { IStudentConnection } from './student-connection.interface';
import { IStudent } from './student.interface';
import { ActScore } from '@nte/models/test-score-act.model';
import { SatScore } from '@nte/models/test-score-sat.model';

export class Stakeholder {
  public act_scores: ActScore[] = null;
  public adult_connections: any[] = null;
  public ambassador_uid: string = null;
  public anonymous: boolean = null;
  public attachments: any[] = null;
  public authToken: string = null;
  public city: string = null;
  public class_rank: number = null;
  public college: ICollege = null;
  public completed_tasks: number = null;
  public district: any = null;
  public email: string = null;
  public entitlements: any[] = null;
  public first_name: string = null;
  public gender: string = null;
  public gpa: any = null;
  public graduation_year: number = null;
  public has_letters: boolean = null;
  public has_transitioned: boolean = null;
  public highschool: string = null;
  public id: number = null;
  public institution: ICollege = null;
  public institution_trackers: ICollegeTracker[] = null;
  public interest_profiler_answers: string[] = null;
  public interest_profiler_result: IResult[] = null;
  public is_active: boolean = null;
  public is_ambassador: boolean = null;
  public last_login: Date = null;
  public last_name: string = null;
  public loggedIn: boolean = null;
  public meta: any = null;
  public pathRoot: string = null;
  public phase: string = null;
  public photo_url: string = null;
  public photoUrl: string = null;
  public points: number = null;
  public potential_majors: number[] = null;
  public profile_photo: string = null;
  public recommended_colleges: ICollege[] = null;
  public referred_users: number = null;
  public registration_date: Date = null;
  public sat_scores: SatScore[] = null;
  public showTaskAnimation: boolean = false;
  public signin_prompt: boolean = null;
  public signin_prompt_category: any = null;
  public stakeholder_type: string = null;
  public state: string = null;
  public student_connections: IStudentConnection[] = null;
  public students: IStudent[] = null;
  public verified: boolean = null;

  get canAddSchools(): boolean {
    return this.isStudent || this.anonymous || !this.loggedIn;
  }

  get canRecommendSchools(): boolean {
    return this.isMentor;
  }

  get fullName(): string {
    return (this.first_name || this.last_name ?
      `${this.first_name || null} ${this.last_name || null}` :
      (this.email ? this.email.replace(/@.*/, ``) : ``)).trim();
  }

  get hasActScores() {
    return this.act_scores && this.act_scores.length > 0;
  }

  get hasCompletedAcademicInformation(): boolean {
    let hasCompletedInfo = false;
    if (this.gpa && this.class_rank) {
      if (this.hasActScores) {
        if (this.act_scores[0].composite
          && this.act_scores[0].english
          && this.act_scores[0].math
          && this.act_scores[0].reading
          && this.act_scores[0].science
          && this.act_scores[0].writing) {
          hasCompletedInfo = true;
        }
      }

      if (this.hasSatScores) {
        if (this.sat_scores[0].math
          && this.sat_scores[0].reading
          && this.sat_scores[0].writing) {
          hasCompletedInfo = true;
        }
      }
    }
    return hasCompletedInfo;
  }

  get hasConnections(): boolean {
    if ((this.adult_connections && this.adult_connections.length > 0)
      || (this.student_connections && this.student_connections.length > 0)) {
      return true;
    } else {
      return false;
    }
  }

  get hasSatScores() {
    return this.sat_scores && this.sat_scores.length > 0;
  }

  get isAdmin(): boolean {
    return this.email &&
      this.email.indexOf(`admin`) !== -1 &&
      this.email.indexOf(`@nexttier`) !== -1;
  }

  get isAnonymous(): boolean {
    return this.anonymous;
  }

  get isCounselor(): boolean {
    return this.stakeholder_type === `Counselor`;
  }

  get isDistrict(): boolean {
    return this.isAllowed(`view all`, `District`);
  }

  get isGhost(): boolean {
    return sessionStorage.getItem(`ls.isGhost`)
      && sessionStorage.getItem(`ls.isGhost`).length > 0;
  }

  get isMentor(): boolean {
    const mentorTypes = new Set([
      `Counselor`,
      `Parent`
    ]);
    return mentorTypes.has(this.stakeholder_type);
  }

  get isParent(): boolean {
    return /parent/gi.test(this.typeLower);
  }

  get isSenior(): boolean {
    return /senior/gi.test(this.phaseLower);
  }

  get isStudent(): boolean {
    return /(student|anonymous)/i.test(this.typeLower);
  }

  get isTeamMember(): boolean {
    return !(this.isStudent || this.isCounselor);
  }

  get isUpperClassman(): boolean {
    return /senior/.test(this.phaseLower) || /junior/.test(this.phaseLower);
  }

  get name(): string {
    const name = this.first_name || this.last_name || this.email;
    return name ? name.replace(/@.*/, ``) : null;
  }

  // get photoUrl(): string {
  //     return this.parseUserPhoto(this.photoUrl, this.stakeholder_type);
  // }

  get phaseLower() {
    return this.phase ? this.phase.toLowerCase() : null;
  }

  get stakeholderType(): string {
    return this.stakeholder_type;
  }

  get trackType(): string {
    return this.isStudent ? `student` : `mentor`;
  }

  get typeLower(): string {
    return this.stakeholder_type ? this.stakeholder_type.toLowerCase() : null;
  }

  get usesApplicationDates(): boolean {
    return /senior/i.test(this.phaseLower) && this.phaseLower.indexOf(`rising`) === -1;
  }

  constructor(obj: any) {
    for (const prop in obj) {
      if (this.hasOwnProperty(prop)) {
        this[prop] = obj[prop];
      }
    }
  }

  public isAllowed(actionName?: string, resource?: string): boolean {
    if (this.entitlements) {
      for (let i = 0, entitlement: any; entitlement = this.entitlements[i]; ++i) {
        if (entitlement.name.toUpperCase() === actionName.toUpperCase()) {
          if (!resource) {
            return true;
          } // if no specific resource, default to allowed
          if (entitlement.resource
            && (resource.toUpperCase() === entitlement.resource.toUpperCase())) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // parseUserPhoto(photo, stakeholderType) {
  //     let userType = stakeholderType.toLowerCase() || '';
  //     if (!photo) {
  //         photo = 'http://next-tier-cust-files.s3.amazonaws.com/';
  //         switch (userType) {
  //             case 'counselor':
  //                 photo += 'build/images/avatars/counselor.png';
  //                 break;
  //             case 'parent':
  //                 photo += 'build/images/avatars/parent.png';
  //                 break;
  //             default:
  //                 photo += 'build/images/avatars/student.png';
  //                 break;
  //         }
  //     } else {
  //         if (!/https?:\/\//.test(photo)) {
  //             photo = 'http://next-tier-cust-files.s3.amazonaws.com/' + photo;
  //         }
  //     }
  //     return photo;
  // }

  public populateData(obj: any) {
    for (const prop in obj) {
      if (this.hasOwnProperty(prop)) {
        this[prop] = obj[prop];
      }
    }
  }

  public toJSON() {
    return {
      act_scores: this.act_scores,
      adult_connections: this.adult_connections,
      ambassador_uid: this.ambassador_uid,
      anonymous: this.anonymous,
      attachments: this.attachments,
      authToken: this.authToken,
      canAddSchools: this.canAddSchools,
      canRecommendSchools: this.canRecommendSchools,
      city: this.city,
      class_rank: this.class_rank,
      college: this.institution,
      college_trackers: this.institution_trackers,
      completed_tasks: this.completed_tasks,
      district: this.district,
      email: this.email,
      entitlements: this.entitlements,
      first_name: this.first_name,
      fullName: this.fullName,
      gender: this.gender,
      gpa: this.gpa,
      graduation_year: this.graduation_year,
      has_letters: this.has_letters,
      has_transitioned: this.has_transitioned,
      hasCompletedAcademicInformation: this.hasCompletedAcademicInformation,
      hasConnections: this.hasConnections,
      highschool: this.highschool,
      id: this.id,
      institution: this.institution,
      institution_trackers: this.institution_trackers,
      interest_profiler_answers: this.interest_profiler_answers,
      interest_profiler_result: this.interest_profiler_result,
      is_active: this.is_active,
      is_ambassador: this.is_ambassador,
      isAdmin: this.isAdmin,
      isAnonymous: this.isAnonymous,
      isCounselor: this.isCounselor,
      isDistrict: this.isDistrict,
      isGhost: this.isGhost,
      isMentor: this.isMentor,
      isParent: this.isParent,
      isSenior: this.isSenior,
      isStudent: this.isStudent,
      isTeamMember: this.isTeamMember,
      isUpperClassman: this.isUpperClassman,
      last_login: this.last_login,
      last_name: this.last_name,
      loggedIn: this.loggedIn,
      meta: this.meta,
      name: this.name,
      pathRoot: this.pathRoot,
      phase: this.phase,
      photo_url: this.photo_url,
      photoUrl: this.photoUrl,
      points: this.points,
      potential_majors: this.potential_majors,
      profile_photo: this.profile_photo,
      recommended_colleges: this.recommended_colleges,
      referred_users: this.referred_users,
      registration_date: this.registration_date,
      sat_scores: this.sat_scores,
      signin_prompt: this.signin_prompt,
      signin_prompt_category: this.signin_prompt_category,
      stakeholder_type: this.stakeholder_type,
      stakeholderType: this.stakeholderType,
      state: this.state,
      student_connections: this.student_connections,
      trackType: this.trackType,
      usesApplicationDates: this.usesApplicationDates,
      verified: this.verified
    };
  }
}
