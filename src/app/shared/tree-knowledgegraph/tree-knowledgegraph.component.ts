import {
  Component,
  OnInit,
  Injector,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  NzFormatEmitEvent,
  NzTreeNode,
  NzTreeNodeOptions,
  NzFormatBeforeDropEvent,
  NzMessageService,
} from 'ng-zorro-antd';
import {of, Observable, timer} from 'rxjs';
import {HttpService} from 'core/services/http.service';
import {ToolsUtil} from 'core/utils/tools.util';
import {NzTreeComponent} from 'ng-zorro-antd/tree';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'qkc-tree-knowledgegraph',
  templateUrl: './tree-knowledgegraph.component.html',
  styleUrls: ['./tree-knowledgegraph.component.less'],
})
export class TreeKnowledgegraphComponent implements OnInit, OnChanges {
  @Input() examWeightInThisChapter = 0; // 章节权重
  @Input() nzStyle = {position: 'relative'}; // 控制样式
  @Input() status = '0'; // 是否通过审核
  @Input() allNodes = false; // 是否通过审核
  @Input() preview: boolean; // 是否预览模式
  @Input() practice = false; // 是否是训练库
  @Input() fullNode = false; // 点击树节点是否要节点全部信息或origin
  @Input() nodes = [];
  @Input() professionId: string;
  @Input() extendedData; // 扩展数据
  @Input() isDraggable = false;
  @Input() isCustomNode = false;
  @Input() isMultiple = false;
  @Input() isCheckable = false;
  @Input() isShowLine = false;
  @Input() defaultCheckedKeys = [];
  @Input() nzSearchValue;
  @Input() isExpandAll = true;
  @Input() nzVirtualHeight;
  @Input() type;
  @Input() selectedProfesson;
  @Input() model: 'custom' | 'check' | 'click' | '' = ''; // 显示的模式
  @Output() nodeChange = new EventEmitter<any>(); // 点击节点数据回调
  @Output() delEmit = new EventEmitter<any>(); // 点击节点数据回调
  @Output() examWeightInThisChapterChange = new EventEmitter<any>(); // 章节权重回调填
  @ViewChild('nzTreeComponent') nzTreeComponent: NzTreeComponent;
  activedNode: NzTreeNode;
  isLoading = false;
  isPermittedDrag = false;
  defaultExpandedKeys = []; // 默认展开节点
  isDone = ''; // 是否已完善知识点
  totalWeight = 0; // 总权重
  modify: any = { // 是指修改标识
    flag: false
  };
  lock = false; // 防止快速双击

  get nzMesService() {
    return this.injector.get(NzMessageService);
  }

  get httpService() {
    return this.injector.get(HttpService);
  }

  constructor(private injector: Injector, private modal: NzModalService, private message: NzMessageService) {
  }

  ngOnInit() {
    this.initModel();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['professionId'] && this.professionId) {
      this.getKnowledgeTree(this.professionId, this.isDone);
    }
  }

  initModel() {
    if (this.model === 'custom') {
      this.isCustomNode = true;
      this.isMultiple = false;
      this.isCheckable = false;
      this.isShowLine = true;
    } else if (this.model === 'check') {
      this.isCustomNode = false;
      this.isMultiple = false;
      this.isCheckable = true;
      this.isShowLine = true;
    } else if (this.model === 'click') {
      this.isCustomNode = false;
      this.isMultiple = false;
      this.isCheckable = false;
      this.isShowLine = false;
    }
  }


  nzEvent(evt: NzFormatEmitEvent): void {
    if (evt.eventName === 'click') {
      // 处于编辑状态(不是添加进去的)下，失去焦点时，还原之前的状态
      if (
        this.activedNode &&
        this.activedNode.key !== evt.node.key &&
        this.activedNode.origin.isEdit === true &&
        this.activedNode.key.indexOf('qkc') === -1
      ) {
        this.lock = false;
        this.activedNode.title = this.activedNode.origin.cacheTitle;
        this.activedNode.origin.isEdit = false;
      }
      this.activedNode = evt.node;
      if (this.model === 'click' || this.model === 'custom') {
        this.examWeightInThisChapterChange.emit(0);
        if (this.fullNode) {
          this.nodeChange.emit(evt.node);
        } else {
          this.nodeChange.emit(evt.node.origin);
        }
      }
    } else if (evt.eventName === 'check') {
      this.lock = false;
      if (this.model === 'check') {
        if (this.fullNode) {
          this.nodeChange.emit(evt.checkedKeys);
        } else {
          const ckeckedKeys = this.getCheckedLeafKey(evt.checkedKeys);
          this.examWeightInThisChapterChange.emit(0);
          this.nodeChange.emit(ckeckedKeys);
        }
      }
    } else if (evt.eventName === 'dragend') {
      this.lock = false;
      if (this.isPermittedDrag) {
        const postData = this.createSortPostData(evt.node);
        // 处理节序号为章序号*100+节序号
        if (evt.node.origin.kType === '3') {
          const chapterSeq = evt.node.parentNode.origin.seq;
          postData.forEach((e, i) => {
            postData[i].seq = chapterSeq * 100 + Number(postData[i].seq);
          });
        }
        let interfaceUrl = 'knowledge-point';
        if (evt.node.level === 2) {
          interfaceUrl = 'knowledge-unit';
        } else if (evt.node.level === 1) {
          interfaceUrl = 'knowledge-module';
        }
        this.sortApiNew(postData, interfaceUrl).subscribe(
          (res) => {
            if (res.status !== 201) {
              this.nzMesService.error(res.message);
            }
          },
          (error) => {
            this.nzMesService.error(error);
          }
        );
      }
    }
  }


  getCheckedLeafKey(arr: any[]): string[] {
    const keys: string[] = [];
    const recurTree = (checkKeyArr: any[]) => {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < checkKeyArr.length; i++) {
        const node =
          checkKeyArr[i] instanceof NzTreeNode
            ? checkKeyArr[i].origin
            : checkKeyArr[i];
        if (node.children && node.children.length > 0) {
          recurTree(node.children);
        } else {
          if (node.isLeaf && node.checked && (node.kType === '4')) {
            keys.push(node.id);
          }
        }
      }
    };
    recurTree(arr);
    return keys;
  }

  getLengthChar(str) {
    return str.replace(/[\u0391-\uFFE5]/g, 'a').length;   // 先把中文替换成两个字节的英文，在计算长度
  }

  saveNode(node: NzTreeNode, request = true, checked = true) {
    return new Observable((observer) => {
      if (this.practice) {
        const postData = {
          name: node.origin.editTitle,
          leaderId: node.origin.leaderId,
          knowledgeSubjectId: node.parentNode.origin.id,
          id: node.origin.id || ''
        };
        this.httpService.postBody('res/knowledgeIndustry/save', postData, {isCommonHttpHeader: true}).subscribe((res) => {
          if (res.status === 201) {
            this.getKnowledgeTree(this.professionId, this.isDone);
          }
          this.handlerComplete(observer);
        }, error => {
          this.handlerComplete(observer, error);
        });
      } else {
        if (node) {
          if (checked) {
            if (!this.checkKnowledgePoints(node)) {
              this.handlerComplete(observer, null, false);
              return;
            }
            if (!request) {
              this.handlerComplete(observer);
            }
          }
          if (request) {
            if (node.origin.kType === '1') {
              this.handlerComplete(observer);
            } else {
              this.realSave(node, observer);
            }
          }
        } else {
          this.handlerComplete(observer);
        }
      }
    });
  }

  realSave(node, observer) {
    const children = !node.parentNode.origin.children
      ? []
      : node.parentNode.origin.children;
    const maxSeq = this.getMaxSeq(children);
    let param;
    if (node.origin.kType === '2' || node.origin.kType === '3') {
      param = {
        knowledgeSubjectId: this.professionId,
        name: node.origin.editTitle || node.origin.title,
        seq: node.origin.id === ''
          ? maxSeq
          : node.origin.seq,
        weight: this.examWeightInThisChapter,
        id: node.origin.id || ''
      };
      if (node.origin.kType === '3') {
        param.seq = node.parentNode.origin.seq * 100 + Number(param.seq);
      }
    } else {
      param = this.getParams(this.extendedData);
      param.knowledgeSubjectId = this.professionId;
      param.id = node.origin.id || '';
      param.name = node.origin.editTitle || node.origin.title;
      param.seq = node.origin.id === '' ? maxSeq : node.origin.seq;
      param.knowledgeModuleId = node.parentNode.parentNode.origin.id;
      param.knowledgeUnitId = node.parentNode.origin.id;
    }
    this.saveTreeNode(param, node)
      .subscribe(
        (result) => {
          if (result.status === 201) {
            if (node.origin.kType === '2') {
              if (node.origin.weight) {
                this.totalWeight = this.totalWeight + this.examWeightInThisChapter - node.origin.weight;
              } else {
                this.totalWeight += this.examWeightInThisChapter;
              }
            }
            if (node.origin.kType === '4') {
              this.extendedData.patchValue({
                code: result.data.code
              });
              node.origin.id = result.data.id;
              node.origin.code = result.data.code;
              node.origin.fileList = param.fileList;
            } else {
              node.origin.id = result.data;
            }
            if (node.origin.editTitle) {
              node.origin.cacheTitle = node.origin.editTitle;
              node.title = node.origin.editTitle;
            }

            node.origin.isEdit = false;
            if (!node.origin.seq) {
              node.origin.seq = maxSeq;
            }
            const {
              isDone,
              content,
              isFinal,
              isStable,
              keyLevel,
              isSprint,
              opsType
            } = this.extendedData.value;
            node.origin.isDone = isDone;
            node.origin.content = content;
            node.origin.isFinal = isFinal;
            node.origin.isStable = isStable;
            node.origin.keyLevel = keyLevel;
            node.origin.isSprint = isSprint;
            node.origin.opsType = opsType;
            node.origin.weight = this.examWeightInThisChapter;

            if (node.origin.add) {
              delete node.origin.add;
              node.origin.status = '2';
              this.modify.flag = true;
            }
          } else {
            if (result.code === 500) {
              this.message.error(result.message);
            }
          }
          this.handlerComplete(observer);
        },
        (error) => {
          this.handlerComplete(observer, error);
          this.message.error(JSON.stringify(error));
        }
      );
  }

  handlerComplete(observer, errors?, flag = true) {
    this.lock = false;
    if (errors) {
      observer.error(errors);
      observer.unsubscribe();
    } else {
      observer.next(flag);
      observer.unsubscribe();
    }
  }

  cancelEdit(node: NzTreeNode) {
    this.lock = false;
    node.title = node.origin.cacheTitle;
    if (node.key.indexOf('qkc') !== -1) {
      node.remove();
    }
    node.origin.isEdit = false;
  }

  confirmEdit(node: NzTreeNode) {
    if (!this.lock) {
      this.lock = true;
      const {editTitle, key} = node.origin;
      if (editTitle === '') {
        this.nzMesService.error('数据不能为空');
        this.lock = false;
        return;
      }
      if (
        this.hasAameTitle(
          editTitle,
          key,
          node.parentNode.origin.children,
          node.level
        )
      ) {
        this.lock = false;
        return;
      }
      node.title = node.origin.editTitle;
      this.saveNode(node).subscribe(e => e);
    }
  }

  hasAameTitle(title, key, nodes, level) {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].cacheTitle === title && key !== nodes[i].key) {
        this.showError(level);
        return true;
      }
    }
    return false;
  }

  showError(level) {
    switch (level) {
      case 0:
        this.nzMesService.error('已存在同名学科');
        break;
      case 1:
        if (this.practice) {
          this.nzMesService.error('已存在同名公司');
        } else {
          this.nzMesService.error('已存在同名章');
        }
        break;
      case 2:
        this.nzMesService.error('已存在同名节');
        break;
      case 3:
        this.nzMesService.error('已存在同名知识点');
        break;
      default:
        this.nzMesService.error('该名称已存在');
    }
  }

  edit(node: NzTreeNode) {
    node.origin.editTitle = node.title;
    node.origin.isEdit = true;
  }

  delete(node: NzTreeNode) {
    const param = {
      id: node.origin.id,
      kType: node.origin.kType,
    };
    this.lock = true;
    this.delTreeNode(param, node).subscribe(
      (result) => {
        if (result.status === 204 || result.status === 200) {
          this.modify.flag = true;
          if (this.practice || this.status === '0') {
            node.remove();
            if (node.origin.kType === '2' && !this.practice) {
              this.totalWeight -= this.examWeightInThisChapter;
            }
            if (result.status === 200) {
              this.message.success('删除成功');
            }
            timer(0).subscribe(() => {
              this.defaultCheckedKeys = [this.nodes[0].id];
              this.delEmit.emit(this.nzTreeComponent.getTreeNodeByKey(this.nodes[0].id));
            });
          } else {
            if (node.origin.kType === '2') {
              this.totalWeight -= this.examWeightInThisChapter;
              if (node.origin.status === '2') {
                node.remove();
              } else {
                node.origin.status = '3';
                const children = node.origin.children;
                if (children && children.length) {
                  children.forEach((child, childIndex) => {
                    if (child.status === '2') {
                      node.getChildren()[childIndex].remove();
                    } else {
                      children[childIndex].status = '3';
                      const grandSon = children[childIndex].children;
                      if (grandSon && grandSon.length) {
                        grandSon.forEach((grandChild, grandChildIndex) => {
                          if (grandChild.status === '2') {
                            node.getChildren()[childIndex].getChildren()[grandChildIndex].remove();
                          } else {
                            children[childIndex].children[grandChildIndex].status = '3';
                          }
                        });
                      }
                    }
                  });
                }
              }
            } else if (node.origin.kType === '3') {
              if (node.origin.status === '2') {
                node.remove();
              } else {
                node.origin.status = '3';
                const children = node.origin.children;
                if (children && children.length) {
                  children.forEach((child, childIndex) => {
                    if (child.status === '2') {
                      node.getChildren()[childIndex].remove();
                    } else {
                      children[childIndex].status = '3';
                    }
                  });
                }
              }
            } else {
              if (node.origin.status === '2') {
                node.remove();
              } else {
                node.origin.status = '3';
              }
            }
          }
        }
      }
    );
  }

  modalTip(node) {
    return new Promise((resolve) => {
      const kType = node.origin.kType;
      const children = node.origin.children;
      let text = '';
      if (kType === '2') {
        if (children && children.length) {
          const unitCount = children.length;
          let pointCount = 0;
          // tslint:disable-next-line:prefer-for-of
          for (let index = 0; index < unitCount; index++) {
            const grandSon = children[index].children;
            if (grandSon && grandSon.length) {
              pointCount += grandSon.length;
            }
          }
          text = `删除章，将会导致该章下的${unitCount}个节${pointCount}个知识点一起删除，确定删除？`;
        } else {
          text = `确定删除该章？`;
        }
      } else if (kType === '3') {
        if (children && children.length) {
          text = `删除节，将会导致该节下的${children.length}个知识点一起删除，确定删除？`;
        } else {
          text = `确定删除该节？`;
        }
      } else {
        if (this.practice) {
          text = `删除该行业后、该行业下所有账期将全部删除。`;
          this.httpService
            .get('res/knowledgeIndustry/checkPractical', {id: node.origin.id}, {isCommonHttpHeader: true}).subscribe(value => {
            if (value.status === 200) {
              if (value.data === '1') {
                text = '该行业下存在使用账期，删除该行业后所有正在被使用的账期将同步删除，确定删除该行业吗？';
              }
              resolve(text);
            } else if (value.status === 500) {
              this.message.error('检查行业下账期使用情况服务端出错，请稍后再试');
            }
          });
        } else {
          text = `确定删除该知识点？`;
        }
      }
      if (!this.practice) {
        resolve(text);
      }
    });
  }

  warning(node) {
    this.modalTip(node).then((text) => {
      const config: any = {
        nzTitle: '警告',
        nzContent: text,
        nzCancelText: '取消',
        nzOkText: '确定',
        nzOnOk: () => {
          this.delete(node);
        },
      };
      this.modal.warning(config);
    });
  }

  add(node: NzTreeNode) {
    if (node.children && node.children.length > 0) {
      if (!node.children[node.children.length - 1].origin.cacheTitle) {
        return this.nzMesService.error('请先完成当前节点操作');
      }
    }
    const ktype = node.origin.kType;
    const iconBtn = this.getIconBtnSetting(ktype, node);
    const randomKey = this.createRandomNodeKey();
    const newKType: string = (parseInt(ktype, 10) + 1).toString();
    const treeOpt: NzTreeNodeOptions = {
      title: '',
      editTitle: '',
      key: randomKey,
      isLeaf: true,
      isEdit: true,
      kType: newKType,
      id: '',
      pid: node.origin.id,
      iconBtn,
      add: true
    };
    node.addChildren([treeOpt]);
  }

  getIconBtnSetting(ktype: string, node: NzTreeNode) {
    let iconBtn = null;

    switch (ktype) {
      case '1':
        node.isLeaf = false;
        node.isExpanded = true;
        iconBtn = {add: true, edit: true, del: true};
        break;
      case '2':
        node.isLeaf = false;
        node.isExpanded = true;
        iconBtn = {add: true, edit: true, del: true};
        break;
      case '3':
        node.isLeaf = false;
        node.isExpanded = true;
        iconBtn = {add: false, edit: true, del: true};
        break;
      default:
        iconBtn = {add: false, edit: false, del: false};
        break;
    }
    return iconBtn;
  }

  createRandomNodeKey(): string {
    return `qkc${new Date().getTime()}`;
  }

  beforeDrop = (arg: NzFormatBeforeDropEvent): Observable<boolean> => {
    const orNode = arg.dragNode.parentNode || arg.node.parentNode;
    let isOk = false;
    if (orNode === null) {
      // 顶层
      isOk = arg.pos === 0 ? false : true;
    } else {
      const andNode = arg.dragNode.parentNode && arg.node.parentNode;
      if (andNode === null) {
        // 顶层与不同的层
        isOk = false;
      } else {
        if (arg.dragNode.parentNode.key === arg.node.parentNode.key) {
          // isOk = true;
          isOk = arg.pos === 0 ? false : true;
        } else {
          isOk = false;
        }
      }
    }
    this.isPermittedDrag = isOk;
    return of(isOk);
  }

  nzSearchValueChange(data) {
    console.log(this.nodes);
  }


  saveTreeNode(param: any, node): Observable<any> {
    const options = {
      isCommonHttpHeader: true,
    };
    let url;
    const kType = node.origin.kType;
    if (kType === '2') {
      url = 'res/knowledge-module/save';
    } else if (kType === '3') {
      url = 'res/knowledge-unit/save';
      param.knowledgeModuleId = node.parentNode.origin.id;
    } else if (kType === '4') {
      url = 'res/knowledge-point/save';
    }
    return this.httpService
      .postBody(url, param, options);
  }

  delTreeNode(param: any, node): Observable<any> {
    return new Observable<any>((observe) => {
      const options = {
        isCommonHttpHeader: true,
      };
      let url = 'res/knowledgeIndustry/delPractical';
      if (this.practice) {
        this.httpService
          .post(url, {id: node.origin.id, knowledgeSubjectId: this.professionId}, options)
          .subscribe(
            (result) => {
              this.lock = false;
              observe.next(result);
              observe.unsubscribe();
            },
            (error) => {
              this.lock = false;
              observe.error(error);
            }
          );
      } else {
        if (node.origin.kType === '2') {
          url = 'res/knowledge-module/del/';
        } else if (node.origin.kType === '3') {
          url = 'res/knowledge-unit/del/';
        } else {
          url = 'res/knowledge-point/del/';
        }
        this.httpService
          .get(url + param.id, {}, options)
          .subscribe(
            (result) => {
              this.lock = false;
              observe.next(result);
              observe.unsubscribe();
            },
            (error) => {
              this.lock = false;
              observe.error(error);
            }
          );
      }
    });
  }

  conversionCompany(arr) {
    if (arr.length) {
      arr.forEach((e, i) => {
        if (e.industrys && e.industrys.length) {
          arr[i].children = arr[i].industrys;
        }
      });
    }
    return arr;
  }

  getKnowledgeTree(id: string, isDone, isExpandAll = false): void {
    if (id === null) {
      return;
    }
    const success = (result) => {
      this.isLoading = false;
      if (result.status === 200) {
        if (!result.data) {
          result.data = this.selectedProfesson;
        }
        this.defaultCheckedKeys = [...this.defaultCheckedKeys];
        this.nodes = ToolsUtil.transformNzTreeNodeOptions([result.data], true, this.practice, this.modify);
        if (this.practice) {
          result.data.kType = '1';
          this.nodes = this.conversionCompany(this.nodes);
        } else {
          const {children} = result.data;
          if (children && children.length) {
            children.filter((node) => {
              return node.status !== '3';
            }).forEach(rr => {
              this.totalWeight += rr.weight;
            });
          }
        }
        if (this.defaultCheckedKeys.length > 0) {
          if (!isExpandAll) {
            this.expandCheckedNode();
          } else {
            this.defaultCheckedKeys = [];
            this.isExpandAll = false;
            timer(0).subscribe(() => {
              this.isExpandAll = true;
            });
          }
        } else if (this.nodes.length > 0) {
          if (!isExpandAll) {
            timer(0).subscribe(() => {
              this.defaultExpandedKeys = [this.nodes[0].id];
            });
          } else {
            this.defaultCheckedKeys = [];
            this.isExpandAll = false;
            timer(0).subscribe(() => {
              this.isExpandAll = true;
            });
          }
          this.examWeightInThisChapterChange.emit(0);
        }
      }
    };
    const error = () => {
      this.isLoading = false;
    };
    this.isLoading = true;
    if (this.practice) {
      this.httpService
        .get('res/knowledgeIndustry/tree/' + id, {}, {isCommonHttpHeader: true})
        .subscribe(success, error);
    } else {
      this.totalWeight = 0;
      this.isDone = isDone;
      // if ((this.type === 'my' || this.type === 'all')) {
      //   if (!this.allNodes) {
      //     this.httpService
      //       .get('res/knowledge-module/preAuditTree/' + id, {isDone}, {isCommonHttpHeader: true})
      //       .subscribe(success, error);
      //   } else {
      //     this.httpService
      //       .get('res/knowledge-module/tree/' + id, {isDone}, {isCommonHttpHeader: true})
      //       .subscribe(success, error);
      //   }
      // } else { // 课程列表
      if (!this.allNodes) {
        this.httpService
          .get('res/knowledge-module/preAuditTree/' + id, {isDone}, {isCommonHttpHeader: true})
          .subscribe(success, error);
      } else {
        this.httpService
          .get('res/knowledge-module/tree/' + id, {isDone}, {isCommonHttpHeader: true})
          .subscribe(success, error);
      }
      // }
    }
    // }
  }


  sortApiNew(param: any, interfaceUrl: string) {
    const options = {
      isCommonHttpHeader: true,
    };
    return this.httpService.postBody(
      `res/${interfaceUrl}/updateSeq`,
      param,
      options
    );
  }

  createSortPostData(treeNode: NzTreeNode) {
    const children = !treeNode.parentNode.origin.children
      ? []
      : treeNode.parentNode.origin.children;
    // children.forEach((ele, idx) => {
    //   ele.seq = idx + 1;
    // });
    return children.map((ele, idx) => ({
      id: ele.id,
      seq: idx + 1,
      kType: ele.kType,
    }));
  }


  getMaxSeq(data) {
    let max = 0;
    if (data.length) {
      data.forEach((item, idx) => {
        if (item.seq > max) {
          max = item.seq;
        }
      });
    }
    return max + 1;
  }

  openFolder(data: NzTreeNode | Required<NzFormatEmitEvent>): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  expandCheckedNode() {
    setTimeout(() => {
      if (!this.nzTreeComponent) {
        return;
      }
      const checkedNodes = this.nzTreeComponent.getCheckedNodeList();
      if (checkedNodes.length === 0) {
        return;
      }
      const checkedNode = checkedNodes[0];
      const keys = [];
      const getNodes = (parentNode: NzTreeNode) => {
        if (parentNode === null) {
          return;
        }
        keys.push(parentNode.key);
        getNodes(parentNode.parentNode);
      };
      getNodes(checkedNode.parentNode);
      this.defaultExpandedKeys = keys;
    }, 800);
  }

  private randomString(e?) {
    e = e || 32;
    const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const a = t.length;
    let n = '';
    for (let i = 0; i < e; i++) {
      n += t.charAt(Math.floor(Math.random() * a));
    }
    return n;
  }


    private getParams(extendedData) {
    const data = JSON.parse(JSON.stringify(extendedData.value));
    data.fileList = [];
    if (data.explanationVideo.length) {
      data.fileList = data.fileList.concat(data.explanationVideo.map((e) => {
        const obj: any = {
          fileType: 1,
          seq: e.seq,
          teacherId: e.teacherId,
          attachmentName: e.attachmentName,
          id: e.id,
        };
        if (!obj.id) {
          obj.id = this.randomString();
        }
        if (typeof e.videoUrl === 'string') { // 保利威
          obj.attachmentPath = e.videoUrl;
          obj.sourceType = 2;
        } else {
          // obj.attachmentExt = ToolsUtil.getExt(e.videoUrl[0].name);
          obj.attachmentPath = e.videoUrl[0].path;
          obj.sourceType = 1;
        }
        return obj;
      }));
    }
    if (data.learningMaterials.length) {
      data.fileList = data.fileList.concat(data.learningMaterials.map((e) => {
        const obj: any = {
          fileType: 2,
          attachmentExt: ToolsUtil.getExt(e.name),
          attachmentName: e.name,
          attachmentPath: e.path,
          seq: e.seq,
          sourceType: 1,
          id: e.id
        };
        if (!obj.id) {
          obj.id = this.randomString();
        }
        return obj;
      }));
    }
    delete data.explanationVideo;
    delete data.learningMaterials;
    return data;
  }

  getLength(keyLevel: any) {
    return new Array(keyLevel).fill(0);
  }


  private checkKnowledgePoints(node) {
    if (!node) {
      this.nzMesService.warning('知识图谱中请先选中一个节点再保存信息');
      return;
    }
    if (node.origin.kType === '2' && (!this.examWeightInThisChapter)) {
      this.message.warning('请输入本章考试权重');
      return;
    }
    if (node.origin.kType === '4') {
      // tslint:disable-next-line:forin
      for (const i in this.extendedData.controls) {
        this.extendedData.controls[i].markAsDirty();
        this.extendedData.controls[i].updateValueAndValidity();
      }
      if (this.extendedData.invalid) {
        this.message.warning('请按规则填写知识点所有必填项');
        return;
      }
      if (this.getLengthChar(this.extendedData.value.content.replace(/<[^>]+>/g, '')) > 2000) {
        this.message.warning('知识点定义文字个数请不要超过2000个');
        return;
      }
    }
    return true;
  }

  getTitleText(node) {
    if (node.isMatched) {
      return node.title.replaceAll(this.nzSearchValue, ('<span style="color:red">' + this.nzSearchValue + '</span>'));
    }
    return node.title;
  }
}
