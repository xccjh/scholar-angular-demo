const OSS = require('ali-oss');
const fs = require('fs')
const path = require('path')

let dirPath = ''; // 项目跟目录

let client = new OSS({
  accessKeyId: 'xxx',
  accessKeySecret: 'xxx',
  endpoint: 'xxx'
});


function appointBuckets(bucket){
  client.useBucket(bucket);
}

async function listDir(dir) {

  const result = await client.list({
    prefix: dir ? `${dir}/` : '',
    delimiter: '/'
  })
  if (result.objects) {
    return result.objects.filter(obj => obj.size !== 0).map(obj => {
      return obj.name;
    });
  } else {
    return []
  }
}

async function deleteMulti(pathArr) {
  try {
    console.log(`开始删除远程文件：`);
    await client.deleteMulti(pathArr, {
      quiet: true
    });
    console.log(pathArr);
  } catch (e) {
    console.log(e);
  }
}

async function put(name, path) {
  try {
    //object-name可以自定义为文件名（例如file.txt）或目录（例如abc/test/file.txt）的形式，实现将文件上传至当前Bucket或Bucket下的指定目录。
    await client.put(name, path);
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

// 递归读取所有文件
function readFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    // 目录前缀
    const preDir = dir.replace(dirPath, '');

    var fullPath = {
      path: path.join(dir, item),
      name: item,
      preDir: preDir ? preDir.substr(1).split('\\').join('/') + '/' : preDir
    };
    const stat = fs.statSync(path.join(dir, item));
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList);  //递归读取文件
    } else {
      filesList.push(fullPath);
    }
  });
  return filesList;
}

// 获取本地所有文件，包括目录
function getAllFiles(dir) {
  dirPath = path.resolve(dir);
  console.log(`上传目录：${dirPath}`);
  const files = readFileList(dirPath);
  return files;
}

// 只获取文件
function getFiles(dir) {
  let dirPath = path.resolve(dir);
  console.log(`上传目录：${dirPath}`);
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  return files.filter(ele => ele.isFile()).map(ele => {
    return {
      name: ele.name,
      path: path.resolve(dir, ele.name),
      preDir: ''
    }
  })
}

async function uploadOssProd(dir, uploadDIr, uploadAll) {
  const objs = await listDir(dir);
  if (objs.length !== 0) {
    await deleteMulti(objs);
  }

  const files = uploadAll ? getAllFiles(uploadDIr) : getFiles(uploadDIr);
  const fileLen = files.length;
  const failFiles = [];
  const formatDir = `${dir}/`;
  console.info('开始上传本地文件');
  for (let i = 0; i < fileLen; i++) {
    const isSuccess = await put(`${formatDir}${files[i].preDir || ''}${files[i].name}`, files[i].path);
    if (!isSuccess) {
      failFiles.push(files[i]);
    } else {
      console.log(`成功上传文件：${files[i].path}`);
    }
  }

  if (failFiles.length === 0) {
    console.info("全部文件上传成功");
    recordLog(dir);
  } else {
    console.error(failFiles);
    throw new Error("上传失败");
  }
}

// 记录发布日志
function recordLog(ossDir) {
  // 异步读取
  fs.open('release.log', 'a', function(err, fd) {
    if (err) {
      return console.error('文件打开失败' + err);
    }
    const nowTime = new Date().toLocaleString();
    fs.appendFile('release.log', `${ossDir}  发布，时间：${nowTime}\r\n`, function () {
      fs.close(fd, () => {})
    });
  });
}

async function setReleaseTime(dir) {
  const entryPath = path.resolve(dir, 'index.html');
  return new Promise((resolve, reject) => {
    fs.readFile(entryPath, function (err, data) {
      if (err) {
        resolve();
        return console.error('入口文件index.html不存在');
      }
      const htmlStr = data.toString();
      const nowTime = new Date().toLocaleString();
      if (htmlStr.match(RegExp(/<html __QKC_VER__=/))) { // 已存在版本号
        fs.writeFileSync(entryPath, htmlStr.replace(/__QKC_VER__="[^"]*"/g, `__QKC_VER__="${nowTime}"`));
      } else {
        const formatHtmlStr = htmlStr.split('<html').join(`<html __QKC_VER__="${nowTime}"`);
        fs.writeFileSync(entryPath, formatHtmlStr);
      }
      resolve();
    });
  })
}

async function main(){
  const arr = process.argv.splice(2);
  const bucket = arr[0].split("=")[1];
  const ossDir = arr[1].split("=")[1] || '';
  const buildDir = arr[2].split("=")[1];
  const uploadAll = arr.includes('all') || arr.includes('ALL') || arr.includes('All');
  if (!bucket || !ossDir || !buildDir) {
    throw new Error("参数出错");
  }
  await setReleaseTime(buildDir);
  appointBuckets(bucket);
  uploadOssProd(ossDir, buildDir, uploadAll);
}

main();
