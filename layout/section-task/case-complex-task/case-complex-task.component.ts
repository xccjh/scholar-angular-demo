import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-case-complex-task',
  templateUrl: './case-complex-task.component.html',
  styleUrls: ['./case-complex-task.component.less']
})
export class CaseComplexTaskComponent implements OnInit {

  @Input() data: any;
  @Input() id: string;
  @Output() finishTaskCallBack = new EventEmitter<any>();

  tabIdx = 0;

  constructor() { }

  ngOnInit() {
  }

  finishTask() {
    this.finishTaskCallBack.emit(this.data);
  }

}
