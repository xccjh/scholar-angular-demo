import { Component, OnInit, Input } from '@angular/core';
import { EntrySubjectExercise } from '../../model/exercise';

@Component({
  selector: 'app-base-entry-subject',
  templateUrl: './base-entry-subject.component.html',
  styleUrls: ['./base-entry-subject.component.less']
})
export class BaseEntrySubjectComponent implements OnInit {

  @Input() exerciseData: EntrySubjectExercise;

  /**
   * 答案模式，答案模式没有对错，也就是没有statusClass
   */
  @Input() answerModel = false;

  data: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  statusClass() {
    if (['finish', 'selfEvalute'].includes(this.exerciseData.status)) {
      if (this.answerModel) {
        return {
          'right-answer': true,
        };
      } else {
        return {
          'right-answer': this.exerciseData.isRight,
          'wrong-answer': !this.exerciseData.isRight
        };
      }
    } else {
      return { };
    }
  }

  changeRelation(isJie, subject: any): void {
    subject.jd = subject.jd === '-1' ? '1' : '-1';
  }

  del(idx: number): void {
    this.exerciseData.myAnswer = this.exerciseData.myAnswer.filter((val, index) => index !== idx);
  }

  add(jd: string): void {
    const opt: any = {
      answer: 0,
      subject: '',
      jd
    };

    this.exerciseData.myAnswer = [...this.exerciseData.myAnswer, opt];
  }

}
