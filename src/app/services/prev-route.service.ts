import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PrevRouteService {
  private _url: BehaviorSubject<string> = new BehaviorSubject('');

  get url(): string {
    return this._url.getValue();
  }

  set url(prevUrl: string) {
    this._url.next(prevUrl);
  }

  constructor(private route: ActivatedRoute,
    private router: Router) { }

}
