import {Injectable} from '@angular/core';
import {ComponentStore, tapResponse} from '@ngrx/component-store';
import {combineLatest, EMPTY, of, partition} from 'rxjs';
import {merge, skipWhile, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {LoadingControl, PacketInfo} from 'core/base/common';
import {SessionStorageUtil} from 'core/utils/sessionstorage.util';
import {NzMessageService, NzModalService, NzSafeAny, NzTreeNode} from 'ng-zorro-antd';
import {
  CompanyItem, LevelItem,
  LoadObj,
  OtherSettingState,
  SubQuestionBankchangeItem
} from '@app/routes/course-manage/components/other-setting/other-setting.interface';
import {CourseManageService} from '@app/busi-services';
import {ToolsUtil} from 'core/utils/tools.util';
import {environment} from 'src/environments/environment';
import {ServicesModule} from '@app/service/service.module';
import {ConfirmableDesc} from 'core/decorators';
import {NewLevelComponent} from './new-level/new-level.component';
import {RewardSettingsComponent} from './reward-settings/reward-settings.component';
import {NewCompanyComponent} from './new-company/new-company.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {STATISTICALRULES} from 'core/base/static-data';
import {LocalStorageUtil} from 'core/utils/localstorage.util';
import {StatisticsLogService} from '@app/busi-services/statistics-log.service';


@Injectable({
  providedIn: ServicesModule
})
export class OtherSettingStoreService extends ComponentStore<OtherSettingState> {

  constructor(
    private courseManageService: CourseManageService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private statisticsLogService: StatisticsLogService
  ) {
    super({
      packetInfo: SessionStorageUtil.getPacketInfo(),
      isLoading: false,
      searchLoad: false,
      exam: [],
      intelligent: [],
      subQuestionBankCurrent: [],
      subQuestionBankCurrentPre: [],
      subQuestionBank: [],
      subQuestionBankInt: [],
      listSublibrary: [],
      subQuestionBankIntCurrent: [],
      subQuestionBankIntCurrentPre: [],
      moduleArr: [],
      levelLists: [],
      companyLists: [],
      listOfData: [],
      idMap: {},
      breakthroughMode: false,
      practiceOn: false,
      isBet: false,
      knowledgeNum: 0
    });
  }

  //#region read
  readonly packetInfo$ = this.select(({packetInfo}) => packetInfo);
  readonly listSublibrary$ = this.select(({listSublibrary}) => listSublibrary);
  readonly listOfData$ = this.select(({listOfData}) => listOfData);
  readonly moduleArr$ = this.select(({moduleArr}) => moduleArr);
  readonly levelLists$ = this.select(({levelLists}) => levelLists);
  readonly companyLists$ = this.select(({companyLists}) => companyLists);
  readonly knowledgeNum$ = this.select(({knowledgeNum}) => knowledgeNum);
  readonly idMap$ = this.select(({idMap}) => idMap);
  readonly subQuestionBankCurrentPre$ =
    this.select(({subQuestionBankCurrentPre}) => subQuestionBankCurrentPre);
  readonly subQuestionBank$ =
    this.select(({subQuestionBank}) => subQuestionBank);
  readonly subQuestionBankIntCurrentPre$ =
    this.select(({subQuestionBankIntCurrentPre}) => subQuestionBankIntCurrentPre);
  readonly subQuestionBankInt$ =
    this.select(({subQuestionBankInt}) => subQuestionBankInt);
  readonly vm$ = this.select(state => state, {debounce: true});
  //#endregion

  //#region update
  readonly setPacketInfo = this.updater((state, packetInfo: PacketInfo) => ({...state, packetInfo}));

  readonly setLoading = this.updater((state, loadObj: LoadObj) => ({
    ...state,
    loadObj,
  }));
  //#endregion


  //#region  effect
  /**
   * 获取闯关列表
   */
  readonly getLevel = this.effect((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      switchMap(([, packetInfo]) => {
        if (packetInfo.isCard === '1') {
          return this.courseManageService.levelList(packetInfo.id).pipe(
            tapResponse(res => {
              if (res.status === 200) {
                const levelLists = res.data.sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
                levelLists.forEach((item) => {
                  if (item.coursePacketCardRecourseList) {
                    item.coursePacketCardRecourseList =
                      item.coursePacketCardRecourseList.sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
                  }
                });
                this.patchState({levelLists});
              }
            }, () => EMPTY));
        } else {
          return of([]);
        }
      })
    );
  });

  /**
   * 获取公司列表
   */
  readonly getCompany = this.effect((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      switchMap(([, packetInfo]) => {
        if (packetInfo.is99Train === '1') {
          return this.courseManageService.getCompany(packetInfo.id).pipe(
            tapResponse(res => {
              if (res.status === 200) {
                this.patchState({companyLists: res.data});
              }
            }, () => EMPTY));
        } else {
          return of([]);
        }
      })
    );
  });

  readonly setBreakthroughMode = this.effect((data$) => {
    return data$.pipe(withLatestFrom(this.packetInfo$), tap(([, packetInfo]) => {
      this.patchState({
        breakthroughMode: packetInfo.isCard === '1' ? true : false
      });
    }));
  });


  readonly setPracticeOn = this.effect((data$) => {
    return data$.pipe(withLatestFrom(this.packetInfo$), tap(([, packetInfo]) => {
      this.patchState({
        practiceOn: packetInfo.is99Train === '1' ? true : false
      });
    }));
  });

  readonly setIsBet = this.effect((data$) => {
    return data$.pipe(withLatestFrom(this.packetInfo$), tap(([, packetInfo]) => {
      if (packetInfo.teacherType !== '22') {
        this.patchState({
          isBet: packetInfo.isBet === '1' ? true : false
        });
      }
    }));
  });


  /**
   * 获取子题库列表
   */
  readonly getSubLibrary = this.effect((data$) => {
    return data$.pipe(
      withLatestFrom(combineLatest([this.packetInfo$, this.listSublibrary$])),
      switchMap(([, [packetInfo]]) => {
        return this.courseManageService.getSubLibrary({
          coursePacketId: packetInfo.id,
          quebankType: 1
        }).pipe(tapResponse(res => {
          if (res.status === 200) {
            const listSublibraryBak = res.data.sort
            ((a, b) => Number(a.quebankId) > Number(b.quebankId) ? 1 : Number(a.quebankId) < Number(b.quebankId) ? -1 : 0);
            // tslint:disable-next-line:max-line-length
            const subQuestionBank = listSublibraryBak.filter(e => e.busType === '1').sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
            // tslint:disable-next-line:max-line-length
            const subQuestionBankInt = listSublibraryBak.filter(e => e.busType === '2').sort((a, b) => a.seq > b.seq ? 1 : a.seq < b.seq ? -1 : 0);
            const subQuestionBankCurrentPre = subQuestionBank.map((item) => String(item.quebankId));
            const subQuestionBankCurrent = JSON.parse(JSON.stringify(subQuestionBankCurrentPre));
            const subQuestionBankIntCurrentPre = subQuestionBankInt.map((item) => String(item.quebankId));
            const subQuestionBankIntCurrent = JSON.parse(JSON.stringify(subQuestionBankIntCurrentPre));
            this.patchState({
              subQuestionBankCurrentPre,
              subQuestionBankCurrent,
              subQuestionBankIntCurrentPre,
              subQuestionBankIntCurrent,
              listSublibrary: listSublibraryBak,
              subQuestionBank,
              subQuestionBankInt
            });
          }
        }, () => EMPTY));
      }));
  });

  /**
   * 获取课次列表
   */
  readonly getLessonCountTable = this.effect((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      skipWhile(([, packetInfo]) => {
        return packetInfo.teachType === '22';
      }),
      switchMap(([, packetInfo]) => {

          return this.courseManageService.getLessonPackageTable(packetInfo.id).pipe(
            tapResponse(res => {
              if (res.status === 200) {
                if (res.data && res.data.length) {
                  res.data.forEach((item, ii) => {
                    res.data[ii].index = ii + 1;
                  });
                  this.patchState({
                    listOfData: res.data,
                    packetInfo: {...packetInfo, lessonCount: res.data.length}
                  });
                } else {
                  this.patchState({listOfData: []});
                }
              }
            }, () => EMPTY));
        }
      ));
  });
  /**
   * 获取子题库模块树
   */
  readonly getSubQuestionBank = this.effect((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      tap(() => this.patchState({searchLoad: false})),
      switchMap(([, packetInfo]) => {
        return ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/courseCode', {
          courseCode: packetInfo.code,
          type: ''
        }).pipe(
          tapResponse(
            resultS => {
              this.patchState({searchLoad: false});
              const resP = JSON.parse(resultS);
              if (resP.code === 200) {
                if (resP.data && resP.data.length) {
                  const bak = JSON.parse(JSON.stringify(resP.data));
                  const moduleArr = JSON.parse(JSON.stringify(resP.data));
                  // 获取模块列表
                  let reduce = [];
                  moduleArr.forEach(itemX => {
                    reduce = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'EXAM').concat(reduce);
                  });
                  bak.forEach(itemX => {
                    itemX.sublibraryModuleList = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'PRACTICE');
                  });
                  const idMap = {};
                  resP.data.forEach(itemY => {
                    itemY.sublibraryModuleList.forEach(itemP => {
                      idMap[itemP.id] = itemP.type;
                    });
                  });
                  // tslint:disable-next-line:max-line-length
                  const intelligent = this.conversionNode(bak).sort((a, b) => a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0);
                  // tslint:disable-next-line:max-line-length
                  const exam = this.conversionNode(resP.data).sort((a, b) => a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : 0);
                  this.patchState({exam, intelligent, moduleArr: reduce, idMap});
                } else {
                  this.patchState({exam: [], intelligent: [], moduleArr: []});
                }
              } else {
                this.message.error(resP.message);
              }
            }, () => {
              this.patchState({searchLoad: false});
              this.message.error('题库服务异常');
            }
          )
        );
      }));
  });

  /**
   * 删除子题库
   */
  readonly dellistSublibraryItem = this.effect<any>((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      skipWhile(([, packetInfo]) => +packetInfo.isUsed > 0),
      switchMap(([data]) => {
        data.loadingControl.loading = true;
        return this.courseManageService.delSubLibrary({
          id: data.data.id
        }).pipe(tapResponse(res => {
          data.loadingControl.loading = false;
          if (res.status === 204) {
            this.getSubLibrary();
          }
        }, () => data.loadingControl.loading = false));
      })
    );
  });
  /**
   * 删除奖励
   */
  readonly deleteGift = this.effect<{ id: string, loadingControl?: LoadingControl }>((param$) => {
    return param$.pipe(switchMap(param => {
      param.loadingControl.loading = true;
      return this.courseManageService.levelDataDeletion(param.id).pipe(
        tapResponse(res => {
          param.loadingControl.loading = false;
          if (res.status === 204) {
            this.statisticsLogService.statisticsPacketInfoLog({
              name: '删除奖励',
              actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].modify,
              content: param.id
            });
            this.getLevel();
          }
        }, () => param.loadingControl.loading = false)
      );
    }));
  });
  /**
   * 删除关卡
   */
  readonly levelDeletion = this.effect<{ id: string, loadingControl?: LoadingControl }>((param$) => {
    return param$.pipe(switchMap(param => {
      param.loadingControl.loading = true;
      return this.courseManageService.levelDeletion(param.id).pipe(
        tapResponse(res => {
          param.loadingControl.loading = false;
          if (res.status === 204) {
            this.getLevel();
            this.statisticsLogService.statisticsPacketInfoLog({
              name: '删除关卡',
              actionCode: STATISTICALRULES.packetInfo['otherSet-levelthrough-action'].delCode,
              content: param.id
            });
          }
        }, () => param.loadingControl.loading = false)
      );
    }));
  });


  /**
   * 删除公司
   */
  readonly companyDeletion = this.effect<{ id: string, loadingControl?: LoadingControl }>((param$) => {
    return param$.pipe(switchMap(param => {
      param.loadingControl.loading = true;
      return this.courseManageService.companyDeletion(param.id).pipe(
        tapResponse(res => {
          param.loadingControl.loading = false;
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '删除公司',
            actionCode: STATISTICALRULES.packetInfo['otherSet-99train-action'].delCode,
            content: param.id
          });
          if (res.status === 204) {
            this.getCompany();
          }
        }, () => param.loadingControl.loading = false)
      );
    }));
  });


  /**
   * 删除课次
   */
  readonly delTable = this.effect<{ id: string, loadingControl?: LoadingControl }>((param$) => {
    return param$.pipe(switchMap(param => {
      param.loadingControl.loading = true;
      return this.courseManageService.delTable(param.id).pipe(
        tapResponse(res => {
          param.loadingControl.loading = false;
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '删除课次',
            actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].delCode,
            content: param.id
          });
          if (res.status === 204) {
            this.getLessonCountTable();
          }
        }, () => param.loadingControl.loading = false)
      );
    }));
  });

  /**
   * 初始化数据
   */
  readonly dataInit = this.effect((data$) => {
    return data$.pipe(
      tap({
        next: (data) => {
          this.setBreakthroughMode();
          this.setPracticeOn();
          this.setIsBet();
          this.setLoading({
            isLoading: true, searchLoad: true
          });
          this.getKnowledgeNum(); // 获取课程知识点总数
          this.getLessonCountTable(); // 课次列表
          this.getLevel(); // 获取闯关列表
          this.getCompany(); // 获取公司列表
          this.getSubLibrary(); // 子题库列表
          this.getSubQuestionBank(); // 获取子题库模块树
        },
        error: () => {
        }
      })
    );
  });


  readonly getKnowledgeNum = this.effect((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      switchMap(([, packetInfo]) => {
        return this.courseManageService.getKnos({knowledgeSubjectId: packetInfo.knowledgeSubjectId}).pipe(
          tapResponse(res => {
            if (res.status === 200) {
              this.patchState({
                knowledgeNum: res.data.num || 0
              });
            } else {
              this.patchState({knowledgeNum: 0});
            }
          }, () => this.patchState({knowledgeNum: 0})));
      }));
  });

  readonly subQuestionBankChange = this.effect<SubQuestionBankchangeItem>((data$) => {
    const [success, failed] = partition(data$.pipe(
      withLatestFrom(
        combineLatest([this.packetInfo$, this.idMap$])),
      switchMap(([data, [packetInfo, idMap]]): any => {
        // tslint:disable-next-line:max-line-length
        return of(data).pipe(withLatestFrom(combineLatest([this[data.type + 'CurrentPre$'], this[data.type + '$'], of(packetInfo), of(idMap), this[data.type + '$']])));
      })), ([data, [pre]]) => {
      return pre.length < data.data.length;
    });
    return success.pipe(
      switchMap(([data, [pre, , packetInfo, idMap, list]]) => {
        const node: NzTreeNode = data['treeSelect'].getTreeNodeByKey(String(data.data[data.data.length - 1]));
        return this.courseManageService.callSubLibrary({
          courseId: packetInfo.courseId,
          coursePacketId: packetInfo.id,
          busType: data.type === 'subQuestionBank' ? '1' : '2',
          quebankId: node.origin.id,
          quebankName: node.origin.name,
          quebankType: 1,
          seq: ToolsUtil.getMaxSeq(list),
          quebankModuleType: data.type === 'subQuestionBankInt' ? '1' : idMap[data.data[data.data.length - 1]] === 'EXAM' ? '2' : '1'
        }).pipe(tapResponse(res => {
          if (res.status === 201) {
            this.getSubLibrary();
          }
        }, () => EMPTY));
      }),
      merge(failed.pipe(
        tap(([data, [pre, current]]) => {
          pre.every((item, i) => {
            if (data.data.indexOf(item) < 0) {
              this.courseManageService.delSubLibrary({id: current[i].id}).subscribe(res => {
                if (res.status === 204) {
                  this.getSubLibrary();
                }
              });
            } else {
              return true;
            }
          });
        }))
      ));
  });

  readonly generateLessonsReal = this.effect<any>((data$) => {
    return data$.pipe(
      withLatestFrom(this.packetInfo$),
      switchMap(([resolve, packetInfo]) => {
        this.patchState({
          isLoading: true
        });
        return this.courseManageService.lessonPackage(packetInfo.id, packetInfo.lessonCount, packetInfo.courseId).pipe(
          tapResponse(res => {
            this.patchState({
              isLoading: false
            });
            this.statisticsLogService.statisticsPacketInfoLog({
              name: '生成课次',
              actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].addCode,
              content: JSON.stringify({coursePacketId: packetInfo.id, lessonCount: packetInfo.lessonCount, courseId: packetInfo.courseId}),
            });
            if (res.status === 201) {
              this.getLessonCountTable();
              resolve(true);
            }
          }, () => {
            this.patchState({
              isLoading: false
            });
            resolve(false);
          }));
      }));
  });
  /**
   * 生成课次
   */
  readonly generateLessonsEffect = this.effect((data$) => {
    const [success, failed] = partition(data$.pipe(
      withLatestFrom(combineLatest([this.listOfData$, this.packetInfo$])),
      skipWhile(([, [, packetInfo]]) => {
        return packetInfo.preview === '1';
      }),
      switchMap(([, [listOfData]]) => of(listOfData))), listOfData => !!listOfData.length);
    return success.pipe(
      tap(() => {
        this.generateLessonsAlert();
      }),
      merge(failed.pipe(
        tap(() => {
          this.generateLessonsReal(() => {
          });
        })
      )),
    );
  });

  /**
   * 新增课次
   */
  readonly newClass = this.effect(($data) => {
    return $data.pipe(
      withLatestFrom(combineLatest([this.listOfData$, this.packetInfo$])),
      switchMap(([, [listOfData, packetInfo]]) => {
        if (listOfData.length >= 200) {
          this.message.warning('课次最多只能新增200个');
          return of([]);
        }
        const max = ToolsUtil.getMaxSeq(listOfData.filter(item => item.seq));
        this.patchState({isLoading: true});
        const content = {
          name: '第' + max + '课次',
          courseId: packetInfo.courseId,
          coursePacketId: packetInfo.id,
          seq: max
        };
        return this.courseManageService.saveTable(content).pipe(tapResponse(res => {
          this.patchState({isLoading: false});
          this.statisticsLogService.statisticsPacketInfoLog({
            name: '新增课次',
            actionCode: STATISTICALRULES.packetInfo['otherSet-lessons-action'].addCode,
            content: JSON.stringify(content),
          });
          if (res.status === 201) {
            this.getLessonCountTable();
          }
        }, () => this.patchState({isLoading: false})));
      }));
  });

  /**
   * 新增关卡
   */
  readonly addLevelEffect = this.effect<Partial<LevelItem>>((data$) => {
    return data$.pipe(
      withLatestFrom(combineLatest([this.packetInfo$, this.moduleArr$, this.levelLists$]))
      , switchMap(([levelItem, [packetInfo, moduleArr, levelLists]]) => {
        return ToolsUtil.getAjax(environment.questionBankApi + 'system/qkcPaper/courseCode', {
          courseCode: packetInfo.code,
          type: ''
        }).pipe(
          tapResponse(
            resultS => {
              try {
                const resP = JSON.parse(resultS);
                if (resP.code === 200) {
                  if (resP.data) {
                    let reduce = [];
                    if (resP.data.length) {
                      const moduleArrInner = JSON.parse(JSON.stringify(resP.data));
                      // 获取模块列表
                      moduleArrInner.forEach(itemX => {
                        reduce = itemX.sublibraryModuleList.filter(itemIn => itemIn.type === 'EXAM').concat(reduce);
                      });
                      this.patchState({moduleArr: reduce});
                    } else {
                      this.patchState({exam: [], intelligent: [], moduleArr: []});
                    }
                    if (reduce.length) {
                      this.modalService.create<NewLevelComponent, NzSafeAny>({
                        nzTitle: levelItem.id ? '编辑关卡' : '新增关卡',
                        nzContent: NewLevelComponent,
                        nzComponentParams: {
                          courseId: packetInfo.courseId,
                          coursePacketId: packetInfo.id,
                          moduleArr,
                          levelLists,
                          levelItem
                        },
                        nzMaskClosable: false,
                        nzCancelText: '取消',
                        nzOkText: '确定',
                        nzWidth: 900,
                      }).afterClose
                        .subscribe((flag: boolean) => {
                          if (flag) {
                            this.getLevel();
                          }
                        });
                    } else {
                      this.message.warning('该课包的课程尚没有子模块，请到题库新加子模块再来新增关卡');
                    }
                  }
                } else {
                  this.message.error(resP.message);
                }
              } catch {
                this.message.error('获取题库子模块列表失败，新增关卡需要子模块信息，请稍后再试新增');
              }
            }, () => {
              this.patchState({searchLoad: false});
              this.message.error('获取题库子模块列表失败，新增关卡需要子模块信息，请稍后再试新增');
            }
          )
        );
      }));
  });

  /**
   * 新增公司
   */
  readonly addCompanyEffect = this.effect<Partial<CompanyItem>>((data$) => {
    return data$.pipe(
      withLatestFrom(combineLatest([this.packetInfo$, this.companyLists$])),
      tap(([companyItem, [packetInfo, companyLists]]) => {
        this.modalService.create<NewCompanyComponent, NzSafeAny>({
          nzTitle: companyItem.id ? '编辑公司' : '新增公司',
          nzContent: NewCompanyComponent,
          nzComponentParams: {
            courseId: packetInfo.courseId,
            coursePacketId: packetInfo.id,
            companyLists,
            companyItem
          },
          nzMaskClosable: false,
          nzCancelText: '取消',
          nzOkText: '确定',
          nzWidth: 600,
        }).afterClose
          .subscribe((flag: boolean) => {
            if (flag) {
              this.getCompany();
            }
          });
      }));
  });


  /**
   * 新增奖励
   * @param data 当前关卡
   */
  readonly rewardSettings = this.effect<any>((data$) => {
    return data$.pipe(
      tap((data) => {
        if (data.coursePacketCardRecourseList && data.coursePacketCardRecourseList.length) {
          data.coursePacketCardRecourseList.forEach((itemx, indexx) => {
            itemx.thumbUrl = null;
            itemx.name = itemx.title;
          });
        }
      }),
      withLatestFrom(this.packetInfo$),
      tap(([data, packetInfo]) => {
        return this.modalService.create<RewardSettingsComponent, NzSafeAny>({
          nzTitle: '奖励设置',
          nzContent: RewardSettingsComponent,
          nzComponentParams: {
            courseId: packetInfo.courseId,
            coursePacketId: packetInfo.id,
            professionId: packetInfo.professionId,
            currentCard: data,
          },
          nzMaskClosable: false,
          nzCancelText: '取消',
          nzOkText: '确定上传',
        }).afterClose
          .subscribe((flag: boolean) => {
            if (flag) {
              this.getLevel();
            }
          });
      }));
  });


  readonly listDrop = this.effect<{ data: CdkDragDrop<any, any>, label: 'subQuestionBank' | 'subQuestionBankInt' }>((data$) => {
    return data$.pipe(
      switchMap((data) => {
        return of(data).pipe(withLatestFrom(this[data.label + '$']));
      }),
      tap(([data, list]) => {
        if (data.data.previousIndex === data.data.currentIndex) {
          return;
        }
        moveItemInArray(list, data.data.previousIndex, data.data.currentIndex);
        const arr = list.map((item) => String(item.quebankId));
        this.patchState({
          [data.label + 'CurrentPre']: arr,
          [data.label + 'Current']: JSON.parse(JSON.stringify(arr)),
          [data.label]: list
        });
        const params = [];
        list.forEach((item, i) => {
          params.push({
            id: item.id,
            seq: i
          });
        });
        this.courseManageService.sortSubQuestionBank(params).subscribe((res: any) => {
          if (res.status !== 201) {
            this.message.error(res.message || '移动失败，未知错误！');
          }
        });
      }));
  });
//#endregion


//#region methods

  /**
   *  开启闯关
   * @param val bool
   */
  readonly breakthroughModeChange = (val) => {
    const flag = val ? '1' : '0';
    const effect = of(null).pipe(
      withLatestFrom(this.packetInfo$),
      tap(([, packetInfo]) => {
        this.setPacketInfo({...packetInfo, ...{isCard: flag}});
      }),
      switchMap(([, packetInfo]) => {
        return this.courseManageService.isCardUpdate(packetInfo.id, flag).pipe(
          tapResponse(res => {
            if (res.status === 201) {
              if (flag === '1') {
                this.getLevel();
              }
              SessionStorageUtil.putPacketInfoItem('isCard', flag);
            }
          }, () => EMPTY)
        );
      })).subscribe(() => effect.unsubscribe());
  };

  /**
   *  开启99实训
   * @param val bool
   */
  readonly practiceOnChange = (val: boolean) => {
    const flag = val ? '1' : '0';
    const effect = of(null).pipe(
      withLatestFrom(this.packetInfo$),
      tap(([, packetInfo]) => {
        this.setPacketInfo({...packetInfo, ...{is99Train: flag}});
      }),
      switchMap(([, packetInfo]) => {
        return this.courseManageService.is99TrainUpdate(packetInfo.id, flag).pipe(
          tapResponse(res => {
            if (res.status === 201) {
              if (flag === '1') {
                this.getCompany();
              }
              SessionStorageUtil.putPacketInfoItem('is99Train', flag);
            }
          }, () => EMPTY)
        );
      })).subscribe(() => effect.unsubscribe());
  };


  /**
   *  开启押题宝
   * @param val bool
   */
  readonly isBetChange = (val: boolean) => {
    const flag = val ? '1' : '0';
    const effect = of(null).pipe(
      withLatestFrom(this.packetInfo$),
      tap(([, packetInfo]) => {
        this.setPacketInfo({...packetInfo, ...{isBet: val}});
      }),
      switchMap(([, packetInfo]) => {
        return this.courseManageService.isBetUpdate(packetInfo.id, flag).pipe(
          tapResponse(res => {
            if (res.status === 201) {
              SessionStorageUtil.putPacketInfoItem('isBet', flag);
            }
          }, () => EMPTY)
        );
      })).subscribe(() => effect.unsubscribe());
  };

  @ConfirmableDesc({
    title: '提示',
    content: '重新生成课次会覆盖已生成的课次，确定重新生成吗？',
    type: 'warning'
  })
  private generateLessonsAlert() {
    return new Promise((resolve) => {
        this.generateLessonsReal(resolve);
      }
    );
  }

  /**
   * 子题库树节点数据转换
   * @param data 节点
   */
  private readonly conversionNode = (data) => {
    if (data.length) {
      data.forEach((item, ii) => {
        if (item.sublibraryModuleList && item.sublibraryModuleList.length) {
          data[ii].children = item.sublibraryModuleList;
          data[ii].children.forEach((child, iii) => {
            data[ii].children[iii].title = child.name;
            data[ii].children[iii].key = String(child.id);
            data[ii].children[iii].isLeaf = true;
          });
        }
        data[ii].title = item.name;
        data[ii].key = item.code;
        data[ii].disabled = true;
        data[ii].selectable = false;
        if (!item.sublibraryModuleList || !item.sublibraryModuleList.length) {
          data[ii].isLeaf = true;
        }
      });
    }
    return data;
  };
//#endregion

}
