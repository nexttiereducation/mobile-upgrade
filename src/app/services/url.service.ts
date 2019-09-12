import { Injectable } from '@angular/core';

import { EnvironmentService } from '@nte/services/environment.service';


@Injectable({ providedIn: 'root' })
export class UrlService {
  private apiPathRoot: string;
  private djangoApi: any = {
    prod: `https://api.nexttier.com/v1`,
    stg: `https://api-staging.nexttier.com/v1`
  };
  private domains: any = {
    prod: `https://nexttier.com/`,
    stg: `https://stg.nexttier.com/`
  };
  private envDomain: string;
  private nodeApi: any = {
    prod: `https://node.nexttier.com`,
    stg: `https://node-staging.nexttier.com`
  };
  private nodeApiPathRoot: string;

  constructor(private environment: EnvironmentService) {
    this.init();
  }

  public getDomain(): string {
    return this.envDomain;
  }

  public getNodePathRoot(): string {
    return this.nodeApiPathRoot;
  }

  public getPathRoot(): string {
    return this.apiPathRoot;
  }

  // TODO: Update for Mobile Prod!
  private init() {
    if (this.environment.name === `prod`) {
      this.apiPathRoot = this.djangoApi.prod;
      this.nodeApiPathRoot = this.nodeApi.prod;
      this.envDomain = this.domains.prod;
    } else {
      this.apiPathRoot = this.djangoApi.stg;
      this.nodeApiPathRoot = this.nodeApi.stg;
      this.envDomain = this.domains.stg;
    }
  }
}
