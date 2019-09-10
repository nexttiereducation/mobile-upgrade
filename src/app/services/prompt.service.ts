import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';

import { ApiService } from '@nte/services/api.service';

@Injectable({ providedIn: 'root' })
export class PromptService {

  constructor(public apiService: ApiService) { }

  public submitNewPrompt(prompt: any) {
    return this.apiService.post(`/prompts/tasks/`, prompt);
  }

}
