import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Mixpanel, MixpanelPeople } from '@ionic-native/mixpanel/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { MaterialIconsModule } from 'ionic2-material-icons';

import { NteAppComponent } from './app.component';
import { agmConfig, ionicConfig, ionicStorageConfig } from './app.config';
import { AppRoutingModule } from '@nte/app/app-routing.module';
import { AuthGuard } from '@nte/app/guards/auth.guard';
import { ChatService } from '@nte/components/chat/chat.service';
import { ComponentsModule } from '@nte/components/components.module';
import { SettingsModule } from '@nte/components/settings/settings.module';
import { SurveyModule } from '@nte/components/survey/survey.module';
import { TaskNotesService } from '@nte/components/task-details/notes/task-notes.service';
import { TaskSurveyPageModule } from '@nte/components/task-details/survey/task-survey.module';
import { TaskDetailsModule } from '@nte/components/task-details/task-details.module';
import { CollegePageModule } from '@nte/pages/college/college.module';
import { CollegesListPageModule } from '@nte/pages/colleges-list/colleges-list.module';
import { CollegesPageModule } from '@nte/pages/colleges/colleges.module';
import { FilterCategoryPageModule } from '@nte/pages/filter-category/filter-category.module';
import { FilterChecklistPageModule } from '@nte/pages/filter-checklist/filter-checklist.module';
import { FilterDistancePageModule } from '@nte/pages/filter-distance/filter-distance.module';
import { FilterProgramPageModule } from '@nte/pages/filter-program/filter-program.module';
import { FilterRangePageModule } from '@nte/pages/filter-range/filter-range.module';
import { FilterPageModule } from '@nte/pages/filter/filter.module';
import { ForgotPasswordPageModule } from '@nte/pages/forgot-password/forgot-password.module';
import { LandingPageModule } from '@nte/pages/landing/landing.module';
import { ListTileCreatePageModule } from '@nte/pages/list-tile-create/list-tile-create.module';
import { LoginPageModule } from '@nte/pages/login/login.module';
import { MessagesPageModule } from '@nte/pages/messages/messages.module';
import { MessagingPageModule } from '@nte/pages/messaging/messaging.module';
import { NotificationsPageModule } from '@nte/pages/notifications/notifications.module';
import { ProfilePageModule } from '@nte/pages/profile/profile.module';
import { RegisterFormPageModule } from '@nte/pages/register-form/register-form.module';
import { RegisterSchoolPageModule } from '@nte/pages/register-school/register-school.module';
import { RegisterStudentsPageModule } from '@nte/pages/register-students/register-students.module';
import { RegisterYearPageModule } from '@nte/pages/register-year/register-year.module';
import { ScholarshipPageModule } from '@nte/pages/scholarship/scholarship.module';
import { ScholarshipsListPageModule } from '@nte/pages/scholarships-list/scholarships-list.module';
import { ScholarshipsPageModule } from '@nte/pages/scholarships/scholarships.module';
import { TabsPageModule } from '@nte/pages/tabs/tabs.module';
import { TaskPageModule } from '@nte/pages/task/task.module';
import { TasksListPageModule } from '@nte/pages/tasks-list/tasks-list.module';
import { TasksPageModule } from '@nte/pages/tasks/tasks.module';
import { PipesModule } from '@nte/pipes/pipes.module';
import { NodeApiService } from '@nte/services/api-node.service';
import { ApiTokenService } from '@nte/services/api-token.service';
import { ApiService } from '@nte/services/api.service';
import { AppStateService } from '@nte/services/app-state.service';
import { AuthService } from '@nte/services/auth.service';
import { CategoryService } from '@nte/services/category.service';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegeService } from '@nte/services/college.service';
import { CollegesService } from '@nte/services/colleges.service';
import { ConnectionService } from '@nte/services/connection.service';
import { DatetimeService } from '@nte/services/datetime.service';
import { DeepLinksService } from '@nte/services/deep-links.service';
import { EnvironmentService } from '@nte/services/environment.service';
import { FileService } from '@nte/services/file.service';
import { FilterService } from '@nte/services/filter.service';
import { HighSchoolService } from '@nte/services/high-school.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { LinkService } from '@nte/services/link.service';
import { ListTileService } from '@nte/services/list-tile.service';
import { ListService } from '@nte/services/list.service';
import { LocationService } from '@nte/services/location.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NavStateService } from '@nte/services/nav-state.service';
import { NotificationService } from '@nte/services/notification.service';
import { ParamService } from '@nte/services/param.service';
import { PrevRouteService } from '@nte/services/prev-route.service';
import { PromptService } from '@nte/services/prompt.service';
import { PushNotificationService } from '@nte/services/push-notification.service';
import { RecommendationsService } from '@nte/services/recommendations.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { SettingsService } from '@nte/services/settings.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { StatusItemService } from '@nte/services/status-item.service';
import { StorageService } from '@nte/services/storage.service';
import { StudentService } from '@nte/services/student.service';
import { SurveyIpService } from '@nte/services/survey-ip.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';
import { ToastService } from '@nte/services/toast.service';
import { UrlService } from '@nte/services/url.service';

import { environment } from '../environments/environment';

@NgModule({
  bootstrap: [NteAppComponent],
  declarations: [NteAppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AgmCoreModule.forRoot(agmConfig),
    IonicModule.forRoot(ionicConfig),
    IonicStorageModule.forRoot(ionicStorageConfig),
    MaterialIconsModule,
    AppRoutingModule,
    ComponentsModule,
    PipesModule,

    CollegePageModule,
    CollegesListPageModule,
    CollegesPageModule,

    FilterChecklistPageModule,
    FilterDistancePageModule,
    FilterRangePageModule,
    FilterProgramPageModule,
    FilterCategoryPageModule,
    FilterPageModule,
    ListTileCreatePageModule,

    LandingPageModule,

    LoginPageModule,
    ForgotPasswordPageModule,

    MessagesPageModule,
    MessagingPageModule,

    NotificationsPageModule,

    ProfilePageModule,

    RegisterFormPageModule,
    RegisterSchoolPageModule,
    RegisterStudentsPageModule,
    RegisterYearPageModule,

    ScholarshipPageModule,
    ScholarshipsPageModule,
    ScholarshipsListPageModule,
    SettingsModule,
    SurveyModule,

    TabsPageModule,

    TaskSurveyPageModule,
    TaskDetailsModule,
    TaskPageModule,
    TasksListPageModule,
    TasksPageModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    CallNumber,
    Deeplinks,
    // Device,
    // Diagnostic,
    EmailComposer,
    // FCMNG,
    File,
    Geolocation,
    // Keyboard,
    LocationAccuracy,
    Mixpanel,
    MixpanelPeople,
    NativeStorage,
    // SplashScreen,
    // StatusBar,
    // ThemeableBrowser,
    // InfiniteScroll,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // ---------------------
    ApiTokenService,
    ApiService,
    AppStateService,
    NodeApiService,
    AuthGuard,
    ListService,
    AuthService,
    CategoryService,
    ChatService,
    CollegeListTileService,
    CollegeService,
    CollegesService,
    CollegeService,
    ConnectionService,
    DatetimeService,
    DeepLinksService,
    EnvironmentService,
    FileService,
    FilterService,
    HighSchoolService,
    KeyboardService,
    LinkService,
    ListTileService,
    LocationService,
    MessageService,
    MixpanelService,
    NavStateService,
    NotificationService,
    ParamService,
    PrevRouteService,
    PromptService,
    PushNotificationService,
    RecommendationsService,
    ScholarshipListTileService,
    ScholarshipService,
    SettingsService,
    StakeholderService,
    StatusItemService,
    StorageService,
    StudentService,
    SurveyIpService,
    SurveyService,
    TaskService,
    TaskNotesService,
    ToastService,
    UrlService
  ]
})
export class AppModule { }
