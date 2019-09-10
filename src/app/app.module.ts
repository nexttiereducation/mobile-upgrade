import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CallNumber } from '@ionic-native/call-number';
import { Deeplinks } from '@ionic-native/deeplinks';
import { Device } from '@ionic-native/device';
import { Diagnostic } from '@ionic-native/diagnostic';
import { EmailComposer } from '@ionic-native/email-composer';
import { File } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps } from '@ionic-native/google-maps';
import { Keyboard } from '@ionic-native/keyboard';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Mixpanel, MixpanelPeople } from '@ionic-native/mixpanel';
import { NativeStorage } from '@ionic-native/native-storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ThemeableBrowser } from '@ionic-native/themeable-browser';
import { Config, Content, InfiniteScroll, IonicApp, IonicErrorHandler, IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { FCMNG } from 'fcm-ng';
import { MaterialIconsModule } from 'ionic2-material-icons';
import { NvD3Module } from 'ngx-nvd3';

import { NteAppComponent } from './app.component';
import { ionicConfig, ionicStorageConfig } from './app.config';
import { CustomTransition } from './app.transition';
import { ComponentsModule } from '@nte/components/components.module';
import { FilterCategoryPageModule } from '@nte/pages/category/category.module';
import { CollegeAcademicPageModule } from '@nte/pages/college-academic/college-academic.module';
import { CollegeApplicationPageModule } from '@nte/pages/college-application/college-application.module';
import { CollegeCampusPageModule } from '@nte/pages/college-campus/college-campus.module';
import { CollegeFinancialPageModule } from '@nte/pages/college-financial/college-financial.module';
import { CollegeGeneralPageModule } from '@nte/pages/college-general/college-general.module';
import { CollegePageModule } from '@nte/pages/college/college.module';
import { CollegesListPageModule } from '@nte/pages/colleges-list/colleges-list.module';
import { CollegesPageModule } from '@nte/pages/colleges/colleges.module';
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
import { TaskAttachmentsPageModule } from '@nte/pages/task-attachments/task-attachments.module';
import { TaskSurveyPageModule } from '@nte/pages/task-survey/task-survey.module';
import { TaskPageModule } from '@nte/pages/task/task.module';
import { TasksListPageModule } from '@nte/pages/tasks-list/tasks-list.module';
import { TasksPageModule } from '@nte/pages/tasks/tasks.module';
import { PipesModule } from '@nte/pipes/pipes.module';
import { NodeApiService } from '@nte/services/api-node.service';
import { ApiTokenService } from '@nte/services/api-token.service';
import { ApiService } from '@nte/services/api.service';
import { AuthService } from '@nte/services/auth.service';
import { CategoryService } from '@nte/services/category.service';
import { CollegeListTileService } from '@nte/services/college.list-tile.service';
import { CollegeService } from '@nte/services/college.service';
import { ConnectionService } from '@nte/services/connection.service';
import { DatetimeService } from '@nte/services/datetime.service';
import { DeepLinksService } from '@nte/services/deep-links.service';
import { EnvironmentService } from '@nte/services/environment.service';
import { FileService } from '@nte/services/file.service';
import { FilterService } from '@nte/services/filter.service';
import { HighSchoolService } from '@nte/services/high-school.service';
import { KeyboardService } from '@nte/services/keyboard.service';
import { LinkService } from '@nte/services/link.service';
import { ListService } from '@nte/services/list.service';
import { LocationService } from '@nte/services/location.service';
import { MessageService } from '@nte/services/message.service';
import { MixpanelService } from '@nte/services/mixpanel.service';
import { NotificationService } from '@nte/services/notification.service';
import { PromptService } from '@nte/services/prompt.service';
import { PushNotificationService } from '@nte/services/push-notification.service';
import { RecommendationsService } from '@nte/services/recommendations.service';
import { ScholarshipListTileService } from '@nte/services/scholarship.list-tile.service';
import { ScholarshipService } from '@nte/services/scholarship.service';
import { SettingsService } from '@nte/services/settings.service';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { StatusItemService } from '@nte/services/status-item.service';
import { StudentService } from '@nte/services/student.service';
import { SurveyIpService } from '@nte/services/survey-ip.service';
import { SurveyService } from '@nte/services/survey.service';
import { TaskService } from '@nte/services/task.service';
import { UrlService } from '@nte/services/url.service';

@NgModule({
  bootstrap: [IonicApp],
  declarations: [NteAppComponent],
  entryComponents: [NteAppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(NteAppComponent, ionicConfig),
    IonicStorageModule.forRoot(ionicStorageConfig),
    NvD3Module,
    MaterialIconsModule,
    // ---------------------
    ComponentsModule,
    PipesModule,

    CollegeAcademicPageModule,
    CollegeApplicationPageModule,
    CollegeCampusPageModule,
    CollegeFinancialPageModule,
    CollegeGeneralPageModule,

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

    ScholarshipsPageModule,
    ScholarshipsListPageModule,
    ScholarshipPageModule,

    TabsPageModule,

    TaskAttachmentsPageModule,
    TaskSurveyPageModule,
    TaskPageModule,
    TasksListPageModule,
    TasksPageModule
  ],
  services: [
    CallNumber,
    Deeplinks,
    Device,
    Diagnostic,
    EmailComposer,
    FCMNG,
    File,
    Geolocation,
    GoogleMaps,
    Keyboard,
    LocationAccuracy,
    Mixpanel,
    MixpanelPeople,
    NativeStorage,
    SplashScreen,
    StatusBar,
    ThemeableBrowser,
    IonicApp,
    Content,
    InfiniteScroll,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    // ---------------------
    ApiService,
    NodeApiService,
    ApiTokenService,
    ListService,
    AuthService,
    CategoryService,
    CollegeListTileService,
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
    LocationService,
    MessageService,
    MixpanelService,
    NotificationService,
    PromptService,
    PushNotificationService,
    RecommendationsService,
    ScholarshipListTileService,
    ScholarshipService,
    SettingsService,
    StakeholderService,
    StatusItemService,
    StudentService,
    SurveyIpService,
    SurveyService,
    TaskService,
    UrlService
  ]
})
export class AppModule {
  constructor(public config: Config) {
    this.config.setTransition(`nexttier-transition`, CustomTransition);
  }
}
