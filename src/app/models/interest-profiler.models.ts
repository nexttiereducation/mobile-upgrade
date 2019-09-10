import { filter, map, sortBy } from 'lodash';

export class AnswerOption {
  public text: string;
  public value: string;
}

export class InterestProfiler {

  get answers() {
    return map(this.profiler.questions, (question) => {
      if (question.answer) { return question.answer.toString(); }
    });
  }

  get progress() {
    return (((filter(this.answers, (answer) => answer).length) / this.profiler.end) * 100);
  }
  public next: string;
  public previous: string;
  public profiler: {
    answer_options: AnswerOption[];
    end: number;
    questions: InterestQuestion[];
    start: number;
    total: number;
  };

  constructor(data: any) {
    this.next = data.next;
    this.previous = data.previous;
    this.profiler = {
      answer_options: data.questions.answer_options,
      end: +data.questions.end,
      questions: data.questions.question.map((question) => {
        question.index = +question.index;
        return question;
      }),
      start: +data.questions.start,
      total: +data.questions.total
    };
    this.profiler.questions = sortBy(this.profiler.questions, (question) => question.index);
  }

  public setExistingAnswers(answers: string[]) {
    answers.forEach((answer, index) => {
      if (this.profiler.questions[index]) {
        this.profiler.questions[index].answer = answer;
      }
    });
  }
}

export class InterestQuestion {
  public answer?: string;
  public area: string;
  public index: number;
  public text: string;
}

export class IResult {
  public area: string;
  public description: string;
  public score: string | number;
}

export class IResultResponse {
  public current_answers: string[];
  public onet_status: string;
  public result: {
    results: {
      end: string
      result: IResult[],
      start: string
    }
  };
}
