import {Component, Input, OnInit} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToolsUtil} from 'core/utils/tools.util';
import {Json} from 'core/base/common';
import {environment} from 'src/environments/environment';
import {LevelItem, SubModule} from '../other-setting.interface';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';
import {STATISTICALRULES} from 'core/base/static-data';
import {LocalStorageUtil} from 'core/utils/localstorage.util';


@Component({
  selector: 'app-new-level',
  templateUrl: './new-level.component.html',
  styleUrls: ['./new-level.component.less'],
})
export class NewLevelComponent implements OnInit {
  @Input() courseId: string;
  @Input() coursePacketId: string;
  @Input() moduleArr: SubModule[] = [];
  @Input() levelLists: LevelItem[] = [];
  @Input() levelItem: Partial<LevelItem> = {};
  newLevelForm: FormGroup;
  newLevelLoading = false;
  paperArr: Json[] = [];
  totalTestPaperScore = 0;
  private paperIdToName: Json = {};
  private examIdToPaperUUId: Json = {};


  constructor(
    private nzMesService: NzMessageService,
    private nzModalService: NzModalService,
    private nzModalRef: NzModalRef,
    private fb: FormBuilder,
    private statisticsLogService: StatisticsLogService,
    private courseManageService: CourseManageService,
  ) {
    this.newLevelForm = this.fb.group({
      newLevel: ['', [Validators.required]],
      testPaperName: [null, [Validators.required]],
      complianceConditions: [undefined, [Validators.required]]
    });
  }

  ngOnInit() {
    const {levelItem} = this;
    const levelId = SessionStorageUtil.getSubmodule();
    this.newLevelForm.patchValue({
      newLevel: levelItem.id ? Number(levelItem.quebankId) : levelId ? Number(levelId) : this.moduleArr[0]?.id
    });
    this.getPapers(false).then(flag => {
      if (flag) {
        const obj: { complianceConditions?: number, testPaperName?: number } = {};
        if (levelItem.id) {
          obj.complianceConditions = levelItem.passScore;
          obj.testPaperName = Number(levelItem.examId.split('-')[1]);
        } else {
          obj.testPaperName = this.paperArr[0] ? Number(this.paperArr[0].examId) : null;
        }
        this.newLevelForm.patchValue(obj);
      }
    });
  }

  disableIf(item) {
    return this.levelLists.map(e => e.examId.split('-')[0]).indexOf(item.paperUuid) > -1;
  }

  getPapers(change: boolean) {
    if (change) { // 记录缓存
      SessionStorageUtil.putSubmodule(this.newLevelForm.value.newLevel);
    }
    return new Promise((resolve => {
      ToolsUtil.postAjax(environment.questionBankApi + 'system/qkcPaper/examInfoByModuleId', {
        sublibraryModuleIdList: [this.newLevelForm.value.newLevel], pageNum: 1, pageSize: 10000
      }, {'Content-Type': 'application/json'}).subscribe(resultS => {
        try {
          const resP = JSON.parse(resultS);
          if (resP.code === 200) {
            this.paperArr = resP.data.rows;
            if (change) {
              const testPaperName = (this.paperArr[0] && this.paperArr[0].examId) ? Number(this.paperArr[0].examId) : undefined;
              this.newLevelForm.patchValue({
                testPaperName,
              });
              Object.keys(this.newLevelForm.controls).forEach(key => {
                this.newLevelForm.controls[key].markAsUntouched();
                this.newLevelForm.controls[key].markAsPristine();
                this.newLevelForm.controls[key].updateValueAndValidity();
              });
            }
            this.paperArr.forEach(itemPaper => {
              this.paperIdToName[itemPaper.examId] = itemPaper.examName;
              this.examIdToPaperUUId[itemPaper.examId] = itemPaper.paperUuid;
            });
            resolve(true);
          } else {
            resolve(false);
            this.paperArr = [];
            this.nzMesService.error(resP.message);
          }
        } catch (e) {
          this.paperArr = [];
          this.nzMesService.error('题库服务异常');
          resolve(false);
        }
      });
    }));
  }


  save() {
    for (const i in this.newLevelForm.controls) {
      if (this.newLevelForm.controls.hasOwnProperty(i)) {
        this.newLevelForm.controls[i].markAsDirty();
        this.newLevelForm.controls[i].updateValueAndValidity();
      }
    }
    if (this.newLevelForm.invalid) {
      return;
    }
    this.newLevelLoading = true;
    const examId = this.newLevelForm.value.testPaperName;
    const seq = this.levelItem?.seq;
    const content = {
      id: this.levelItem?.id,
      courseId: this.courseId,
      coursePacketId: this.coursePacketId,
      quebankId: this.newLevelForm.value.newLevel,
      name: this.paperIdToName[examId],
      examId: this.examIdToPaperUUId[examId] + '-' + this.newLevelForm.value.testPaperName,
      passScore: this.newLevelForm.value.complianceConditions,
      seq: seq ? seq : ToolsUtil.getMaxSeq(this.levelLists)
    };
    this.courseManageService.addCoursePacketCard(content).subscribe(res => {
      this.newLevelLoading = false;
      if (res.status === 201) {
        const edit = !!this.levelItem.id;
        const field = edit ? 'modify' : 'addCode';
        this.statisticsLogService.statisticsPacketInfoLog({
          name: edit ? '修改关卡试卷' : '新增关卡',
          actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'][field],
          content: JSON.stringify(content),
        });
        this.nzModalRef.close(true);
      }
    }, () => {
      this.newLevelLoading = false;
    });
  }

  cancel() {
    this.nzModalRef.close(false);
  }

  testPaperNameChange(examId: string) {
    if (examId) {
      this.paperArr.every((paper) => {
        if (paper.examId === examId) {
          this.totalTestPaperScore = paper.score;
          if (this.totalTestPaperScore < this.newLevelForm.value.complianceConditions) {
            this.newLevelForm.patchValue({
              complianceConditions: this.totalTestPaperScore
            });
          }
        } else {
          return true;
        }
      });
    } else {
      this.totalTestPaperScore = 0;
      this.newLevelForm.patchValue({
        complianceConditions: this.totalTestPaperScore
      });
    }
  }
}

