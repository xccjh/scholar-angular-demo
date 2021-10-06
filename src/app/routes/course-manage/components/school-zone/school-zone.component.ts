import {
  Component,
  OnInit,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  Input,
  EventEmitter
} from '@angular/core';
import {CourseManageService} from 'src/app/busi-services/course-manage.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';

@Component({
  selector: 'app-school-zone',
  templateUrl: './school-zone.component.html',
  styleUrls: ['./school-zone.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SchoolZoneComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchoolZoneComponent implements OnInit, ControlValueAccessor {
  opts: NzTreeNodeOptions[] = [];
  selectedValues: string[] = [];
  expandKeys: string [] = [];
  @Input() checkAll = {
    flag: false
  };
  @Output() schoolZone = new EventEmitter<any>();
  private dataLength = 0;
  private dataPLength = 0;


  constructor(
    private cdr: ChangeDetectorRef,
    private courseMgService: CourseManageService,
    private nzMsg: NzMessageService) {
  }

  private onModelChange = (_: any) => {
  }

  ngOnInit(): void {
    this.collegeList();
  }

  writeValue(values: string[]): void {
    this.selectedValues = values;
    this.setExpandKeys();
    this.detectChange();
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {

  }

  collegeList() {
    this.courseMgService.collegeList('area').subscribe(res => {
      if (res.status !== 200) {
        this.nzMsg.error(res.message);
        return;
      }
      this.opts = this.formatOpts(res.data).filter(e => e.children.length);
      this.dataLength = 0;
      this.dataPLength = this.opts.length;
      this.opts.forEach(item => {
        if (item.children && item.children.length) {
          this.dataLength += item.children.length;
        }
      });
      const {opts, dataLength, dataPLength} = this;
      this.schoolZone.emit({opts, dataLength, dataPLength});
      this.setExpandKeys();
      this.detectChange();
    }, err => {
      this.nzMsg.error(JSON.stringify(err));
    });
  }

  formatOpts(data: any[]) {
    const formatChildren = (children: any[]) => {
      if (!children || children.length === 0) {
        return [];
      } else {
        return children.map(school => {
          return {
            key: school.oCode,
            value: school.oCode,
            title: school.orgName,
            isLeaf: true
          };
        });
      }
    };
    return data.map(area => {
      return {
        key: 'AREA_' + area.typeCode,
        value: area.typeCode,
        title: area.typeName,
        children: formatChildren(area.chlidren)
      };
    });
  }

  selectedChange(values: any[]) {
    const flag = values.every((value, i) => {
      if (value.indexOf('AREA_') < 0) {
        return true;
      }
    });
    if (flag) {
      if (this.dataLength === values.length) {
        this.checkAll.flag = true;
      } else {
        this.checkAll.flag = false;
      }
    } else {
      if (this.dataPLength === values.length) {
        this.checkAll.flag = true;
      } else {
        this.checkAll.flag = false;
      }
    }
    this.setModalChange(values, false);
  }

  setExpandKeys() {
    if (!this.selectedValues) {
      return;
    }
    if (this.opts.length === 0 || this.selectedValues.length === 0) {
      return;
    }
    const tmpSelectedValues = [...this.selectedValues];
    const tmpExpandedkeys = [];
    for (const node of this.opts) {
      if (node.children.length === 0) {
        continue;
      }
      for (const childNode of node.children) {
        if (tmpSelectedValues.length === 0) {
          this.expandKeys = Array.from(new Set(tmpExpandedkeys));
          return;
        }
        const idx = tmpSelectedValues.findIndex(key => key === childNode.key);
        if (idx !== -1) {
          tmpExpandedkeys.push(node.key);
          tmpSelectedValues.splice(idx, 1);
        }
      }
    }
  }

  checkAllStatus(checkAll: boolean) {
    if (checkAll) {
      const list = [];
      this.opts.map(item => {
        if (item.children && item.children.length > 0) {
          item.children.map(it => {
            list.push(it.key);
          });
        }
      });
      this.selectedValues = list;

      this.setModalChange(list, true);
    } else {
      this.selectedValues = [];
      this.setModalChange([], true);
    }
  }

  setModalChange(values: string[], checkAll: boolean) {
    if (checkAll) {
      this.onModelChange(values);
    } else {
      const selectedValues = values.reduce((pre, cur) => {
        if (cur.startsWith('AREA_')) {
          const schools = this.opts.find(item => item.key === cur).children;
          const schoolKeys = schools.map(school => school.key);
          Array.prototype.push.apply(pre, schoolKeys);
        } else {
          pre.push(cur);
        }
        return pre;
      }, []);
      this.onModelChange(selectedValues);
    }
  }

  detectChange() {
    this.cdr.markForCheck();
  }

}
