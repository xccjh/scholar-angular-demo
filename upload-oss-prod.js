let OSS = require("ali-oss");
// const AgentKeepAlive = require('agentkeepalive');
let remoteFileList = [];
let localFileArr = [];
let _localFileArr = [];
let batch = false;
let init = true;
let initCreate = true;
let step = 0;
let recordVersionBucket = ['qkc-file']
let bucket;
let ossDir;
let buildDir;
let type;
const dirCache = {};
const batchNumber = 200;
const fs = require("fs");
const path = require("path");
let client;

const getStdout = (cmd) => {
  return new Promise((resolve) => {
    const exec = require("child_process").exec;
    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        console.log("get stdout error:" + cmd);
        console.log(stderr);
        resolve("");
      } else {
        resolve(stdout.replace(/^[\s\n\r]+|[\s\n\r]+$/, ""));
      }
    });
  });
};

// 获取commitId
async function getCommitId() {
  return getStdout("git rev-parse HEAD");
}

// 获取commit信息
async function getCommitInfo(commitId) {
  return getStdout(`git log --pretty=format:“%s” ${commitId} -1`);
}

// 获取分支名
async function getBranch() {
  return getStdout("git symbolic-ref --short -q HEAD");
}

// 获取作者
async function getCommitAuthor() {
  // return getStdout(`git log --pretty=format:“%an” ${commitId} -1`);
  return getStdout(`git config --global user.name`);
}

/*
	获取标准格式时间
	入参：date
	格式：new Date()
	出参：xx-xx-xx xx:xx:xx
*/
function getdate(date) {
  const year = date.getFullYear() - 1;
  const month =
    date.getMonth() + 1 < 10 ?
      "0" + (date.getMonth() + 1) :
      date.getMonth() + 1;
  const day =
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  const hours =
    date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const minutes =
    date.getMinutes() < 10 ?
      "0" + date.getMinutes() :
      date.getMinutes();
  const seconds =
    date.getSeconds() < 10 ?
      "0" + date.getSeconds() :
      date.getSeconds();
  let time =
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return time;
}

// 检查提交状态
function checkCommitStatus() {
  return getStdout("git status");
}

// 记录发布日志
async function recordLog(ossDir) {
  const commitId = await getCommitId();
  const branch = await getBranch();
  const commitInfo = await getCommitInfo(commitId);
  const author = await getCommitAuthor();
  return new Promise((resolve) => {
    // 异步读取
    fs.open("release-prod.log", "a", function (err, fd) {
      if (err) {
        console.log("全部上传完毕，但是记录版本历史失败");
        resolve();
        return console.error("文件打开失败" + err);
      }
      const nowTime = getdate(new Date());
      fs.appendFile("release-prod.log", `\r\n发布位置：${ossDir}，\r\n发布时间：${nowTime}，\r\n发布branch: ${branch}，\r\n发布commitId: ${commitId}，\r\n发布commit信息: ${commitInfo}，\r\n发布人:${author}\r\n`, function () {
        fs.close(fd, () => {
          console.log(nowTime)
          const exec = require("child_process").exec;
          const cmd = `git add . && git commit -m "本次${author}发版，时间:${nowTime}" && git push`;
          exec(cmd, function (err, stdout, stderr) {
            if (err) {
              console.log("get stdout error:" + cmd);
              console.log(stderr);
            } else {
              console.log('记录发布信息成功，请切回dev并入这次发布历史记录');
            }
            resolve()
          });
        });
        console.log("全部上传完毕");
      });
    });
  });
}

function setReleaseTime(dir) {
  const entryPath = path.resolve(dir, "index.html");
  return new Promise((resolve, reject) => {
    fs.readFile(entryPath, function (err, data) {
      if (err) {
        resolve();
        return console.error("入口文件index.html不存在");
      }
      const htmlStr = data.toString();
      const nowTime = new Date().toLocaleString();
      if (htmlStr.match(RegExp(/<html __QKC_VER__=/))) { // 已存在版本号
        fs.writeFileSync(entryPath, htmlStr.replace(/__QKC_VER__="[^"]*"/g, `__QKC_VER__="${nowTime}"`));
      } else {
        const formatHtmlStr = htmlStr.split("<html").join(`<html __QKC_VER__="${nowTime}"`);
        fs.writeFileSync(entryPath, formatHtmlStr);
      }
      resolve();
    });
  });
}

// 设置上传分区
function appointBuckets(bucket) {
  client.useBucket(bucket);
}

// 追加文件到上传列表
async function put(name, path) {
  try {
    await client.put(name, path);
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

// 顺序执行数组中的所有异步函数
function runArrFunc(arr, start = 0) {
  if (start > arr.length || start < 0) {
    return;
  } // 参数start不能超过    arr.length，不能为负数
  var next = function (i) {
    if (i < arr.length) {
      var fn = arr[i];
      fn().then(res => {
        i++;
        next(i);
      });
    }
  };
  next(start);
}

// 间隔固定时间顺序执行数组中的所有异步函数
function runArrFuncDelay(arr, start = 0) {
  if (start > arr.length || start < 0) {
    return;
  } // 参数start不能超过    arr.length，不能为负数
  var next = function (i) {
    if (i < arr.length) {
      var fn = arr[i];
      fn().then(res => {
        i++;
        var timer = setTimeout(() => {
          clearTimeout(timer);
          next(i);
        }, 500);
      });
    }
  };
  next(start);
}

// 创建本地文件夹,支持递归
function mkdir(filepath) {
  return new Promise((resolve) => {
    const arr = filepath.split("/");
    let dir = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (!dirCache[dir] && !fs.existsSync(dir)) {
        dirCache[dir] = true;
        fs.mkdirSync(dir);
      }
      dir = dir + "/" + arr[i];
    }
    resolve("success");
  });
}

// 递归获取远程文件列表只有一级不包含目录
async function listDirFirst(dir) {
  const result = await client.list({
    prefix: dir ? `${dir}/` : "",
    delimiter: "/",
  });
  if (result.objects) {
    return result.objects.filter(obj => obj.size !== 0).map(obj => {
      return obj.name;
    });
  } else {
    return [];
  }
}

// 递归获取远程文件列表,包含目录
async function listDir(dir, cb) {
  // 获取子级目录
  // const result = await client.list({
  //     prefix: dir,
  //     delimiter: '/'
  //   });
  //   result.prefixes.forEach(subDir => {
  //     console.log('SubDir: %s', subDir);
  //   });
  // 获取子级文件
  // const result = await client.list({
  //     prefix: dir ? `${dir}/` : '',
  //     delimiter: '/'
  //   })
  //   if (result.objects) {
  //     var _result=result.objects.map(obj => {
  //       return obj.name;
  //     });
  //     console.log('Subfile: %s', _result);
  //     return _result
  //   } else {
  //     return []
  //   }
  // 获取不为空的子级文件
  // const result = await client.list({
  //     prefix: dir ? `${dir}/` : '',
  //     delimiter: '/'
  // })
  // if (result.objects) {
  //     return result.objects.filter(obj => obj.size !== 0).map(obj => {
  //         return obj.name;
  //     });
  // } else {
  //     return []
  // }
  step++;
  let resultfile = await client.list({
    prefix: (dir && dir !== "." && dir !== "./") ? `${dir}/` : "",
    delimiter: "/",
  });
  if (resultfile.objects) {
    resultfile.objects.forEach((e) => {
      remoteFileList.push(e.name);
    });
  }
  if (resultfile && resultfile.prefixes && resultfile.prefixes.length) {
    resultfile.prefixes.forEach(subDir => {
      listDir(subDir.substr(0, subDir.length - 1), cb);
    });
  }
  step--;
  if (step == 0) {
    // console.log(remoteFileList.filter((e)=>{
    //     return e.charAt(e.length - 1)!='/';
    // }))
    // cb && cb(remoteFileList.filter((e) => {
    //     return e.charAt(e.length - 1) != '/';
    // }))
    cb && cb(remoteFileList);
  }
}

// 递归获取远程文件列表,去除目录
async function listNoDir(dir, cb) {
  step++;
  let resultfile = await client.list({
    prefix: (dir && dir !== "." && dir !== "./") ? `${dir}/` : "",
    delimiter: "/",
  });
  if (resultfile && resultfile.objects) {
    resultfile.objects.forEach((e) => {
      remoteFileList.push(e.name);
    });
  }
  if (resultfile && resultfile.prefixes && resultfile.prefixes.length) {
    resultfile.prefixes.forEach(subDir => {
      listNoDir(subDir.substr(0, subDir.length - 1), cb);
    });
  }
  step--;
  if (step == 0) {
    cb && cb(remoteFileList.filter((e) => {
      return e.charAt(e.length - 1) != "/";
    }));
  }
}

// 递归获取本地文件列表(没有目录)
function getFiles(dir) {
  let dirPath = path.resolve(dir);
  if (init) {
    console.log(`上传目录：${dirPath}`);
    init = false;
  }
  const files = fs.readdirSync(dirPath, {withFileTypes: true});
  // console.log(files);
  files.forEach((ele, index) => {
    var _src = dir + "/" + ele.name;
    var stats = fs.statSync(_src);
    if (stats.isFile()) {
      localFileArr.push({
        name: ele.name,
        path: path.resolve(dir, ele.name),
      });
    } else if (stats.isDirectory()) { //是目录则 递归
      getFiles(_src, localFileArr);
    }
  });
}

// 递归获取本地文件列表(有目录)
function getFilesAndRoot(dir) {
  let dirPath = path.resolve(dir);
  if (init) {
    console.log(`上传目录：${dirPath}`);
    init = false;
  }

  const files = fs.readdirSync(dirPath, {withFileTypes: true});
  // console.log(files);
  files.forEach((ele, index) => {
    var _src = dir + "/" + ele.name;
    var stats = fs.statSync(_src);
    // console.log(stats,'-----------');
    // console.log(dir + '/' + ele.name,'-----------');
    if (stats.isFile()) {
      localFileArr.push({
        name: ele.name,
        path: path.resolve(dir, ele.name),
      });
    } else if (stats.isDirectory()) { //是目录则 递归
      localFileArr.push({
        name: undefined,
        path: path.resolve(dir, ele.name),
      });
      getFilesAndRoot(_src, localFileArr);
    }
  });
}

// 批量删除远程文件
async function deleteMulti(pathArr) {
  try {
    console.log(`开始删除远程文件：`);
    await client.deleteMulti(pathArr, {
      quiet: true,
    });
    console.log(pathArr);
    console.log("删除完成");
  } catch (e) {
    console.log(e);
  }
}

// 递归批量上传本地文件
async function uploadOSS(dir, uploadDIr) {
  if (uploadDIr.indexOf(".") > -1 && uploadDIr !== "." && uploadDIr !== "./") {
    //本地单文件上传
    console.info("开始上传本地文件：");
    await put(`${dir}/${uploadDIr}`, uploadDIr);
    console.log(`成功上传文件：${uploadDIr}到远程位置：${dir}/`);
  } else {
    if (dir === "." || dir === "./") {
      await realUpload(dir, uploadDIr, true);
    } else {
      if (dir.indexOf("./") === 0) {
        dir = dir.substr(2);
      }
      await realUpload(dir, uploadDIr);
    }
  }
}

async function realUpload(dir, uploadDIr, flag) {
  // console.log(localFileArr, '-------------');
  let fileLen;
  if (batch) {
    fileLen = localFileArr.length > batchNumber ? batchNumber : localFileArr.length;
  } else {
    fileLen = localFileArr.length;
  }
  const failFiles = [];
  // const formatDir = `${dir}/`;
  console.info("开始上传本地文件");
  // let _dir = dir + '/' + uploadDIr + '/';
  let _dir = dir + "/";
  if (flag) {
    _dir = _dir.substr(2);
  }
  if (initCreate) {
    await put(_dir, __filename);
    console.log("成功创建远程文件夹：" + _dir);
    initCreate = false;
  }

  for (let i = 0; i < fileLen; i++) {
    let isSuccess;
    // let _path = dir + '/' + uploadDIr + '/' + path.relative(uploadDIr, `${localFileArr[i].path}`).split(path.sep).join('/');
    let _path = dir + "/" + path.relative(uploadDIr, `${localFileArr[i].path}`).split(path.sep).join("/");
    if (flag) {
      _path = _path.substr(2);
    }
    if (localFileArr[i].name) {
      isSuccess = await put(_path, localFileArr[i].path);
      if (!isSuccess) {
        failFiles.push(localFileArr[i]);
      } else {
        console.log(`成功上传文件：${localFileArr[i].path}到远程地址：` + _path);
      }
    } else {
      isSuccess = await put(_path + `/`, __filename);
      if (!isSuccess) {
        failFiles.push(localFileArr[i]);
      } else {
        console.log(`成功创建远程文件夹：` + _path + `/`);
      }
    }
  }
  if (failFiles.length === 0) {
    console.info(fileLen + 1 + "个文件上传处理成功");
  } else {
    console.error(failFiles);
    throw new Error("上传失败");
  }
}


// 递归批量下载远程文件
async function downOSS(ossDir, downPath, cb) {
  let AsyncArrFunc = [];
  await listDir(ossDir, async function (objs) {
    try {
      if (objs.length) {
        await mkdir(downPath + "/" + ossDir + "/");
        objs.forEach((e, i) => {
          // 如果是目录
          if (e.charAt(e.length - 1) == "/") {
            AsyncArrFunc.push(() => {
              let _e = e;
              let _downPath = downPath;
              return mkdir(_downPath + "/" + _e);
            });
          } else { // 下载远程文件
            AsyncArrFunc.push(() => {
              let _e = e;
              let _downPath = downPath;
              return client.get(_e, path.resolve(_downPath, _e));
            });
          }
        });
        cb && cb(AsyncArrFunc);
      }
    } catch (e) {
      console.log(e);
    }
  });
}

// 获取命令行参数
function getParameters() {
  const arr = process.argv.splice(2);
  if (arr.length < 3) {
    throw new Error("参数至少三个，指定远程存放地址，本地上传文件路径和操作模式");
  }
  bucket = arr[0];
  ossDir = arr[1] || "";
  buildDir = arr[2] || "dist";
  type = arr[3];
}

// 准备上传条件
function preparation() {
  return new Promise((resolve) => {
    getParameters();
    if (type === "upload") {
      setReleaseTime(buildDir).then(value => {
        getFilesAndRoot(buildDir);
        appointBuckets(bucket);
        _localFileArr = JSON.parse(JSON.stringify(localFileArr));
        resolve();
      });
    }
  });
}

// 数组分割成固定个数一组的小数组
function arrSpliceSmall(dataList, num) {
  let arr = [];
  let len = dataList.length;
  for (let i = 0; i < len; i += num) {
    arr.push(dataList.slice(i, i + num));
  }
  return arr;
}

/**
 * 创建有上限时钟636f70793231313335323631343130323136353331333431356662
 * @param  {int}   upperlimit       上限次数
 * @param  {int}   cycle            间隔时间
 * @param  {Function} _callback         回调函数
 * @param  {Function}   _completeCallback 执行完毕后调用的函数
 * @return {Object}                    返回一个时钟对象
 */
function createUpperLimitTime(_upperlimit, cycle, _callback, _completeCallback) {
  var successindex = 0;
  var timeobj;
  var upperlimit = _upperlimit;
  var callback = _callback || function () {
  };
  var completeCallback = _completeCallback || function () {
  };
  var extendCallback = function () {
    if (successindex >= upperlimit) {
      clearTimeout(timeobj);
      completeCallback(); // 完成后对时钟实例基本无需什么操作了，因此这里不提供也行
    } else {
      callback(timeobj); // 实际上这个回调函数是可以获得时钟实例的
      successindex++;
    }
  };
  timeobj = setInterval(extendCallback, cycle);
  return timeobj; // 返回这个时钟对象，可以作用于终止
}

function generateAnInstance() {
  client = new OSS({
    timeout: 6000000,
    accessKeyId: "xxx",
    accessKeySecret: "xxx",
    endpoint: "xxx",
  });
}

// 入口
async function main() {
  switch (type) {
    case undefined:
      type = buildDir;
      switch (type) {
        case "listdir":
          // 查看文件+目录
          await listDir(ossDir, function (data) {
            console.log(data);
          });
          break;
        case "listnodir":
          // 只查看文件
          await listNoDir(ossDir, function (data) {
            console.log(data);
          });
          break;
        case "del":
          // 删除文件
          if (ossDir.indexOf(".") > -1 && ossDir !== "." && ossDir !== "./") {
            await deleteMulti([ossDir]);
          } else {
            // 删除文件夹
            await listDir(ossDir, async function (data) {
              console.log(data);
              await deleteMulti(data);
            });
          }
          break;
      }
      break;
    case "download":
      // 下载
      await downOSS(ossDir, buildDir, function (data) {
        runArrFunc(data);
      });
      break;
    default:
      if (fs.existsSync(path.resolve(buildDir))) {
        //上传
        await uploadOSS(ossDir, buildDir);
      } else {
        console.log("目录不存在,请先构建");
      }
      break;
  }
}

// 批量
async function batchUpload() {
  await listDir(ossDir, async function (data) {
    console.log(data)
    // 删除原文件
    if(data.length !== 0) {
      await deleteMulti(data);
    }
    console.log('上传文件总个数：' + _localFileArr.length);
    const count = Math.ceil(_localFileArr.length / batchNumber);
    let i = 0;
    const _spliceArr = arrSpliceSmall(_localFileArr, batchNumber);
    // createUpperLimitTime( count,5000 ,function(){
    //     console.log('第'+(i+1)+'波上传');
    //     localFileArr=_spliceArr[i];
    //     batch=true;
    //     if(i==0){
    //         main();
    //     }else {
    //         generateAnInstance();
    //         appointBuckets(bucket);
    //         main();
    //     }
    //     i++;
    // },function(){
    // console.log('全部上传完毕');
    // });
    let _arr = [];
    for (let j = 0; j < count; j++) {
      _arr.push(async function () {
        let _j = i;
        console.log("第" + (_j + 1) + "波上传");
        localFileArr = _spliceArr[_j];
        batch = true;
        if (i == 0) {
          await main();
        } else {
          generateAnInstance();
          appointBuckets(bucket);
          await main();
        }
        i++;
      });
    }
    if (recordVersionBucket.indexOf(bucket) > -1) {
      _arr.push(function () {
        return recordLog(ossDir);
      });
    }
    runArrFuncDelay(_arr);
  });
}

// checkCommitStatus().then((status) => {
//   if (status.indexOf("Changes") < 0) {
    generateAnInstance();
    preparation().then(() => {
      batchUpload(); // 实现分批上传
    });
// main(); // 使用其他共功能请关闭batchUpload打开main
//   } else {
//     console.log("请前提交代码以做版本发布追踪");
//   }
// });


/*
* node upload-oss-extend.js <Bucket> <remotepath> [localpath] <operatType : del | upload | listdir | listnodir | download>
* 用法示例（分批,深度递归，支持文件,文件夹,./,.等，没有的目录和文件自动处理）：
* 删除远程文件夹bb下所有： node upload-oss.js xccjhzjh bb del
* 删除远程根目录所有下所有： node upload-oss.js xccjhzjh . del
* 查看远程文件夹bb下所有： node upload-oss.js xccjhzjh bb listdir
* 查看远程文件夹bb不包括文件夹： node upload-oss.js xccjhzjh bb listnodir
* 上传本地cc文件夹所有到远程文件夹bb： node upload-oss.js xccjhzjh bb cc upload
* 上传本地cc文件夹所有到远程文件夹bb： node upload-oss.js xccjhzjh bb ./cc upload
* 上传本地bb文件夹所有到远程根目录： node upload-oss.js xccjhzjh . bb upload
* 上传本地bb文件夹所有到远程根目录： node upload-oss.js xccjhzjh ./ bb upload
* 下载远程bb文件夹所有到本地文件夹cc： node upload-oss.js xccjhzjh bb cc download
* 下载远程aa文件夹所有到本地文件夹根目录： node upload-oss.js xccjhzjh aa ./ download
* 下载远程aa文件夹所有到本地文件夹根目录： node upload-oss.js xccjhzjh aa . download
 */
