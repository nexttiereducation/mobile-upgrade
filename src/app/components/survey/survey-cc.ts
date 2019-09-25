import { Component, Input, ViewChild } from '@angular/core';
import { Events, IonSlides } from '@ionic/angular';
import { cloneDeep, pickBy } from 'lodash';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { careerClusters } from '@nte/constants/careers.constants';
import { TaskTracker } from '@nte/models/task-tracker.model';
import { StakeholderService } from '@nte/services/stakeholder.service';
import { SurveyService } from '@nte/services/survey.service';

@Component({
  selector: `survey-cc`,
  templateUrl: `survey-cc.html`,
  styleUrls: [`survey-cc.scss`]
})
export class SurveyCcComponent {
  @ViewChild(`ccSlider`, { static: false }) public ccSlider: IonSlides;

  @Input() taskTracker: TaskTracker;

  public answers: any = {
    subjects: []
  };
  public careerClusters = careerClusters;
  public clusterItemsSelected: any[];
  public isLoaded: boolean = false;
  public isNoAnswers: boolean = false;
  public isSubjectsFinished: boolean = false;
  public isSurveyComplete: boolean = false;
  public progress: number = 0;
  public questions: any = {
    subjects: []
  };
  public showSubjectLengthError: boolean = false;
  public sliderOptions: any = {};
  public studentAnswers: any = {
    page: 0
  };
  public suggestedClusters: any;

  private ngUnsubscribe: Subject<any> = new Subject();

  get areSubjectsSelected() {
    return this.questions.subjects.filter((s) => s.selected).length > 0;
  }

  constructor(public stakeholderService: StakeholderService,
    public surveyService: SurveyService,
    public events: Events) {
    this.setupSurvey();
  }

  public saveItems(clusterCode: string, itemType: string, isFinalPage: boolean = false, goBack: boolean = false) {
    const cluster = this.answers[clusterCode];
    const clusterSelectedItems = pickBy(cluster[itemType], (isSelected, _item) => {
      return (isSelected === true);
    });
    let clusterItemAnswers = [];
    if (Object.keys(clusterSelectedItems).length > 0) {
      clusterItemAnswers = clusterSelectedItems.map((_isSelected, item) => {
        return {
          name: item,
          selected: true
        };
      });
    }
    this.studentAnswers.clusters[cluster.cluster_index][itemType] = clusterItemAnswers;
    this.saveSurvey(isFinalPage, goBack);
  }

  public saveSubjects() {
    this.showSubjectLengthError = false;
    if (!this.areSubjectsSelected) {
      this.showSubjectLengthError = true;
      this.isSubjectsFinished = false;
    } else {
      this.saveSurvey(false);
    }
  }

  public saveSurvey(isFinalPage: boolean = false, goBack: boolean = false) {
    if (isFinalPage) {
      this.isNoAnswers = true;
      this.studentAnswers.clusters.forEach((item) => {
        if (item.activities.length > 0 || item.personal_qualities.length > 0) {
          this.isNoAnswers = false;
        }
      });
    }
    if (this.isNoAnswers) {
      return;
    }
    this.ccSlider.getActiveIndex()
      .then(idx => this.studentAnswers.page = idx);
    if (this.ccSlider) {
      if (goBack) {
        this.ccSlider.slidePrev();
      } else {
        this.ccSlider.slideNext();
      }
    }
    this.surveyService.saveSurveyData(
      this.taskTracker.task.id,
      {
        answers: this.studentAnswers,
        survey_is_complete: isFinalPage
      }
    )
      .pipe(
        map(response => {
          if (isFinalPage) {
            return response;
          } else {
            return null;
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        (data: any) => {
          this.surveyService.currentSurvey.answers = this.studentAnswers;
          if (isFinalPage) {
            this.suggestedClusters = data.results;
            this.isSurveyComplete = true;
            this.taskTracker.updatedStatus();
            this.events.publish(`taskChange`, { taskTracker: this.taskTracker });
          }
        }
      );
  }

  private getClusterAnswerValues(itemType: string, questions: any, answers: any) {
    const clusterAnswerValues = {};
    if (questions && questions[itemType] && questions[itemType].length) {
      questions[itemType].forEach(item => {
        let isSelected = false;
        if (answers && answers[itemType] && answers[itemType].length) {
          const itemIndex = answers[itemType].findIndex([`name`, item]);
          isSelected = itemIndex > -1;
        } else {
          isSelected = false;
        }
        clusterAnswerValues[item] = isSelected;
      });
    }
    return clusterAnswerValues;
  }

  private setupSurvey() {
    const survey = this.surveyService.currentSurvey;
    if (survey.results.length > 0) {
      this.isSurveyComplete = true;
      this.suggestedClusters = survey.results;
      this.isLoaded = true;
      return;
    } else if (Object.keys(survey.answers).length === 0) {
      this.studentAnswers = cloneDeep(survey.questions);
      survey.answers.clusters = [];
      this.studentAnswers.clusters.forEach(cluster => {
        cluster.personal_qualities = [];
        cluster.activities = [];
      });
    } else {
      this.studentAnswers = Object.assign(this.studentAnswers, survey.answers);
    }
    this.questions.clusters = survey.questions.clusters;
    this.questions.subjects = survey.questions.subjects;
    this.studentAnswers.subjects = Object.assign(survey.questions.subjects, this.studentAnswers.subjects);
    this.studentAnswers.page = survey.answers.page || 0;
    this.questions.clusters.forEach((clusterQs: any, i: number) => {
      const clusterAs = survey.answers.clusters[i];
      this.answers[clusterQs.cluster_code] = {
        activities: this.getClusterAnswerValues(`activities`, clusterQs, clusterAs),
        cluster_index: i,
        personal_qualities: this.getClusterAnswerValues(`personal_qualities`, clusterQs, clusterAs)
      };
    });
    this.isLoaded = true;
  }

}
