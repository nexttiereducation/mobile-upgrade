import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiTokenService } from '@nte/services/api-token.service';
import { ApiService } from '@nte/services/api.service';
import { StorageService } from '@nte/services/storage.service';
import { UrlService } from '@nte/services/url.service';

@Injectable({ providedIn: 'root' })
export class NodeApiService extends ApiService {
  constructor(apiToken: ApiTokenService,
    http: HttpClient,
    storage: StorageService,
    url: UrlService) {
    super(apiToken, http, storage, url);
    this.tokenPrefix = ``;
    this.pathRoot = url.getNodePathRoot();
    this.setupHeaders();
  }
}
