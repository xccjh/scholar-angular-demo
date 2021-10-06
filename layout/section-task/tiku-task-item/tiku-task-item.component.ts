import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import * as TASK from 'core/base/task';

@Component({
  selector: 'app-tiku-task-item',
  templateUrl: './tiku-task-item.component.html',
  styleUrls: ['./tiku-task-item.component.less']
})
export class TikuTaskItemComponent implements OnInit {

  @Input() qcData: any = {
    taskType: ''
  };

  @Output() selectChange = new EventEmitter<any>();
  statusRemark = TASK.statusRemark;
  speakTypeRemark = TASK.speakTypeRemark;

  statusName = ['未完成', '已完成', '重做', '待自评'];
  statusName1 = ['未完成', '已完成', '未解锁任务'];
  taskTypeName = ['阅读', '案例', '作业', '实训', '考试', '实战' ];

  constructor(
  ) { }

  ngOnInit() {
  }

  // 获取两个日期相差几天
  getDaysDiffBetweenDates(endTime, taskFinish = '0') {
    if ( taskFinish === '1' ) {
      return '已结束';
    } else if (taskFinish === '0' ) {
      if (endTime) {
        const dateFinal: any = new Date();
        const dateInitial: any = new Date(endTime);
        const diffDate = ((dateInitial - dateFinal) / (1000 * 3600 * 24));
        if (diffDate >= 1) {
          return `剩余${Math.floor(diffDate)}天结束`;
        } else {
          const diffTime = (dateInitial - dateFinal) / 1000;
          const hour = Math.floor(diffTime / 3600);
          if (diffTime <= 0) {
            return '已结束';
          }
          if ( hour >= 1) {
            return `剩余${hour}小时结束`;
          } else {
            return `剩余${Math.floor(diffTime / 60)}分结束`;
          }
        }
      } else {
        return '正在进行';
      }
    }
  }

}
