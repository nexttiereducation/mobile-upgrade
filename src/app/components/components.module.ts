import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MaterialIconsModule } from 'ionic2-material-icons';

import { AnimateItemSlidingDirective } from './animate-item-sliding/animate-item-sliding';
import { ApplicationDatesComponent } from './application-dates/application-dates';
import { CardListDirective } from './card-list/card-list';
import { EmptyStateComponent } from './empty-state/empty-state';
import { HighSchoolComponent } from './high-school/high-school';
import { ListTabsComponent } from './list-tabs/list-tabs';
import { LoadingComponent } from './loading/loading';
import { MessagingButtonComponent } from './messaging-button/messaging-button';
import { NotificationsButtonComponent } from './notifications-button/notifications-button';
import { PieChartComponent } from './pie-chart/pie-chart';
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { SendComponent } from './send/send';
import { TilesDirective } from './tiles/tiles';
import { PipesModule } from '@nte/pipes/pipes.module';

// import { NvD3Module } from 'ngx-nvd3';

const components: any[] = [
  AnimateItemSlidingDirective,
  ApplicationDatesComponent,
  CardListDirective,
  EmptyStateComponent,
  HighSchoolComponent,
  ListTabsComponent,
  LoadingComponent,
  MessagingButtonComponent,
  NotificationsButtonComponent,
  PieChartComponent,
  ProgressBarComponent,
  SendComponent,
  TilesDirective
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    IonicModule,
    CommonModule,
    // NvD3Module,
    MaterialIconsModule,
    PipesModule
  ]
})
export class ComponentsModule { }
