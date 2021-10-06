import { Component, OnInit , Output, EventEmitter, Input} from '@angular/core';
import { TrainManageService } from 'src/app/busi-services/train-manage.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'qkc-change-train',
  templateUrl: './change-train.component.html',
  styleUrls: ['./change-train.component.less']
})
export class ChangeTrainComponent implements OnInit {

  professionArr = [];
  isLoading = false;
  @Input() select = '';
  @Output() professionChange = new EventEmitter<any>();

  constructor(
    private trainManageService: TrainManageService,
    private message: NzMessageService
    ) { }

  ngOnInit() {
    this.getProfessionList();
  }

  getProfessionList() {
    this.isLoading = true;
    const success = result => {
      this.isLoading = false;
      if (result.status === 200) {
        this.professionArr = result.data;
        if (Array.isArray(this.professionArr) && this.professionArr.length > 0) {
          let curItem = (this.select
          ? this.professionArr.find(it => it.id === this.select)
          : this.professionArr[0]) || this.professionArr[0];
          this.professionChange.emit(curItem);
        } else {
          this.message.error('暂无行业，请先建立行业');
        }
      }
    };
    const error = err => {
      this.isLoading = false;
    };
    this.trainManageService.listAllByOrgcode().subscribe(success, error);
  }

  changeProfession(item: any) {
    this.professionChange.emit(item);
  }

}
