import {Json, AtrFormOpt, PacketInfo} from '../base/common';
import {NzTreeNodeOptions} from 'ng-zorro-antd';
import {SimpleChange} from '@angular/core';
import {environment} from 'src/environments/environment';
import {Observable, Subscriber, timer} from 'rxjs';


export class ToolsUtil {
  static ossPrefix = environment.OSS_URL;

  static cacheOrgCode = '';

  /**
   * 从问号里拿orgCode，/?qkc#/
   */
  static getOrgCodeFromQuestionMark = () => {
    const hrefs = window.location.href.split('?');
    if (hrefs.length >= 2) {
      const paramStr = hrefs[1];
      // 参数字符串里有没带 =?/#
      let orgCode = paramStr.split('=')[0];
      orgCode = orgCode.split('?')[0];
      orgCode = orgCode.split('/')[0];
      orgCode = orgCode.split('#')[0];
      orgCode = orgCode.split('/')[0];
      return orgCode;
    } else {
      return '';
    }
  };


  static getProdId(fn) {
    const codeUid = localStorage.getItem('SCHOLAR_CODEUID_' + this.getOrgCode());
    if (codeUid) {
      fn(codeUid);
    } else {
      timer(100).subscribe(() => {
        this.getProdId(fn);
      });
    }
  }

  static async getProdIdSync() {
    return new Promise((resolve) => {
      this.getProdId((proId) => {
        resolve(proId);
      });
    });
  }

  static createCacheKey(prefix: string) {
    return `SCHOLARST_${prefix}_${ToolsUtil.getOrgCode()}`;
  }


  static getTwoWords(str) {
    if (str && str.replace(/[\u4e00-\u9fa5]/g, 'aa').length > 60) {
      return str.substring(0, 50) + '...';
    } else {
      return str || '--';
    }
  }


  static getMaxSeq(arr) {
    if (!arr) {
      return 0;
    }
    let max = 0;
    arr.forEach(item => {
      if (item.seq > max) {
        max = item.seq;
      }
    });
    return max + 1;
  }


  static watchTool = (watchObj = {}, watchKey = 'flag', initState = false, callback = (val) => val) => {
    let watchFlag = initState;
    Object.defineProperty(watchObj, watchKey, {
      get() {
        return watchFlag;
      },
      set(val) {
        watchFlag = val;
        callback(val);
      }
    });
  };

  static getAjax = (url, data?) => {
    return new Observable<any>((observer: Subscriber<any>) => {
      // XMLHttpRequest对象用于在后台与服务器交换数据
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        // readyState == 4说明请求已完成
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 304) {
            // 从服务器获得数据
            observer.next(xhr.responseText);
            observer.complete();
            // observer.unsubscribe();
          } else {
            observer.next('题库服务异常');
            observer.complete();
            // observer.unsubscribe();
          }
        }
      };
      let urls = url;
      if (data) {
        urls += '?' + queryParam(data);
      }
      xhr.open('GET', urls, true);
      xhr.send();
    });
  };


  static postAjax = (url, data, contentType = {'Content-Type': 'application/x-www-form-urlencoded'}) => {
    return new Observable<any>((observer: Subscriber<any>) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      // 添加http头，发送信息至服务器时内容编码类型
      contentType = {...{'Content-Type': 'application/x--form-urlencoded'}, ...contentType};
      Object.keys(contentType).forEach((item => {
        xhr.setRequestHeader(item, contentType[item]);
      }));
      let params;
      if (contentType['Content-Type'] !== 'application/x-www-form-urlencoded') {
        params = JSON.stringify(data);
      } else {
        params = queryParam(data);
      }
      xhr.send(params);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 304) {
            observer.next(xhr.responseText);
            observer.complete();
            observer.unsubscribe();
          } else {
            observer.next('题库服务异常');
            observer.complete();
            observer.unsubscribe();
          }
        }
      };

    });
  };

  /**
   * 从子域名拿orgCode， qkc.xxxx.com
   */
  static getOrgCodeFromSubDN = () => {
    return location.host.split('.')[0];
  };

  static getOrgCode = () => {
    if (ToolsUtil.cacheOrgCode !== '') {
      return ToolsUtil.cacheOrgCode;
    }

    if (window['__WHO__'] && window['__WHO__'] === 'sys') {
      ToolsUtil.cacheOrgCode = 'cjsd';
    } else {
      const org = ToolsUtil.getOrgCodeFromQuestionMark();
      if (org === '') {
        // ToolsUtil.cacheOrgCode = ToolsUtil.getOrgCodeFromSubDN();
        // if (org === '') {
        ToolsUtil.cacheOrgCode = 'cjsd';
        // }
      } else {
        ToolsUtil.cacheOrgCode = org;
      }
    }
    return ToolsUtil.cacheOrgCode;
  };

  static getOssUrl(url: string) {
    if (!url) {
      return '';
    }
    if (url.startsWith('http')) {
      return url;
    }
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    return this.ossPrefix + url;
  }

  /**
   * 固定29位字符串
   */
  static getRandomFileName() {
    const timestimp = new Date().getTime().toString();
    const expect = 16;
    let str = Math.random().toString(36).substring(2);
    while (str.length < expect) {
      str += Math.random().toString(36).substring(2);
    }
    return str.substring(0, expect) + timestimp;
  }


  static getFileExt(fileName) {
    if (!fileName) {
      return '';
    }
    const index = fileName.lastIndexOf('.');
    const suffix = fileName.substr(index + 1);
    return suffix;
  }

  static getFileName(fileName) {
    if (!fileName) {
      return '';
    }
    const index = fileName.lastIndexOf('/');
    const suffix = fileName.substr(index + 1);
    return suffix;
  }

  static getHttpOptions(): any {
    return {isCommonHttpHeader: true};
  }


  static resetFormValue(opt: AtrFormOpt, json: Json): AtrFormOpt {
    for (const item of opt.items) {
      item.value = '';
      for (const key of Object.keys(json)) {
        if (json.hasOwnProperty(key) && json[key] != null && json[key] !== undefined && key === item.key) {
          if (item.type === 'date') {
            item.value = new Date(json[key]);
          } else if (item.type === 'dateTime') {
            item.value = new Date(json[key]);
          } else {
            item.value = json[key];
          }
        }
      }
    }
    return opt;
  }

  static getFormatDate(date: Date): string {
    const localTime = date.getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    const localOffset = date.getTimezoneOffset() * 60000; // 格林威治时间和本地时间之间的时差,单位分
    const utcTime = localTime + localOffset; // 已知本地时间，换算对应格林威治时间
    const curTime = utcTime + (3600000 * 8); // 换算东八区时间
    date.setTime(curTime);

    let month: string | number = date.getMonth() + 1;
    let strDate: string | number = date.getDate();

    if (month <= 9) {
      month = '0' + month;
    }

    if (strDate <= 9) {
      strDate = '0' + strDate;
    }
    return date.toLocaleTimeString();
  }


  static transformNzTreeNodeOptions(trees: NzTreeNodeOptions[], isFirst: boolean = true, practice = false, modify = {flag: false}
  ): NzTreeNodeOptions[] {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < trees.length; i++) {
      trees[i].title = trees[i].name;
      trees[i].cacheTitle = trees[i].name;
      trees[i].key = trees[i].id;
      trees[i].isEdit = false;

      if (trees[i].status === '2' || trees[i].status === '3') {
        modify.flag = true;
      }


      switch (trees[i].kType) {
        case '1':
          trees[i].iconBtn = {add: true, edit: false, del: false};
          break;

        case '2':

          trees[i].iconBtn = {add: true, edit: true, del: true};
          break;

        case '3':
          trees[i].iconBtn = {add: true, edit: true, del: true};
          break;

        case '4':
          trees[i].iconBtn = {add: false, edit: true, del: true};
          break;

        default:
          trees[i].iconBtn = {add: true, edit: true, del: true};
          break;
      }

      if (isFirst) {
        trees[i].expanded = true;
        if (practice) {
          trees[i].iconBtn = {add: true, edit: false, del: false};
        }
      } else {
        if (practice) {
          trees[i].iconBtn = {add: false, edit: true, del: true};
        }
      }

      if (practice) {
        if (trees[i].industrys && trees[i].industrys.length > 0) {
          this.transformNzTreeNodeOptions(trees[i].industrys, false, practice, modify);
        } else {
          trees[i].isLeaf = true;
        }
      } else {
        if (trees[i].children && trees[i].children.length > 0) {
          this.transformNzTreeNodeOptions(trees[i].children, false, practice, modify);
        } else {
          trees[i].isLeaf = true;
        }
      }
    }
    return trees;
  }


  static transformLabelTree(trees: any[]): any[] {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < trees.length; i++) {
      trees[i].name = trees[i].tagName;
      trees[i].selectedItems = [];
      if (trees[i].child && trees[i].child.length > 0) {
        this.transformLabelTree(trees[i].child);
      }
    }
    return trees;
  }

  static diffInput(chng: SimpleChange, action: () => void): void {
    if (chng === undefined) {
      return;
    }

    const cur = JSON.stringify(chng.currentValue);
    const prev = JSON.stringify(chng.previousValue);
    if (cur !== prev) {
      action();
    }
  }

  static getExt(name: string): string {
    if (!name || typeof (name) !== 'string') {
      return '';
    }

    let suffix = '';
    try {
      const flieArr = name.split('.');
      suffix = flieArr[flieArr.length - 1];
    } catch (err) {
      suffix = '';
    }
    return suffix.toLocaleLowerCase();
  }

  static isMP3(ext: string) {
    return /mp3/.test(ext);
  }

  // 判断文件类型
  static getFileType(fileName): any {
    // 获取类型结果
    let result: any = '';
    const suffix = this.getExt(fileName);
    // fileName无后缀返回 false
    if (!suffix) {
      return false;
    }

    // 图片格式
    const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
    // 进行图片匹配
    result = imglist.find(item => item === suffix);
    if (result) {
      return 'image';
    }
    // 匹配txt
    const txtlist = ['txt'];
    result = txtlist.find(item => item === suffix);
    if (result) {
      return 'txt';
    }
    // 匹配 excel
    const excelist = ['xls', 'xlsx'];
    result = excelist.find(item => item === suffix);
    if (result) {
      return 'excel';
    }
    // 匹配 word
    const wordlist = ['doc', 'docx'];
    result = wordlist.find(item => item === suffix);
    if (result) {
      return 'word';
    }
    // 匹配 pdf
    const pdflist = ['pdf'];
    result = pdflist.find(item => item === suffix);
    if (result) {
      return 'pdf';
    }
    // 匹配 ppt
    const pptlist = ['ppt', 'pptx'];
    result = pptlist.find(item => item === suffix);
    if (result) {
      return 'ppt';
    }
    // 匹配 视频
    const videolist = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v'];
    result = videolist.find(item => item === suffix);
    if (result) {
      return 'video';
    }
    // 匹配 音频
    const radiolist = ['mp3', 'wav', 'wmv'];
    result = radiolist.find(item => item === suffix);
    if (result) {
      return 'radio';
    }
    // 其他 文件类型
    return 'other';
  }

  static isPicture(path: string) {
    const suffix = this.getExt(path);
    return /(jpg|jpeg|png)$/.test(suffix);
  }

  static isDoc(path: string) {
    const suffix = this.getExt(path);
    return /(doc|docx)$/.test(suffix);
  }

  static isExl(path: string) {
    const suffix = this.getExt(path);
    return /(xls|xlsx)$/.test(suffix);
  }

  static isPPT(path: string) {
    const suffix = this.getExt(path);
    return /(ppt|pptx)$/.test(suffix);
  }

  static isPdf(path: string) {
    const suffix = this.getExt(path);
    return /pdf$/.test(suffix);
  }

  static isVideo(ext: string) {
    const suffix = this.getExt(ext);
    return /mp4|m2v|mkv|rmvb|wmv|avi|flv|mov/.test(suffix);
  }

  static getThumbUrl(path: string) {
    if (!path) {
      return '';
    }
    // 后缀获取
    const suffix = this.getExt(path);
    if (this.isPicture(suffix)) {
      return environment.OSS_URL + path;
    } else if (this.isDoc(suffix)) {
      return environment.OSS_URL + '/common/doc.png';
    } else if (this.isExl(suffix)) {
      return environment.OSS_URL + '/common/excel.png';
    } else if (this.isPPT(suffix)) {
      return environment.OSS_URL + '/common/ppt.png';
    } else if (this.isPdf(suffix)) {
      return environment.OSS_URL + '/common/pdf.png';
    } else if (this.isVideo(suffix)) {
      return environment.OSS_URL + '/common/video.png';
    } else {
      return '';
    }
  }

  // 合并排序
  static compare(prop) {
    return (obj1, obj2) => {
      const val1 = obj1[prop];
      const val2 = obj2[prop];
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    };
  }

  // 下载文件
  // static downLoadFile(url) {
  //   if (!url) {
  //     return console.log('无效连接');
  //   }
  //   const ele = document.createElement('iframe') as HTMLIFrameElement;
  //   ele.src = url;
  //   ele.width = '0px';
  //   ele.height = '0px';
  //   ele.style.display = 'none';
  //   document.body.appendChild(ele);
  // }


}


export const parseToObject = (queryString) => {
// 使用 & 符号将查询字符串分割开
  const parts = queryString.split('&');
// 遍历所有的 "key=value" 字符串结构
  const obj = {};
  for (let i = 0, len = parts.length; i < len; i++) {
// 使用 = 将 "key=value" 字符串分割开
    const arr = parts[i].split('=');
// = 号前的内容是对象的属性名，= 号后的内容是对应属性的值
    const name = arr.shift();
    const value = arr.join('=');
// 将属性添加到对象中
    obj[name] = value;
  }
// 返回创建好的对象
  return obj;
};


export const cleanArray = (actual) => {
  const newArray = [];
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
};
export const queryParam = (json) => {
  if (!json) {
    return '';
  }
  return cleanArray(Object.keys(json).map(key => {
    if (json[key] === undefined) {
      return '';
    }
    return encodeURIComponent(key) + '=' +
      encodeURIComponent(json[key]);
  })).join('&');
};

export const queryParamNe = (json) => {
  if (!json) {
    return '';
  }
  return cleanArray(Object.keys(json).map(key => {
    if (json[key] === undefined) {
      return '';
    }
    return (key) + '=' +
      (json[key]);
  })).join('&');
};

// tslint:disable
function Binary(initData?, pp?, lp?, blp?) {
  // @ts-ignore
  let data = initData && initData.constructor == Array ? initData.slice() : [],
    p = pp | 0,
    l = lp | 0,
    bl = Math.max((blp || 8) | 0, 1),
    mask = m(bl),
    _m = 0xFFFFFFFF; // 数据，指针，长度，位长度，遮罩
  this.data = function(index, value) {
    if (!isNaN(value)) {
      data[index] = (value | 0) || 0;
    }
    if (!isNaN(index)) {
      return data[index];
    } else {
      return data.slice();
    }
  };

  this.read = function() {
    let re;
    if (p >= l) {
      return 0;
    }
    if (32 - (p % 32) < bl) {
      re = (((data[p >> 5] & m(32 - (p % 32))) << ((p + bl) % 32)) | (data[(p >> 5) + 1] >>> (32 - ((p + bl) % 32)))) & mask;
    } else {
      re = (data[p >> 5] >>> (32 - (p + bl) % 32)) & mask;
    }
    p += bl;
    return re;
  };

  this.write = function(i) {
    var i, hi, li;
    i &= mask;
    if (32 - (l % 32) < bl) {
      data[l >> 5] |= i >>> (bl - (32 - (l % 32)));
      data[(l >> 5) + 1] |= (i << (32 - ((l + bl) % 32))) & _m;
    } else {
      data[l >> 5] |= (i << (32 - ((l + bl) % 32))) & _m;
    }
    l += bl;
  };

  this.eof = function() {
    return p >= l;
  };

  this.reset = function() {
    p = 0;
    mask = m(bl);
  };
  this.resetAll = function() {
    data = [];
    p = 0;
    l = 0;
    bl = 8;
    mask = m(bl);
    _m = 0xFFFFFFFF;
  };

  this.setBitLength = function(len) {
    bl = Math.max(len | 0, 1);
    mask = m(bl);
  };

  this.toHexString = function() {
    let re = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] < 0) {
        re.push(pad((data[i] >>> 16).toString(16), 4) + pad((data[i] & 0xFFFF).toString(16), 4));
      } else {
        re.push(pad(data[i].toString(16), 8));
      }
    }
    return re.join('');
  };

  this.toBinaryString = function() {
    let re = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i] < 0) {
        re.push(pad((data[i] >>> 1).toString(2), 31) + (data[i] & 1));
      } else {
        re.push(pad(data[i].toString(2), 32));
      }
    }
    return re.join('').substring(0, l);
  };

  this.toCString = function() {
    let _p = p,
      _bl = bl,
      re = [];
    this.setBitLength(13);
    this.reset();
    while (p < l) {
      re.push(C(this.read()));
    }
    this.setBitLength(_bl);
    p = _p;
    return C(l >>> 13) + C(l & m(13)) + re.join('');
  };

  this.fromCString = function(str) {
    this.resetAll();
    this.setBitLength(13);
    for (let i = 2; i < str.length; i++) {
      this.write(D(str, i));
    }
    l = (D(str, 0) << 13) | (D(str, 1) & m(13));
    return this;
  };

  this.clone = function() {
    return new Binary(data, p, l, bl);
  };

  function m(len) {
    return (1 << len) - 1;
  }

  function pad(s, len) {
    return (new Array(len + 1)).join('0').substring(s.length) + s;
  }

  function C(i) {
    return String.fromCharCode(i + 0x4e00);
  }

  function D(s, i) {
    return s.charCodeAt(i) - 0x4e00;
  }
}

// 压缩
export const lzw_compress = (strp) => {
  let b = new Binary(),
    code_index = -1,
    char_len = 8;
  let str = strp.replace(/[\u0100-\uFFFF]/g,
    function(s) {
      return '\&\#u' + pad(s.charCodeAt(0).toString(16), 4) + ';';
    });
  let dic = {},
    cp = [],
    cpi,
    bl = 8;
  b.setBitLength(bl);
  for (let i = 0; i < (1 << char_len) + 2; i++) {
    dic[i] = ++code_index;
  }
  cp[0] = str.charCodeAt(0);
  for (let i = 1; i < str.length; i++) {
    cp[1] = str.charCodeAt(i);
    cpi = (cp[0] << 16) | cp[1];
    if (dic[cpi] == undefined) {
      dic[cpi] = (++code_index);
      if (cp[0] > m(bl)) {
        b.write(0x80);
        b.setBitLength(++bl);
      }
      b.write(cp[0]);
      cp[0] = cp[1];
    } else {
      cp[0] = dic[cpi];
    }
  }
  b.write(cp[0]);

  function pad(s, len) {
    return (new Array(len + 1)).join('0').substring(s.length) + s;
  }

  function m(len) {
    return (1 << len) - 1;
  }

  return b.toCString();
};

// 解压
export const lzw_decompress = (s) => {
  let b = new
  function() {
    let d = [],
      p = 0,
      l = 0,
      L = 13,
      k = m(L),
      _m = 0xFFFFFFFF;
    this.r = function() {
      let r;
      if (32 - (p % 32) < L) {
        r = (((d[p >> 5] & m(32 - (p % 32))) << ((p + L) % 32)) | (d[(p >> 5) + 1] >>> (32 - ((p + L) % 32)))) & k;
      } else {
        r = (d[p >> 5] >>> (32 - (p + L) % 32)) & k;
      }
      p += L;
      return r;
    };
    this.w = function(i) {
      i &= k;
      if (32 - (l % 32) < L) {
        d[l >> 5] |= i >>> (L - (32 - (l % 32)));
        d[(l >> 5) + 1] |= (i << (32 - ((l + L) % 32))) & _m;
      } else {
        d[l >> 5] |= (i << (32 - ((l + L) % 32))) & _m;
      }
      l += L;
    };
    this.e = function() {
      return p >= l;
    };
    this.l = function(len) {
      L = Math.max(len | 0, 1);
      k = m(L);
    };

    function m(len) {
      return (1 << len) - 1;
    }

    function pad(s, l) {
      return (new Array(l + 1)).join('0').substring(s.length) + s;
    }

    for (let i = 2; i < s.length; i++) {
      this.w(s.charCodeAt(i) - 0x4e00);
    }
    l = ((s.charCodeAt(0) - 0x4e00) << 13) | ((s.charCodeAt(1) - 0x4e00) & m(13));
    p = 0;
  };
  let R = [],
    C = -1,
    D = {},
    P = [],
    L = 8;
  for (let i = 0; i < (1 << L) + 2; i++) {
    D[i] = String.fromCharCode(++C);
  }
  b.l(L);
  P[0] = b.r();
  while (!b.e()) {
    P[1] = b.r();
    if (P[1] == 0x80) {
      b.l(++L);
      P[1] = b.r();
    }
    if (D[P[1]] == undefined) {
      D[++C] = D[P[0]] + D[P[0]].charAt(0);
    } else {
      D[++C] = D[P[0]] + D[P[1]].charAt(0);
    }
    R.push(D[P[0]]);
    P[0] = P[1];
  }
  R.push(D[P[0]]);
  return R.join('').replace(/\&\#u[0-9a-fA-F]{4};/g,
    function(w) {
      return String.fromCharCode(parseInt(w.substring(3, 7), 16));
    });
};
// tslint:enable
