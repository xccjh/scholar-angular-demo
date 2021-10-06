import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {NzModalService, NzSafeAny, NzTreeSelectComponent} from 'ng-zorro-antd';
import {environment} from 'src/environments/environment';
import {ActivatedRoute} from '@angular/router';
import {ConfirmableDesc, ConfirmableFlat} from 'core/decorators';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {EditLessonComponent} from './edit-lesson/edit-lesson.component';
import {OtherSettingStoreService} from './other-setting.store.service';
import {CompanyItem, LevelItem} from '../other-setting/other-setting.interface';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {LoadingControl} from 'core/base/common';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-other-setting',
  templateUrl: './other-setting.component.html',
  styleUrls: ['./other-setting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OtherSettingStoreService]
})
export class OtherSettingComponent implements OnInit {
  readonly vm$ = this.otherSettingStoreService.vm$;
  readonly knowledgeNum$ = this.otherSettingStoreService.knowledgeNum$;
  readonly packetInfo$ = this.otherSettingStoreService.packetInfo$;
  ossUrl = environment.OSS_URL;
  userId = LocalStorageUtil.getUserId();
  status = SessionStorageUtil.getPacketInfoItem('isUsed') > 0;
  knoNumLimit = false;
  @ViewChild('treeSelect') treeSelect: NzTreeSelectComponent;
  @ViewChild('treeSelectInt') treeSelectInt: NzTreeSelectComponent;

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    public  otherSettingStoreService: OtherSettingStoreService
  ) {
  }

  ngOnInit(): void {
    this.otherSettingStoreService.dataInit();
  }

  @ConfirmableFlat({
    title: '删除',
    content: '确定删除该课次吗？',
    type: 'error'
  })
  delTable(id: string, loadingControl?: LoadingControl) {
    this.otherSettingStoreService.delTable({id, loadingControl});
  }

  @ConfirmableFlat({
    title: '删除关卡',
    content(args) {
      return this.status ? '删除该关卡将同步删除所有学员在此关卡上的所有闯关记录。' : '确定删除' + args[0].name + '关卡吗？';
    },
    type: 'error',
  })
  deleteLevel(data: LevelItem, loadingControl?: LoadingControl) {
    this.otherSettingStoreService.levelDeletion({id: data.id, loadingControl});
  }


  @ConfirmableFlat({
    title: '删除公司',
    content: (args) => ('确定删除' + args[0].name + '公司吗？'),
    type: 'error',
  })
  deleteCompany(data: CompanyItem, loadingControl?: LoadingControl) {
    this.otherSettingStoreService.companyDeletion({id: data.id, loadingControl});
  }

  editCompany(data: CompanyItem) {
    this.otherSettingStoreService.addCompanyEffect(data);
  }

  @ConfirmableFlat({
    title: '删除奖励',
    content: '确定删除该资源吗？',
    type: 'error'
  })
  deleteGift(id: string, loadingControl?: LoadingControl) {
    this.otherSettingStoreService.deleteGift({id, loadingControl});
  }

  @ConfirmableFlat({
    title: '删除子题库',
    content: '确定删除该子题库吗？',
    type: 'error'
  })
  dellistSublibraryItem(data: any, loadingControl?: LoadingControl) {
    this.otherSettingStoreService.dellistSublibraryItem({data, loadingControl});
  }

  formatProgress(percent) {
    return Math.trunc(percent) + '%';
  }

  /**
   * 生成课次
   */
  generateLessons() {
    this.otherSettingStoreService.generateLessonsEffect();
  }

  /**
   * 新增课次
   */
  newClass() {
    this.otherSettingStoreService.newClass();
  }

  /**
   *  编辑课次
   * @param data 当前课次
   */
  edit(data: any) {
    this.modalService.create<EditLessonComponent, NzSafeAny>({
      nzTitle: '编辑课次',
      nzContent: EditLessonComponent,
      nzComponentParams: {
        data,
      },
      nzMaskClosable: false,
      nzCancelText: '取消',
      nzOkText: '确定',
    }).afterClose
      .subscribe((flag: boolean) => {
        if (flag) {
          this.otherSettingStoreService.getLessonCountTable();
        }
      });
  }

  /**
   * 新增子题库
   * @param data 选中节点
   * @param type 考核专用/智适应专用
   */
  subQuestionBankChange(data: number[], type: 'subQuestionBank' | 'subQuestionBankInt') {
    const {treeSelect, treeSelectInt} = this;
    this.otherSettingStoreService.subQuestionBankChange({
      data,
      type,
      treeSelect: (type === 'subQuestionBank' ? treeSelect : treeSelectInt)
    });
  }

  /**
   * 新增奖励
   * @param data 当前关卡
   */
  rewardSettings(data) {
    this.otherSettingStoreService.rewardSettings(data);
  }

  /**
   * 新增关卡
   */
  addLevel() {
    this.otherSettingStoreService.addLevelEffect({});
  }

  editLevel(data: LevelItem) {
    this.otherSettingStoreService.addLevelEffect(data);
  }

  /**
   * 新增公司
   */
  addCompany() {
    this.otherSettingStoreService.addCompanyEffect({});
  }

  listDrop(event: CdkDragDrop<any, any>, label: 'subQuestionBank' | 'subQuestionBankInt') {
    this.otherSettingStoreService.listDrop({data: event, label});
  }


}
