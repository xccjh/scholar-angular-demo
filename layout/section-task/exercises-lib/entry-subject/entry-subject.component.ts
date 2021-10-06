import { Component, OnInit, Input } from '@angular/core';
import { EntrySubjectExercise } from '../model/exercise';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
/**
 * 分录题
 */
@Component({
  selector: 'app-entry-subject',
  templateUrl: './entry-subject.component.html',
  styleUrls: ['./entry-subject.component.less']
})
export class EntrySubjectComponent implements OnInit {

  @Input() exerciseData: EntrySubjectExercise;
  @Input() isComplex: boolean;
  @Input() quesNum: number;

  caterysTree = {};
  constructor() { }

  ngOnInit() {
    this.caterysTree = LocalStorageUtil.getCaterysTree() || {};
  }

  getCaterysName(key: string) {
    const item = this.caterysTree[key];
    if (item) {
      return item.category + '/' + item.fullName;
    } else {
      return '--';
    }
  }

}
