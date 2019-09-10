import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

import { ApiTokenService } from '@nte/services/api-token.service';
import { ApiService } from '@nte/services/api.service';
import { UrlService } from '@nte/services/url.service';

@Injectable({ providedIn: 'root' })
export class NodeApiService extends ApiService {
  constructor(apiToken: ApiTokenService,
    http: Http,
    storage: Storage,
    url: UrlService) {
    super(apiToken, http, storage, url);
    this.tokenPrefix = ``;
    this.pathRoot = url.getNodePathRoot();
    this.setupHeaders();
  }
}
