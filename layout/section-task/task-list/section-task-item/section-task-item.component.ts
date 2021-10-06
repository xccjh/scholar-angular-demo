import {Component, OnInit, Input, ViewChild, ElementRef, HostListener, Output, EventEmitter} from '@angular/core';
import * as TASK from 'core/base/task';
import {MyClassService} from 'src/app/busi-services/my-class.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';

@Component({
  selector: 'app-section-task-item',
  templateUrl: './section-task-item.component.html',
  styleUrls: ['./section-task-item.component.less']
})
export class SectionTaskItemComponent implements OnInit {

  @Input() qcData: any = {
    taskType: ''
  };
  @Input() selectedId: string;
  @ViewChild('taskBox') taskBox: ElementRef;
  @Output() selectChange = new EventEmitter<any>();
  statusRemark = TASK.statusRemark;
  urlParams: any = {};

  statusName = ['未完成', '已完成', '重做', '待自评', '已删除'];
  statusName1 = ['未完成', '已完成', '未解锁', '待自评'];
  taskTypeName = ['阅读', '案例', '作业', '实训', '考试', '实战', '问卷', '测评'];

  @HostListener('click')
  onClick() {
    if (this.qcData.unreadCount > 0) {
      this.clearUnreadMsg();
      return false;
    }
    this.selectChange.emit(this.qcData);
  }

  constructor(
    private myClassService: MyClassService
  ) {
  }

  ngOnInit() {
    this.urlParams = LocalStorageUtil.getBaseParams();
  }

  clearUnreadMsg() {
    this.myClassService.clearUnreadMsg({
      taskId: this.qcData.id
    }).subscribe(res => {
      this.qcData.unreadCount = 0;
      this.selectChange.emit(this.qcData);
    });
  }

  scrollToView() {
    const ele: HTMLDivElement = this.taskBox.nativeElement;
    ele.scrollIntoView({behavior: 'smooth'});
  }

  // 获取两个日期相差几天
  getDaysDiffBetweenDates(endTime, taskFinish = '0') {
    return '剩余xx天'
  }

}
