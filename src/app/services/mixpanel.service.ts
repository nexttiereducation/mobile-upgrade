import { Injectable } from '@angular/core';
import { Mixpanel, MixpanelPeople } from '@ionic-native/mixpanel';

import { INewUser } from '@nte/models/new-user.interface';
import { Stakeholder } from '@nte/models/stakeholder.model';
import { EnvironmentService } from '@nte/services/environment.service';

@Injectable({ providedIn: 'root' })
export class MixpanelService {
  constructor(
    private environmentService: EnvironmentService,
    private mixpanel: Mixpanel,
    private mixpanelPeople: MixpanelPeople
  ) { }

  public basics() {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    this.mixpanel.registerSuperProperties({
      user_type: `anonymous`
    });
  }

  public clearUser(_reload?: boolean) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    this.mixpanel.reset();
  }

  public event(name: string, data: any = {}) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    data.timestamp = new Date().toISOString();
    this.mixpanel.track(name, data);
  }

  public increment(_prop: string, value: number) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    this.mixpanelPeople.increment({
      prop: value
    });
  }

  public setHighSchool(districtName, schoolId) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    this.mixpanelPeople.set({
      district: districtName,
      high_school_id: schoolId
    });
  }

  public setPerson(_prop: string, value: any) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    this.mixpanelPeople.set({
      prop: value
    });
  }

  public signUp(userIdAndToken: any, user: INewUser) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    const mixpanelId = userIdAndToken.id;
    this.mixpanel.alias(mixpanelId, ``);
    this.mixpanelPeople.set({
      $created: new Date(),
      $email: user.email,
      $first_name: user.first_name,
      $last_name: user.last_name,
      $name: `${user.first_name} ${user.last_name}`,
      district: user.district ? user.district.name : null,
      graduation_year: user.graduation_year,
      high_school_id: user.highschool,
      registration_date: new Date(),
      stakeholder_id: userIdAndToken.id,
      user_type: user.stakeholder_type
    });
    this.mixpanel.identify(mixpanelId);
  }

  public start(user: Stakeholder) {
    if (this.environmentService.isLocal || !this.mixpanel) {
      return;
    }
    const mixpanelId = user.id;
    if (mixpanelId) {
      this.mixpanel.identify(mixpanelId.toString());
      const userPhase = user.isStudent ? user.phase : `N/A`;
      const districtName = user.district ? user.district.name : null;
      this.mixpanelPeople.set({
        $email: user.email,
        $first_name: user.first_name,
        $last_name: user.last_name,
        $name: `${user.first_name} ${user.last_name}`,
        district: districtName,
        graduation_year: user.graduation_year,
        has_connections: user.hasConnections,
        high_school_id: user.highschool,
        registration_date: user.registration_date,
        stakeholder_id: user.id,
        user_phase: userPhase,
        user_type: user.stakeholder_type,
        verified: user.verified
      });
      this.mixpanel.registerSuperProperties({
        district: districtName,
        email: user.email,
        graduation_year: user.graduation_year,
        high_school_id: user.highschool,
        user_phase: userPhase,
        user_type: user.stakeholder_type
      });
      this.mixpanelPeople.setOnce({
        schools_followed: 0,
        tasks_completed: 0,
        tasks_started: 0
      });
    }
  }
}
