const fs = require('fs');
const path = require('path');
fs.readFile('angular.json', function (err, data) {
  if (err) {
    resolve();
    return console.error("angular.json不存在，请确保项目是否完整");
  }
  const configStr = data.toString();
  const configObj = JSON.parse(configStr)
  const projectName = Object.keys(configObj.projects)[0]
  const outputPath = path.resolve(configObj.projects[projectName].architect.build.options.outputPath, 'index.html');
  if (outputPath) {
    fs.readFile(outputPath, function (err, data) {
      if (err) {
        resolve();
        return console.error("入口文件index.html不存在");
      }
      const htmlStr = data.toString();
      const reg = /\"main-es5\.(.*?)\.js\"/g
      const regGetAjax = /\/\/getAjax\(\&\&\)/g
      const result = reg.exec(htmlStr);
      const getAjax = htmlStr.replace(regGetAjax, ('getAjax(' + result[0] + ')'));
      fs.writeFileSync(outputPath, getAjax)
    })
  }
})






