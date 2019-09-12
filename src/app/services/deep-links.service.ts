import { Injectable } from '@angular/core';
import { DeeplinkMatch, Deeplinks } from '@ionic-native/deeplinks/ngx';

import { CollegePage } from '@nte/pages/college/college';
import { CollegesPage } from '@nte/pages/colleges/colleges';
import { MessagesPage } from '@nte/pages/messages/messages';
import { MessagingPage } from '@nte/pages/messaging/messaging';
import { ProfilePage } from '@nte/pages/profile/profile';
import { ScholarshipPage } from '@nte/pages/scholarship/scholarship';
import { ScholarshipsPage } from '@nte/pages/scholarships/scholarships';
import { TaskPage } from '@nte/pages/task/task';
import { TasksPage } from '@nte/pages/tasks/tasks';

@Injectable({ providedIn: 'root' })
export class DeepLinksService {
  constructor(private deeplinks: Deeplinks) { }

  init() {
    this.deeplinks.route({
      '/colleges': CollegesPage,
      '/colleges/:id': CollegePage,
      '/messages': MessagingPage,
      '/messages/:id': MessagesPage,
      '/profile': ProfilePage,
      '/scholarships': ScholarshipsPage,
      '/scholarships/:id': ScholarshipPage,
      '/tasks': TasksPage,
      '/tasks/:id': TaskPage
    }).subscribe(
      (match: DeeplinkMatch) => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        console.log(`Successfully routed`, match);
      },
      (nomatch: any) => {
        console.warn(`Unmatched Route`, nomatch);
      }
    );
  }

}
