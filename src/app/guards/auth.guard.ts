import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { ApiTokenService } from '@nte/services/api-token.service';
import { StakeholderService } from '@nte/services/stakeholder.service';

@Injectable()
export class AuthGuard implements CanActivate {
  get user() {
    return this.stakeholderService.stakeholder;
  }

  constructor(private router: Router,
    private stakeholderService: StakeholderService,
    private apiTokenService: ApiTokenService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.apiTokenService.token) {
      this.stakeholderService.checkStorage()
        .then(
          isLoggedIn => {
            if (isLoggedIn) {
              return true;
            } else {
              // this.router.navigate(['login']);
              return false;
            }
          }
        );
    }
    return true;
  }
}
