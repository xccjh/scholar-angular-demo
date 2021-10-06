import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChange, OnDestroy } from '@angular/core';
import { MyClassService } from 'src/app/busi-services/my-class.service';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {WebSocketService} from 'core/services/websocket.service';

@Component({
  selector: 'app-section-tab-bar',
  templateUrl: './section-tab-bar.component.html',
  styleUrls: ['./section-tab-bar.component.less']
})
export class SectionTabBarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() idx = 0;
  @Input() lessonTimeId = '';
  @Output() tabChange = new EventEmitter<number>();
  @Output() socketChange = new EventEmitter<number>();

  undo: any = {};
  socketSubscription: any;
  socketStudentSubscription: any;
  tabsCount = [0, 0, 0, 0]; // 对应课前，课中，课后，资料

  constructor(
    private myClassService: MyClassService,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.clearInterval();
  }

  ngOnChanges(chngs: { [key: string]: SimpleChange }) {
    if (chngs.lessonTimeId && this.lessonTimeId !== '') {
      this.getAllUnreadTask();
    }
  }


  getAllUnreadTask() {
    this.myClassService.getAllUnreadTask(this.lessonTimeId).subscribe(res => {
      if ( res.status === 200 ) {
        const data = res.data;
        this.tabsCount = [data.preSum || 0, data.midSum || 0, data.afterSum || 0, data.materialSum || 0];
        if (!this.socketSubscription) { // 开启socket监听
          this.regularRefresh();
        }
      }
    });
  }

  select(idx: number) {
    this.idx = idx;
    this.tabChange.emit(idx);
  }

  regularRefresh() {
    const success = (data) => {
      console.log('接受到服务器数据:' + data.body);
      const res = JSON.parse(data.body);
      if ( res.msgType !== '5' ) {
        this.socketChange.emit(res.taskForm);
      }
      const taskForm = parseInt(res.taskForm, 10);
      this.tabsCount[taskForm] += res.totalUnreadMsg;
    };

    // const url = `/topic/taskPre:${this.lessonTimeId}`;
    // this.webSocketService.addSubscribe(url, success).subscribe(socketStudentSubscription => {
    //   this.socketStudentSubscription = socketStudentSubscription;
    // });

    // 订阅学生推送
    const stuInfo = LocalStorageUtil.getUser();
    const studentListenPath = `/queue/taskPre:${stuInfo.id}:${this.lessonTimeId}`;
    this.socketStudentSubscription = this.webSocketService.addSubscribe(studentListenPath, success);
    this.webSocketService.addSubscribe(studentListenPath, success).subscribe(socketStudentSubscription => {
      this.socketStudentSubscription = socketStudentSubscription;
    });
  }

  clearInterval() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
      this.socketSubscription = null;
    }

    if (this.socketStudentSubscription) {
      this.socketStudentSubscription.unsubscribe();
      this.socketStudentSubscription = null;
    }
  }

}
