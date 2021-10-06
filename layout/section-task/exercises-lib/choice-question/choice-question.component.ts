import { Component, OnInit, Input } from '@angular/core';
import { ChoiceExercise } from '../model/exercise';
/**
 * 单选 多选 判断
 */
@Component({
  selector: 'app-choice-question',
  templateUrl: './choice-question.component.html',
  styleUrls: ['./choice-question.component.less']
})
export class ChoiceQuestionComponent implements OnInit {

  @Input() exerciseData: ChoiceExercise;
  @Input() isComplex: boolean;
  @Input() quesNum: number;

  constructor() { }

  ngOnInit() {
  }


}
