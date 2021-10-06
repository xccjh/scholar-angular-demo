import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import Gauge from 'core/dashboard/dashboard';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {TrainManageService} from '@app/busi-services';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'app-train-task',
  templateUrl: './train-task.component.html',
  styleUrls: ['./train-task.component.less']
})
export class TrainTaskComponent implements OnInit, OnChanges {
  @Input() data: any = {};

  today: Date = new Date();

  constructor(
    private notificationService: NzNotificationService,
    private trainManageService: TrainManageService,
    private nzMesService: NzMessageService,
  ) {
  }

  ngOnInit(): void {
    this.getDay();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initializeDashboard(0, 0);
  }

  initializeDashboard(value: number, total: number = 0) {
    const d = new Gauge({
      tick_color: '#6C7179', // 未达到的刻度颜色
      tick_on_color: '#00AB84', // // 已达到的刻度颜色
      center_font_size: 40, // 中心数值字体大小
      animation_duration: 1000, // 动画持续时间
      value, // 当前数值
      end_num: total, // 总数值
      container: 'container', // 容器
      center_bottom_text: '进度', // 数值底部文案
      center_text_color: '#6C7179', // 数值字体颜色
    });
  }

  goToTrain() {
    this.trainManageService.getAccountPeriodId(this.data.resourceId).subscribe(res => {
      if (res.status === 200) {
        const params = {
          id: this.data.resourceId,
          accountId: res.data.accountId,
        };
        const success = (resP: any) => {
          if (resP.status === 200) {
            if (resP.data) {
              window.open(resP.data, '_blank');
            }
          } else {
            this.notificationService.warning('实训任务开通失败，请联系管理员', '');
          }
        };
        const error = (err: any) => {
          this.notificationService.warning('实训任务开通失败，请联系管理员', '');
          // this.nzMesService.create('error', JSON.stringify(err));
        };
        this.trainManageService.getPracticalDetail(params).subscribe(success, error);
      }
    });
    // const {url} = this.data.trainStatistic;
    // if (url) {
    //   window.open(url, '_blank');
    // } else {
    //   this.notificationService.warning('实训任务开通失败，请联系管理员', '');
    // }
  }

  getDay() {
    if (this.today.getHours() < 14) {
      this.today = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);
    }
  }

}
