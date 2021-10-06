import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter, OnDestroy, OnChanges, SimpleChange} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {AliOssService} from 'core/services/ali-oss.service';
import {TaskCenterService} from 'core/services/task-center.service';

@Component({
  selector: 'app-read-task',
  templateUrl: './read-task.component.html',
  styleUrls: ['./read-task.component.less'],
})
export class ReadTaskComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: any;
  @Input() id = '';
  @Output() finishTaskCallBack = new EventEmitter<any>();
  isShow = false;
  url: any;
  isLoading = false;
  timerHandler: any = null;
  readTime = 0;
  canRead = false;
  attachmentPath = '';
  constructor(
    private message: NzMessageService,
    private sanitizer: DomSanitizer,
    private taskCenterService: TaskCenterService,
    private notificationService: NzNotificationService,
    private aliOss: AliOssService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.id && this.id) {
      this.getUrl();
    }
  }

  getUrl() {
    this.isShow = false; // 阅读库 + 保利威
    this.attachmentPath = this.data.taskType === '0' ? this.data.attachmentPath : this.data.resourceUrl;
    const tmpUrl = environment.ow365 + environment.OSS_URL + this.attachmentPath;
    const baoliUrl = environment.ow365.indexOf('?') === -1 ?
      environment.ow365 + '?polywayId=' + this.attachmentPath :
      environment.ow365.slice(0, environment.ow365.indexOf('?')) + '?polywayId=' + this.attachmentPath;
    const url = this.data.sourceType === '2' ? baoliUrl : tmpUrl;
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.readTime = 0;
    if ( this.timerHandler ) {
      clearTimeout(this.timerHandler);
    }
    this.clearReadTimeOut();
    this.canRead = this.showReadTime(this.data);
    this.isShow = true;
  }

  // 判断能否开启重做
  ckeckCanRedo(endTime) {
    const nowTime = new Date().getTime();
    return  nowTime - endTime < 0;
  }

  showReadTime(data) {
    if ( data.taskType === '4' ) {
      return false;
    }
    if (data.taskFinish === '1') {  // 任务结束
      return data.status === '2' && this.ckeckCanRedo(data.endTime);
    } else {
      return data.status === '0';
    }
  }

  clearReadTimeOut() {
    this.timerHandler = setInterval(() => {
      this.readTime = this.readTime + 1;
      if (this.showReadTime(this.data) && this.readTime >= 30) {
        // this.finishReadTask();
        clearTimeout(this.timerHandler);
        this.readTime = 0;
      }
    }, 1000);
  }

  // 阅读任务完成
  finishReadTask() {
    this.isLoading = true;
    this.taskCenterService.startReadingTask(this.data.busId).subscribe(res => {
      this.isLoading = false;
      if (res.status === 201) {
        const modal = this.notificationService.success(
          '任务已完成', ''
        );
        this.data.status = '1';
        this.data.exp = this.data.totalExp;
        this.finishTaskCallBack.emit(this.data);
      } else {
        this.message.error(res.message);
      }
    });
  }

  ngOnDestroy() {
    if (this.timerHandler) {
      clearTimeout(this.timerHandler);
      this.readTime = 0;
    }
  }

  download() {
    const filename = this.data.taskType === '4' ? this.data.title : this.data?.taskName;
    this.aliOss.download({attachmentName: filename, ...this.data});
  }

}
