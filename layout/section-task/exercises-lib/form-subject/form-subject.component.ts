import { Component, OnInit, Input } from '@angular/core';
import { FormSubjectExercise } from '../model/exercise';

@Component({
  selector: 'app-form-subject',
  templateUrl: './form-subject.component.html',
  styleUrls: ['./form-subject.component.less']
})
export class FormSubjectComponent implements OnInit {

  @Input() exerciseData: FormSubjectExercise;
  @Input() isComplex: boolean;
  @Input() quesNum: number;

  constructor() { }

  ngOnInit() {
  }

}
