import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { ChoiceExercise, ExerciseKindEnum } from '../../model/exercise';
/**
 * 单选，多选，判断题
 */
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-checkbox',
  templateUrl: './qkc-checkbox.component.html',
  styleUrls: ['./qkc-checkbox.component.less']
})
export class QkcCheckboxComponent implements OnInit, OnChanges {

  @Input() exerciseData: ChoiceExercise;

  anwser: string[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.exerciseData && changes.exerciseData.currentValue) {
      this.transformAnswer();
    }
  }

  chooseAnswer(exeOpts: any) {
    this.populateAnswer(exeOpts);
    this.populateMyAnswer();
  }

  // 填充答案
  populateAnswer(exeOpts: any) {
    if (this.exerciseData.exerciseKind === ExerciseKindEnum.SingleChoice) {
        // 单选题
      if (this.anwser[0] === exeOpts.label) {
        this.anwser.shift();
      } else {
        this.anwser[0] = exeOpts.label;
      }
      this.exerciseData.myAnswer = this.anwser.filter(el => el !== '').join(',');

    } else if (['MultipleChoice', 'TwiceChoice', 'IndefiniteMultiple'].includes(this.exerciseData.exerciseKind))  {
      const idx = this.anwser.findIndex(el => el === exeOpts.label);
      if (idx === -1) {
        if (this.exerciseData.exerciseKind === ExerciseKindEnum.TwiceChoice) { // 双选题 选两个，其他随便
          if (this.anwser.length >= 2) {
            return;
          }
        }
        this.anwser.push(exeOpts.label);
      } else {
        this.anwser.splice(idx, 1);
      }

      this.exerciseData.myAnswer = this.anwser.filter(el => el !== '').join(',');
    } else if (this.exerciseData.exerciseKind === ExerciseKindEnum.JudgeChoice) {
      // 判断题
      this.exerciseData.myAnswer = exeOpts.id;
    }

  }

  // 填充答案
  populateMyAnswer() {
    if (this.exerciseData.exerciseKind === ExerciseKindEnum.JudgeChoice) {
      this.exerciseData.optionList.forEach(item => {
        item.isMyAnswer =  this.exerciseData.myAnswer === item.id;
      });
    } else {
      this.exerciseData.optionList.forEach(item => {
        item.isMyAnswer = this.anwser.includes(item.label);
      });
    }

  }

  transformAnswer() {
    if (['SingleChoice', 'MultipleChoice', 'TwiceChoice', 'IndefiniteMultiple'].includes(this.exerciseData.exerciseKind)) {
      const myAnswer = this.exerciseData.myAnswer.split(',');
      const answer = this.exerciseData.answer.split(',');
      this.exerciseData.optionList.forEach(item => {
        item.isMyAnswer = myAnswer.includes(item.label);
        if (['finish', 'selfEvalute'].includes(this.exerciseData.status)) {
          item.isRight = answer.includes(item.label);
        }
        this.anwser = myAnswer;
      });
    } else if (this.exerciseData.exerciseKind === ExerciseKindEnum.JudgeChoice) {
      this.exerciseData.optionList = [
        { label: 'A', content: '正确', id: 'A'},
        { label: 'B', content: '错误', id: 'B'}
      ];
      this.exerciseData.optionList.forEach(item => {
        item.isMyAnswer = item.id === this.exerciseData.myAnswer;
        if (['finish', 'selfEvalute'].includes(this.exerciseData.status)) {
          item.isRight = item.id === this.exerciseData.answer;
        }
      });
    }

    this.anwser = this.anwser.filter(anwser => anwser !== '');
  }

}
