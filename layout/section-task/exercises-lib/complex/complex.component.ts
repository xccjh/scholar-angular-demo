import { Component, OnInit, Input } from '@angular/core';
import { ComplexExercise } from '../model/exercise';

@Component({
  selector: 'app-complex',
  templateUrl: './complex.component.html',
  styleUrls: ['./complex.component.less']
})
export class ComplexComponent implements OnInit {

  @Input() exerciseData: ComplexExercise;

  constructor() { }

  ngOnInit() {

  }

}
