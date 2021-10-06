import {Component, forwardRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  FormBuilder, FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ActivatedRoute} from '@angular/router';
import {MenuService} from 'core/services/menu.service';
import {NotifyService} from 'core/services/notify.service';
import {queryParam, ToolsUtil} from 'core/utils/tools.util';
import {environment} from 'src/environments/environment';
import {NzModalRef, NzModalService} from 'ng-zorro-antd';
import {KnowledgeManageService} from '@app/busi-services/knowledge-manag.service';
import {RoleMemberComponent} from '@app/shared/role-member/role-member.component';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoleMemberComponent),
      multi: true
    },
    KnowledgeManageService
  ]
})
export class CourseDetailsComponent implements OnInit {
  fg: FormGroup;
  isLoading = false;
  previewPath = '';
  previewVisible = false;
  modalFormRef: NzModalRef;
  roleArr = [];
  roleArrRevert = [];
  roleArrBak = [];
  roleArrBakRevert = [];
  roleInitArr = [];
  nodes = [];
  nodesRevert = [];
  nodesBak = [];
  nodesBakRevert = [];
  nodesInit = [];
  courseStaff = false; // 课程组成员弹框
  aduitStaff = false;
  courseKey: any; // 课程组成员搜索
  aduitKey: any;
  isExerciseReviewLoading = false;
  courseStaffLoading = false;
  aduitStaffLoading = false;
  // private initCourseMemberUserForm = false;
  // private initExercisesAuditUserForm = false;
  initPage = false;
  listResult = [];
  @ViewChild('treeSelect') treeSelect;
  private lockList = false;
  private detailRecordEnd = false;
  private bakCheck: any = {};


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private courseMgService: CourseManageService,
    private nzMsg: NzMessageService,
    private menuService: MenuService,
    private notify: NotifyService,
    private modalService: NzModalService,
    private knowledgeManageService: KnowledgeManageService
  ) {
  }

  ngOnInit(): void {
    this.createForm();
    this.initPage = true;
    Promise.all([this.getRoleList(), this.getExerciseReview()]).then((data => {
      if (data[0] && data[1]) {
        this.route.paramMap.subscribe((params) => {
          this.getCourseDetail(params.get('courseId'));
        });
      }
    }));
  }

  getExerciseReview() {
    return new Promise((resolve) => {
      this.isExerciseReviewLoading = true;
      this.knowledgeManageService.getExerciseReview().subscribe(res => {
        this.isExerciseReviewLoading = false;
        if (res.status === 200) {
          this.nodes = res.data.filter(item => item.teacherList && item.teacherList.length > 0);
          this.nodesBak = JSON.parse(JSON.stringify(this.nodes));
          this.nodesInit = JSON.parse(JSON.stringify(this.nodes));
          this.nodesBak[0].expand = this.nodesInit[0].expand = true;
          resolve(true);
        } else {
          resolve(false);
        }
      }, () => {
        this.isExerciseReviewLoading = false;
        resolve(false);
      });
    });
  }


  createForm() {
    this.fg = this.fb.group({
      // courseAuditUserIdList: [[]],
      courseMemberUserIdList: [[], Validators.required],
      coverPath: [[], Validators.required],
      introduction: ['', [Validators.required, Validators.maxLength(200)]],
      id: [''],
      exercisesAuditUserIdList: [[]]
    });
  }

  getRoleList() {
    return new Promise((resolve) => {
      const param = {
        platformId: window['__platform__'],
        subCode: ToolsUtil.getOrgCode()
      };
      this.knowledgeManageService.getChargeList(param).subscribe(
        result => {
          if (result.status === 200) {
            this.roleArr = result.data;
            this.roleInitArr = JSON.parse(JSON.stringify(this.roleArr));
            this.roleArrBak = JSON.parse(JSON.stringify(this.roleArr));
            resolve(true);
          } else {
            resolve(false);
          }
        }, () => resolve(false)
      );
    });

  }

  formatPostData(data: any) {
    const deepObj = JSON.parse(JSON.stringify(data));
    deepObj.coverPath = deepObj.coverPath[0].path;
    delete deepObj.coverArr;
    // const list = [];
    // const telePhone = [];
    // const lists = this.treeSelect.getCheckedNodeList();
    // lists.forEach(node => {
    //   if (node.origin.children && node.origin.children.length) {
    //     node.origin.children.forEach(child => {
    //       list.push(child.key);
    //       telePhone.push(child.telphone);
    //     });
    //   } else {
    //     list.push(node.key);
    //     telePhone.push(node.origin.telphone);
    //   }
    // });
    // deepObj.exercisesAuditUserIdList = list;
    return deepObj;
  }


  getCourseDetail(id: string) {
    this.courseMgService.preview_course_new(id).subscribe((res) => {
      if (res.status !== 200) {
        return;
      }
      this.bakCheck = this.dataRecovery(res.data);
      this.fg.patchValue(JSON.parse(JSON.stringify(this.bakCheck)));
      const {courseMemberUserIdList, exercisesAuditUserIdList} = res.data;
      this.getSelect = courseMemberUserIdList;
      this.getAdustList = exercisesAuditUserIdList;
      this.detailRecordEnd = true;
      if (courseMemberUserIdList.length) {
        courseMemberUserIdList.forEach(itemU => {
          this.roleArrBak.every(nodeIp => {
            if (nodeIp.id === itemU) {
              nodeIp.isSelected = true;
            } else {
              return true;
            }
          });
        });
      }
      if (exercisesAuditUserIdList.length) {
        exercisesAuditUserIdList.forEach(item => {
          this.nodesBak.every(node => {
            node.teacherList.every(nodeI => {
              if (nodeI.id === item) {
                nodeI.isSelected = true;
              } else {
                return true;
              }
            });
          });
        });
      }
      this.initPage = false;
    });
  }

  dataRecovery(data) {
    const obj: any = {
      // courseAuditUserIdList: data.courseAuditUserIdList,
      courseMemberUserIdList: data.courseMemberUserIdList,
      exercisesAuditUserIdList: data.exercisesAuditUserIdList,
      introduction: data.courseDetail.introduction,
      id: data.id
    };
    if (data.courseDetail.coverPath) {
      const arr = data.courseDetail.coverPath.split('/');
      obj.coverPath = [{
        name: arr[arr.length - 1],
        title: arr[arr.length - 1],
        path: data.courseDetail.coverPath
      }];
    }
    return obj;
  }


  cancel() {
    this.menuService.goBack(false);
    this.menuService.gotoUrl({
      url: '/m/course-manage/course-list',
      paramUrl: '',
      title: '课程管理'
    });
  }

  save(checked = true, request = true) {
    return new Promise((resolve) => {
      if (checked) {
        Object.keys(this.fg.controls).forEach((key) => {
          this.fg.get(key).markAsDirty();
          this.fg.get(key).updateValueAndValidity();
        });
        if (this.fg.invalid) {
          this.nzMsg.warning('请按规则填写好课程信息！');
          resolve(false);
          return;
        }
        if (!request) {
          resolve(true);
        }
      }
      if (request) {
        this.realSave(resolve);
      }
    });
  }


  realSave(resolve) {
    const params = this.formatPostData(this.fg.value);
    if (params.exercisesAuditUserIdList.length) {
      this.lockList = false;
      ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/createAuditor?mobile=' +
        this.getAdustList.map(e => e.telphone).join(','))
        .subscribe(res => {
          try {
            const result = JSON.parse(res);
            if (result.code === 200) {
              this.courseMgService.save_curriculum_building(params).subscribe(resP => {
                if (resP.status === 201) {
                  this.bakCheck = JSON.parse(JSON.stringify(this.fg.value));
                  resolve(true);
                } else {
                  resolve(false);
                }
              }, () => {
                resolve(false);
              });
            } else {
              resolve(false);
              this.nzMsg.error(result.message);
            }
          } catch (e) {
            resolve(false);
            this.nzMsg.error(res);
          }
        });
    } else {
      this.courseMgService.save_curriculum_building(params).subscribe(res => {
        if (res.status === 201) {
          this.bakCheck = JSON.parse(JSON.stringify(this.fg.value));
          resolve(true);
        } else {
          resolve(false);
        }
      }, () => {
        resolve(false);
      });
    }
  }

  private convertData(data: any) {
    const list = [];
    if (data.length) {
      data.forEach(item => {
        const obj: any = {
          title: item.name,
          key: item.id
        };
        if (item.teacherList && item.teacherList.length) {
          obj.children = [];
          item.teacherList.forEach(teacher => {
            const childrenObj = {
              title: teacher.nickName,
              key: teacher.id,
              telphone: teacher.telphone,
              isLeaf: true
            };
            obj.children.push(childrenObj);
          });
        } else {
          obj.isLeaf = true;
        }
        list.push(obj);
      });
    }
    return list;
  }

  // 实时保存课程组成员
  // courseMemberUserIdListChange(data: any) {
  //   if (this.initCourseMemberUserForm) {
  //     const {id, courseMemberUserIdList} = this.fg.value;
  //     // if (data.length) {
  //     this.seeaiSubmit({
  //       courseMemberUserIdList,
  //       id
  //     });
  //     // }
  //   } else {
  //     this.initCourseMemberUserForm = true;
  //   }
  // }

  // 实时保存习题审核人员
  // exercisesAuditUserIdListChange(data: any) {
  //   if (this.initExercisesAuditUserForm) {
  //     const {id} = this.fg.value;
  //     const list = [];
  //     const telePhone = [];
  //     const lists = this.treeSelect.getCheckedNodeList();
  //     lists.forEach(node => {
  //       if (node.origin.children && node.origin.children.length) {
  //         node.origin.children.forEach(child => {
  //           list.push(child.key);
  //           telePhone.push(child.telphone);
  //         });
  //       } else {
  //         list.push(node.key);
  //         telePhone.push(node.origin.telphone);
  //       }
  //     });
  //     if (telePhone.length) {
  //       ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/createAuditor?mobile=' + telePhone.join(','))
  //         .subscribe(res => {
  //           try {
  //             const result = JSON.parse(res);
  //             if (result.code === 200) {
  //               this.seeaiSubmit({
  //                 exercisesAuditUserIdList: list,
  //                 id
  //               });
  //             } else {
  //               this.nzMsg.error(result.message);
  //             }
  //           } catch (e) {
  //             this.nzMsg.error(res);
  //           }
  //         });
  //     } else {
  //       this.seeaiSubmit({
  //         exercisesAuditUserIdList: [],
  //         id
  //       });
  //     }
  //   } else {
  //     this.initExercisesAuditUserForm = true;
  //   }
  // }
  // 实时保存课程封面
  // coverPathChange(data: any) {
  //
  // }


  get getSelect() {
    return this.roleArr.filter(e => e.isSelected);
  }

  set getSelect(data) {
    this.roleArr = JSON.parse(JSON.stringify(this.roleInitArr));
    data.forEach(e => {
      this.roleArr.every(item => {
        if (item.id === e) {
          item.isSelected = true;
        } else {
          return true;
        }
      });
    });
  }


  get getAdustList() {
    if (!this.lockList && this.nodes.length && this.detailRecordEnd) {
      this.lockList = true;
      this.listResult = [];
      const result = JSON.parse(JSON.stringify(this.nodes)).map(e => {
        e.teacherList = e.teacherList.filter(item => item.isSelected);
        return e;
      }).filter(itemP => itemP.teacherList && itemP.teacherList.length);
      if (result.length) {
        result.forEach(itemL => {
          this.listResult = this.listResult.concat(itemL.teacherList);
        });
      }
    }
    return this.listResult;
  }

  set getAdustList(data) {
    this.nodes = JSON.parse(JSON.stringify(this.nodesInit));
    data.forEach(e => {
      this.nodes.every(item => {
        return item.teacherList.every(itemInner => {
          if (e === itemInner.id) {
            itemInner.isSelected = true;
          } else {
            return true;
          }
        });
      });
    });
  }

  courseComfirm() {
    this.courseStaff = false;
  }

  auditComfirm() {
    this.aduitStaff = false;
  }

  courseSearch() {
    this.courseStaffLoading = true;
    const bak = JSON.parse(JSON.stringify(this.roleArr));
    if (this.courseKey) {
      if (this.courseKey === '匿名') {
        this.roleArrBak = bak.filter(e => !e.nickName);
      } else {
        this.roleArrBak = bak.filter(e => e.nickName.indexOf(this.courseKey) > -1);
      }
    } else {
      this.roleArrBak = bak;
    }
    this.getSelect.forEach(itemP => {
      this.roleArrBak.every(itemO => {
        if (itemO.id === itemP.id) {
          itemO.isSelected = true;
        } else {
          return true;
        }
      });
    });
    this.courseStaffLoading = false;
  }

  AduitSearch() {
    this.aduitStaffLoading = true;
    const bak = JSON.parse(JSON.stringify(this.nodesInit));
    if (this.aduitKey) {
      bak.forEach(e => {
        e.teacherList = JSON.parse(JSON.stringify(e.teacherList.filter(item => {
          if (this.aduitKey === '匿名') {
            return !item.nickName;
          } else {
            return item.nickName && item.nickName.indexOf(this.aduitKey) > -1;
          }
        })));
      });
      this.nodesBak = bak.filter(item => item.teacherList.length > 0);
    } else {
      this.nodesBak = bak;
    }
    this.lockList = false;
    this.getAdustList.forEach(itemOt => {
      this.nodesBak.every(itemR => {
        return itemR.teacherList.every(itemPi => {
          if (itemOt.id === itemPi.id) {
            itemPi.isSelected = true;
          } else {
            return true;
          }
        });
      });
    });
    this.aduitStaffLoading = false;
  }

  addMember() {
    this.roleArrRevert = JSON.parse(JSON.stringify(this.roleArr));
    this.roleArrBakRevert = JSON.parse(JSON.stringify(this.roleArrBak));
    this.courseStaff = true;
  }

  selectItem(item: any) {
    item.isSelected = false;
    this.fg.patchValue({courseMemberUserIdList: this.getSelect.map(e => e.id)});
    this.roleArrBak.every(itemx => {
      if (itemx.id === item.id) {
        itemx.isSelected = false;
      } else {
        return true;
      }
    });
  }

  itemSelectInner(item) {
      item.isSelected = !item.isSelected;
      this.roleArr.every(itemP => {
        if (item.id === itemP.id) {
          itemP.isSelected = item.isSelected;
          this.fg.patchValue({courseMemberUserIdList: this.getSelect.map(e => e.id)});
        } else {
          return true;
        }
      });
  }


  innnerAduitSelectDouble(option) {
    option.isSelected = false;
    this.lockList = false;
    this.fg.patchValue({exercisesAuditUserIdList: this.getAdustList.map(e => e.id)});
  }


  selectAduitItemInner(item) {
    item.isSelected = !item.isSelected;
    this.nodes.every(itemP => {
      return itemP.teacherList.every(innerItemP => {
        if (item.id === innerItemP.id) {
          innerItemP.isSelected = item.isSelected;
          this.lockList = false;
          this.fg.patchValue({exercisesAuditUserIdList: this.getAdustList.map(e => e.id)});
        } else {
          return true;
        }
      });
    });
  }

  selectAduitItem(item, i) {
    this.lockList = false;
    const bak = JSON.parse(JSON.stringify(this.getAdustList));
    bak[i].isSelected = false;
    this.nodesBak.every(itemO => {
      return itemO.teacherList.every(itemOp => {
        if (itemOp.id === item.id) {
          itemOp.isSelected = false;
        } else {
          return true;
        }
      });
    });
    const exercisesAuditUserIdList = bak.filter(itemi => itemi.isSelected).map(e => e.id);
    this.getAdustList = exercisesAuditUserIdList;
    this.fg.patchValue({
      exercisesAuditUserIdList,
    });
  }

  addAduitMember() {
    this.nodesRevert = JSON.parse(JSON.stringify(this.nodes));
    this.nodesBakRevert = JSON.parse(JSON.stringify(this.nodesBak));
    this.aduitStaff = true;
  }

  clickAduit(itemP, j) {
    itemP.expand = !itemP.expand;
    this.nodesInit[j].expand = !this.nodesInit[j].expand;
  }

  auditCancel() {
    this.aduitStaff = false;
    this.nodesBak = this.nodesBakRevert;
    this.nodes = this.nodesRevert;
    this.lockList = false;
  }

  courseCancel() {
    this.courseStaff = false;
    this.roleArr = this.roleArrRevert;
    this.roleArrBak = this.roleArrBakRevert;
  }

  compareArrayChange(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return true;
    }
    let flag = false;
    const flag1 = arr2.every(inner => {
      return arr1.indexOf(inner) > -1;
    });
    if (flag1) {
      flag = arr1.every(inner1 => {
        return arr2.indexOf(inner1) > -1;
      });
    }
    return !(flag1 && flag);
  }

  checkChange() {
    const {courseMemberUserIdList, introduction, exercisesAuditUserIdList} = this.fg.value;
    if (this.compareArrayChange(courseMemberUserIdList, this.bakCheck.courseMemberUserIdList)
      || this.checkCoverChange()
      || introduction !== this.bakCheck.introduction
      || this.compareArrayChange(exercisesAuditUserIdList, this.bakCheck.exercisesAuditUserIdList)) {
      return true;
    }
  }

  private checkCoverChange() {
    const {coverPath} = this.fg.value;
    if ((!coverPath.length && this.bakCheck.coverPath) || (coverPath.length && !this.bakCheck.coverPath)) {
      return true;
    }
    if (coverPath[0] && coverPath[0].path && this.bakCheck.coverPath) {
      return coverPath[0].path !== this.bakCheck.coverPath[0].path;
    }
  }
}
