const express = require("express");
// const proxy = require('http-proxy-middleware');
const history = require('connect-history-api-fallback');
const app = express();
const https = require("https");
const path = require("path");
const fs = require("fs");
const PORT = 8888;
const privateKey = fs.readFileSync(path.join(__dirname, "./private.key"), "utf8");
const certificate = fs.readFileSync(path.join(__dirname, "./file.crt"), "utf8");
const credentials = {key: privateKey, cert: certificate};
const server = https.createServer(credentials, app);
const httpsArgv = process.argv.slice(2)[0];
const flag = httpsArgv && httpsArgv.split('=')[1];
const serverInstance = flag ? server : app;
const protocol = flag ? 'https' : 'http';
// 路径以 '/api' 的配置
// const apiProxy = proxy('/api/**', {
//   target: "http://localhost:3000",
//   changeOrigin: true,
//   pathRewrite: {
//     "^/api": ""

//   }
// });
//
// 路径以 '/' 的配置
// const apiProxy = proxy('/**', {
//   target: "http://localhost:3000",
//   changeOrigin: true
// });
// app.use(apiProxy);
// serverInstance.use(history({
//   verbose: true,
//   index: '/scholar'
// }))
// app.use('/history',express.static("history/ky-scholar-web"));
app.use(express.static('dist/ky-student-h5'));
// app.use('/scholar',express.static("dist/ky-scholar-web"));
// app.use('/viewer',express.static("build"));
// serverInstance.get("/scholar", function(req, res) {
//   res.sendFile(path.join(__dirname, "dist1/ky-scholar-web/index.html"))
// })
// serverInstance.get("/viewer", function(req, res) {
//   res.sendFile(path.join(__dirname, "build/index.html"))
// })
// serverInstance.get("/history", function(req, res) {
//   res.sendFile(path.join(__dirname, "build/index.html"))
// })



serverInstance.listen(PORT, function (err) {
  if (err) {
    console.log("err :", err);
  } else {
    console.log("Listen at " + protocol + "://localhost:" + PORT);
    console.log("Listen at " + protocol + "://ky.qicoursezjh.com:" + PORT);
  }
});





