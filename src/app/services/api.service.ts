import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { extend } from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { ApiTokenService } from '@nte/services/api-token.service';
import { StorageService } from '@nte/services/storage.service';
import { UrlService } from '@nte/services/url.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private _headers: BehaviorSubject<HttpHeaders> = new BehaviorSubject(
    new HttpHeaders()
      .set('Accept', `application/json`)
      .set('Content-Type', `application/json`)
  );
  private _pathRoot: BehaviorSubject<string> = new BehaviorSubject(null);
  private _tokenPrefix: BehaviorSubject<string> = new BehaviorSubject(null);

  set headers(headers: HttpHeaders) {
    this._headers.next(headers);
  }
  get headers(): HttpHeaders {
    return this._headers.getValue();
  }

  set pathRoot(root: string) {
    this._pathRoot.next(root);
  }
  get pathRoot() {
    return this._pathRoot.getValue();
  }

  get requestOptions() {
    return {
      headers: this.headers
    };
  }

  get storedToken() {
    return this.storage.getItem(`ls.token`).then(stored => stored.value);
  }

  set token(token: string) {
    this.apiToken.token = token;
  }
  get token() {
    if (!this.apiToken.token) {
      this.storedToken.then(token => {
        this.token = token;
        return token;
      });
    } else {
      return this.apiToken.token;
    }
  }

  set tokenPrefix(prefix: string) {
    this._tokenPrefix.next(prefix);
  }
  get tokenPrefix() {
    return this._tokenPrefix.getValue();
  }

  constructor(private apiToken: ApiTokenService,
    private http: HttpClient,
    private storage: StorageService,
    private url: UrlService) {
    this.tokenPrefix = `Token `;
    this.pathRoot = this.url.getPathRoot();
    this.setupHeaders();
  }

  public delete(path: string): Observable<any> {
    return this.http.delete(this.getUrl(path), this.requestOptions);
  }

  public get(path: string, isAbsoluteUrl?: boolean): Observable<any> {
    return this.http.get(this.getUrl(path, isAbsoluteUrl), this.requestOptions);
  }

  public getNoAcceptRequestHeader(path: string, isAbsoluteUrl?: boolean): Observable<any> {
    const requestOptions: any = {
      headers: new Headers({
        AUTHORIZATION: `${this.tokenPrefix}${this.storedToken}`,
        'Content-Type': `application/json`
      })
    };
    return this.http.get(this.getUrl(path, isAbsoluteUrl), requestOptions);
  }

  public getNoHeaders(path: string, isAbsoluteUrl?: boolean): Observable<any> {
    return this.http.get(this.getUrl(path, isAbsoluteUrl));
  }

  public getPaged<T>(path: string): Observable<T[]> {
    const subject = new Subject<T[]>();
    this.recursiveGet(this.getUrl(path), subject, Date.now());
    return subject.asObservable();
  }

  public options(path: string): Observable<any> {
    const reqOpts = extend(this.requestOptions, { method: `OPTIONS` });
    return this.http.request(this.getUrl(path), reqOpts);
  }

  public optionsNoAuth(path: string): Observable<any> {
    const reqOpts: any = { headers: this.requestOptions.headers };
    reqOpts.headers.delete(`AUTHORIZATION`);
    reqOpts.method = `OPTIONS`;
    return this.http.request(this.getUrl(path), reqOpts);
  }

  public patch(path: string, data?: any): Observable<any> {
    return this.http.patch(this.getUrl(path), JSON.stringify(data), this.requestOptions);
  }

  public patchFile(path: string, file: File) {
    const options: any = {
      headers: { AUTHORIZATION: `${this.tokenPrefix}${this.token}` }
    };
    const formFile = new FormData();
    formFile.append(`file`, file);
    formFile.append(`file_name`, file.name);
    return this.http.patch(this.getUrl(path), formFile, options);
  }

  public post(path: string, data: any): Observable<any> {
    return this.http.post(this.getUrl(path), JSON.stringify(data), this.requestOptions);
  }

  public postFile(path: string, file: File, author?: string, type?: string) {
    const options: any = {
      headers: { AUTHORIZATION: `${this.tokenPrefix}${this.token}` }
    };
    const formFile = new FormData();
    formFile.append(`file`, file);
    formFile.append(`file_name`, file.name);
    if (author) {
      formFile.append(`author`, author);
    }
    if (type) {
      formFile.append(`file_type`, type);
    }
    return this.http.post(this.getUrl(path), formFile, options);
  }

  public postWithoutAuthorization(path: string, data: any): Observable<any> {
    return this.http.post(
      this.getUrl(path),
      JSON.stringify(data),
      {
        headers: new HttpHeaders({
          Accept: `application/json`,
          'Content-Type': `application/json`
        })
      }
    );
  }

  public put(path: string, data: any): Observable<any> {
    return this.http.put(
      this.getUrl(path),
      JSON.stringify(data),
      this.requestOptions
    );
  }

  public setupHeaders(token?: string) {
    return new Promise(
      (resolve, reject) => {
        if (token) {
          this.setAuthHeader(`${this.tokenPrefix}${token}`);
          if (!this.token) {
            this.token = token;
          }
          resolve();
        } else if (this.storedToken) {
          return this.storedToken.then(
            val => {
              if (val && val.length) {
                this.setAuthHeader(`${this.tokenPrefix}${val}`);
              }
              resolve();
            },
            err => {
              console.error(err);
              reject();
            }
          );
        }
      }
    );

  }

  private getUrl(path: string, isAbsoluteUrl: boolean = false) {
    return isAbsoluteUrl ? path : this.pathRoot + path;
  }

  private recursiveGet(url: string, subject: Subject<any>, start: number): void {
    this.http.get(url, this.requestOptions)
      .subscribe((data: any) => {
        subject.next(data.results);
        if (data.next) {
          this.recursiveGet(data.next, subject, start);
        } else {
          subject.complete();
          subject.unsubscribe();
        }
      });
  }

  private setAuthHeader(authValue: string) {
    const authKey: string = `AUTHORIZATION`;
    if (this.headers.has(authKey)) {
      this.headers = this.headers.set(authKey, authValue);
    } else {
      this.headers = this.headers.append(authKey, authValue);
    }
  }
}
