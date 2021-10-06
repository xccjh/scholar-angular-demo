import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MyClassService } from 'src/app/busi-services/my-class.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-recorded-info',
  templateUrl: './recorded-info.component.html',
  styleUrls: ['./recorded-info.component.less']
})
// tslint:disable-next-line:component-class-suffix
export class RecordedInfo implements OnInit {

  @Input() isVisible = true;
  @Input() timeList = [];

  @Output() closeNotice = new EventEmitter<any>();


  constructor(
      private myClassService: MyClassService,
    ) {

   }

  ngOnInit() {

  }

  selectItem() {
    this.closeNotice.emit();
  }


}
