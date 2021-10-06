import { Component, OnInit, Input, SimpleChange, OnChanges } from '@angular/core';
import { FillBlanksExercise } from '../model/exercise';

@Component({
  selector: 'app-fill-blanks',
  templateUrl: './fill-blanks.component.html',
  styleUrls: ['./fill-blanks.component.less']
})
export class FillBlanksComponent implements OnInit, OnChanges {

  @Input() exerciseData: FillBlanksExercise;
  @Input() isComplex: boolean;
  @Input() quesNum: number;

  content = '';

  constructor() { }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.exerciseData && this.exerciseData && this.exerciseData.content) {
      this.exerciseData.content = this.exerciseData.content.replace(/&amp;&amp;|&&/g, '___');
    }
  }

  ngOnInit() {
  }

}
