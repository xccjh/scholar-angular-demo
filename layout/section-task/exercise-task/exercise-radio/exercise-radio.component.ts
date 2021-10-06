import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Exercise } from '../../exercises-lib/model/exercise';

@Component({
  selector: 'app-exercise-radio',
  templateUrl: './exercise-radio.component.html',
  styleUrls: ['./exercise-radio.component.less']
})

export class ExerciseRadioComponent implements OnInit {

  @Input() qcData: Exercise[];
  @Output() qcSelectChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  raidoClass(exercise: Exercise) {
    if (exercise.status === 'init') {
      return {
        'radio-box-item-selected': exercise.isSelected,
        'radio-box-item-done': exercise.isDone,
        'radio-box-item-undone': !exercise.isDone
      };
    } else {
      if (exercise.mode === 'collection') {
        return {
          'radio-box-item-selected': exercise.isSelected,
        };
      } else {
        return {
          'radio-box-item-selected': exercise.isSelected,
          'radio-box-item-right': exercise.isRight && exercise.isEvalute,
          'radio-box-item-wrong': !exercise.isRight && exercise.isEvalute,
        };
      }
    }
  }

  selectRadio(item: Exercise, idx: number) {
    this.setItemSelect(item.exerciseId);
    this.qcSelectChange.emit(idx);
  }

  setItemSelect(quesId: string) {
    this.qcData.forEach((el) => {
      el.isSelected = (el.exerciseId === quesId);
    });
  }

}
