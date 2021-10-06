import { Component, OnInit, Input } from '@angular/core';
import { SketchExercise } from '../model/exercise';

@Component({
  selector: 'app-sketch',
  templateUrl: './sketch.component.html',
  styleUrls: ['./sketch.component.less']
})
export class SketchComponent implements OnInit {
  @Input() exerciseData: SketchExercise;
  @Input() isComplex: boolean;
  @Input() quesNum: number;
  files = [];

  constructor() {}

  ngOnInit() {
  }

}
