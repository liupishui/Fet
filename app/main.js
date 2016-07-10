const electron = require('electron');
const fs = require('fs');
// Module to control application life.
const {
  app
} = electron;
// Module to create native browser window.
const {
  BrowserWindow
} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  var browserOptions = {
    title: 'Fet',
    frame: true,
    width: 818,
    resizable: false,
    height: 602,
    center: true,
    movable: true,
    icon:__dirname+'/img/icon.png'
  }
  /***窗口半透明效果
  const {
    systemPreferences
  } = require('electron');
  if (process.platform !== 'win32' || systemPreferences.isAeroGlassEnabled()) {
    browserOptions.transparent = true;
  }***/
  win = new BrowserWindow(browserOptions);
  win.setMenu(null);
  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}
var configFilePath = `${__dirname}/myConfig.json`;
app.on('ready', createWindow);
const {
  ipcMain
} = require('electron');
/***
app.on('browser-window-focus', (event, arg) => { //应用程序获得焦点时触发
  event.sender.send('browser-window-focus', '1');
})
app.on('browser-window-blur', (event, arg) => { //应用程序获得焦点时触发
  event.sender.send('browser-window-focus', '0');
})***/
const path = require("path");

function expandDir(pathName, callback) { //返回目录下的所有目录，执行callback
  //demo expandDir('c:/',function(obj){
  //obj=['c:/system','c:/document','c:/document/user','c:/document/user/libin']
  //})
  callback(pathName);
  fs.readdir(pathName, {
    encoding: 'utf8'
  }, function(err, data) {
    if (err) throw err;
    var t = data.length;

    function isPath(pathtemp, callback) {
      fs.stat(pathtemp, function(err, data) {
        if (data.isDirectory()) {
          callback(pathtemp);
        };
      });
    }
    while (t--) {
      pathNameNow = path.join(pathName, data[t]);
      isPath(pathNameNow, function(obj) {
        expandDir(obj, callback)
      });
    }
  });
}

function expandDirWp(pathname, callback) { //返回目录下的所有目录及目录相对与pathname的相对目录;常用场景，对那些只对当前文件夹下文件操作的api做进一步处理
  /***callback返回值
  { basePath: 'D:\\yule\\CY锛圴IP锛塡\Browser\\Data\\Default\\databases',
    absolutePath: '' }
  { basePath: 'D:\\yule\\CY锛圴IP锛塡\Browser\\Data\\Default\\databases\\http_www.kan7p.com_0',
    absolutePath: '\\http_www.kan7p.com_0' }
  { basePath: 'D:\\yule\\CY锛圴IP锛塡\Browser\\Data\\Default\\databases\\http_www.hao123.com_0',
    absolutePath: '\\http_www.hao123.com_0'}
  { basePath: 'D:\\yule\\CY锛圴IP锛塡\Browser\\Data\\Default\\databases\\chrome-extension_ibondkbfbabpofodd
  aofggfnpcldmafn_0',
    absolutePath: '\\chrome-extension_ibondkbfbabpofoddaofggfnpcldmafn_0' }
  { basePath: 'D:\\yule\\CY锛圴IP锛塡\Browser\\Data\\Default\\databases\\chrome-extension_oiplkfaidhjklglaj
  dpfehoagkmlcakh_0',
    absolutePath: '\\chrome-extension_oiplkfaidhjklglajdpfehoagkmlcakh_0' }
  { basePath: 'D:\\yule\\CY锛圴IP锛塡\Browser\\Data\\Default\\databases\\chrome-extension_dhdgffkkebhmkfjoj
  ejmpbldmpobfkfo_0',
    absolutePath: '\\chrome-extension_dhdgffkkebhmkfjojejmpbldmpobfkfo_0' }***/
  var pathnameOrg = pathname;
  expandDir(pathname, function(obj) {
    var objNow = {};
    objNow.basePath = obj;
    objNow.absolutePath = obj.substr(pathnameOrg.length);
    callback(objNow);
  })
}

function copyDir(srcPaths, destPaths, processNow) {
  var readDir = function(srcPath, destPath, callbackDir) {
    fs.readdir(srcPath, function(err, data) {
      var t = data.length;

      function isPath(pathtemp, destPathtemp, isCallBack, notCallBack) {
        fs.stat(pathtemp, function(err, data) {
          if(err){
            return;
          }
          if (data.isDirectory()) {
            isCallBack(pathtemp, destPathtemp);
          } else {
            notCallBack(pathtemp, destPathtemp);
          };
        });
      }
      while (t--) {
        var pathNameNow = path.join(srcPath, data[t]);
        isPath(pathNameNow, destPath, function(obj, obj2) {
            var pathAbsolute = obj.substr(srcPath.length);
            //console.log(pathAbsolute);
            if (pathAbsolute) {
              obj2 = path.join(obj2, pathAbsolute);
            }
            fs.mkdir(obj2, function(err, sucess) {
              //console.log(destPath);
              //console.log(destPath);
              //console.log(obj);
              readDir(obj, obj2, callbackDir);
              //console.log(err);
              // console.log(sucess);
            });
          },
          function(obj, obj2) {
            //console.log(obj2);
            var fileName = obj.substr(srcPath.length);
            var destPath = path.join(obj2, fileName);
            //console.log(obj2);
            //console.log(destPath);
            //console.log(path.join(destPath,pathAbsolute));
            //readable = fs.createReadStream(obj);
            //writable = fs.createWriteStream(destPath);
            //readable.pipe(writable);
            fs.readFile(obj, (err, dataFile) => {
              var optObj = {
                'srcPath': obj,
                'destPath': destPath,
                'data': dataFile,
                'write':true
              };
              if (callbackDir) {
                optObj = callbackDir(optObj);
              }
              if(optObj.write){
                fs.writeFile(optObj.destPath, optObj.data, (err) => {
                  optObj=null;
                });
              }
            })
          });
      }
    })
  }
  readDir(srcPaths, destPaths, function(obj) {
    if (processNow) {
      return processNow(obj)
    } else {
      return obj;
    };
  });
}
//图片压缩
function imgmin(srcPaths, destPaths) {
  //srcPaths原路径，destPaths目标路径
  //    imgmin(JSON.parse(arg)[JSON.parse(arg).length-1].path,JSON.parse(arg)[JSON.parse(arg).length-1].packagePath);
  //图片压缩
  const imagemin = require('imagemin');
  const imageminJpegRecompress = require('imagemin-jpeg-recompress');
    const imageminMozjpeg = require('imagemin-mozjpeg');
  const imageminJpegoptim = require('imagemin-jpegoptim');
  const imageminGifsicle = require('imagemin-gifsicle');
  const imageminPngquant = require('imagemin-pngquant');
  //console.log(JSON.parse(arg));
  expandDirWp(srcPaths, function(obj) {
    var srcPath = obj.basePath;
    var destPath = destPaths;
    if (obj.absolutePath) {
      destPath += obj.absolutePath;
    }
    imagemin([srcPath + "/*.jpg"], destPath, {use: [imageminMozjpeg({quality:96,tune:'PSNR'})]});
    imagemin([srcPath + '/*.png'], destPath, {use: [imageminPngquant({speed: 6})]});
    //console.log(obj);
    imagemin([srcPath + '/*.gif'], destPath, {
      use: [imageminGifsicle({
        optimizationLevel: 2
      })]
    }).then(
      //() => {
      //console.log('Images optimized');
      //}
    );

  });
}
//css压缩
const CleanCSS = require('clean-css');
//js压缩
const UglifyJS = require("uglify-js");
var CleanCSSObj = new CleanCSS();
const {
  shell
} = require('electron');
ipcMain.on('modifyConfig', (event, arg) => { //修改配置文件
  //shell.openExternal('https://github.com');
  fs.writeFile(configFilePath, arg, 'utf8', function(err) {
    if (err) throw err;
  });
  //shell.openItem(JSON.parse(arg)[JSON.parse(arg).length-1].path);
  return;
  //var rst=mainApp[arg](event);
  //console.log(arg);  // prints "ping"
  //console.log(rst);
  //event.sender.send('asynchronous-reply', 'sds');
});
const os = require('os');
ipcMain.on('shellOpenItem', (event, arg) => { //打开所在目录
  fs.stat(arg, (err, data) => {
    if (err) {
      event.sender.send('shellOpenItem', 1);
    } else {
      shell.openItem(arg);
    }
  });
})
const http = require('http');
const lpslib = require('lpslib');
ipcMain.on('openExternalAdd', (event, arg) => { //浏览器打开
  fs.readFile(configFilePath, 'utf8', function(err, data) {
    if (err) throw err;
    var dataArr = JSON.parse(data);
    var itemConf = dataArr[arg];
    shell.openExternal('http://' + itemConf.host + ':' + itemConf.port);
  })
})
var serverAll = [];
ipcMain.on('openExternal', (event, arg) => { //浏览器打开
  fs.readFile(configFilePath, 'utf8', function(err, data) {
    if (err) throw err;
    var dataArr = JSON.parse(data);
    var itemConf = dataArr[arg];
    var parseUrl = require('parseurl');
    if (itemConf.port) { //应该在server创建前关闭
      if (serverAll.length > 0) {
        for (var s in serverAll) {
          if (serverAll[s]['_connectionKey'].indexOf(itemConf.port) != -1) {
            serverAll[s].close(function(){serverAll[s]=null;serverAll.splice(s,1);});
          }
        }
      };
    }
    const server = http.createServer((req, res) => { //新建web服务器
      var serAddress = server.address();
      var parseUrlObj = parseUrl(req);
      var destPath = itemConf.path;
      parseUrlObj.pathname = decodeURIComponent(parseUrlObj.pathname);
      destPath = path.join(itemConf.path, parseUrlObj.pathname);
      if (!itemConf.scandir) {
        if (parseUrlObj.pathname.substr(parseUrlObj.pathname.length - 1) == '/') {
          destPath = path.join(itemConf.path, parseUrlObj.pathname, 'index.html');
        }
      }
      fs.readFile(destPath, function(err, data) {
        if (data) {
          var currentFileExtname = path.extname(destPath).toLowerCase();
          switch(currentFileExtname){
            case '.html':
            case '.htm':
              data = lpslib.replaceFileWithStr(data, itemConf.path);
              if(serAddress!=undefined){
                if(itemConf.preload){
                data += "<script>\r\n//文件变化刷新页面\r\nvar socketReload = new WebSocket('ws://" + serAddress.address + ":" + serAddress.port + "');\r\nsocketReload.onopen = function(event) { socketReload.send('I am the client and I\\'m listening!'); }\r\nsocketReload.onmessage = function(event) {socketReload.send('I am the client and I\\'m listening!');console.log(event);if(event.data.indexOf('modifyLiveReload:')==0){window.location.reload();} }\r\nsocketReload.onerror=function(event){console.log(event)};\r\n</script>";
                }
              }
              res.writeHead(200, {"Content-Type":"text/html"});
              res.write(data);
              res.end();
              break;
            case '.less':
              data = data instanceof Buffer ? data.toString() : data;
              var less = require('less');
              less.render(data,function(e,output){
                res.writeHead(200, {"Content-Type":"text/css"});
                res.write(output.css);
                res.end();
              });
              return;
            break;
            case '.styl':
              data = data instanceof Buffer ? data.toString() : data;
              var stylus = require('stylus');
              stylus(data)
                .include(require('nib').path)
                .include(itemConf.path+'/**')
                .render(function(err, css){
                res.writeHead(200, {"Content-Type":"text/css"});
                res.write(css);
                res.end();
              });
              return;
              break;
            case '.css':
              res.writeHead(200, {"Content-Type":"text/css"});
              res.write(data);
              res.end();
              break;
            case '.js':
              res.writeHead(200, {"Content-Type":"text/javascript"});
              res.write(data);
              res.end();
              break;
            case '.gif':
              res.writeHead(200, {"Content-Type":"image/gif"});
              res.write(data);
              res.end();
              break;
            case '.jpg':
              res.writeHead(200, {"Content-Type":"image/jpeg"});
              res.write(data);
              res.end();
              break;
            case '.png':
              res.writeHead(200, {"Content-Type":"image/png"});
              res.write(data);
              res.end();
              break;
            case '.ico':
              res.writeHead(200, {"Content-Type":"image/icon"});
              res.write(data);
              res.end();
              break;
            default:
              res.writeHead(200, {"Content-Type":"application/octet-stream"});
              res.write(data);
              res.end();
          }
        }
        if (err) {
          if (itemConf.scandir && (parseUrlObj.pathname.substr(parseUrlObj.pathname.length - 1) == '/')) {
            fs.readdir(path.join(itemConf.path, parseUrlObj.pathname), (err, data) => {
              var outputData = "<html><head><meta charset='utf8'/><style type='text/css'>body{background:#f1f1f1;padding:40px;}a{line-height:28px;color:#333;margin:0 6px;text-decoration:none;display:inline-block;white-space:nowrap;min-width:296px;}.path{color:#0470BB;}a:hover{text-decoration:underline;}.breadCrumb{border-bottom:1px solid #aaa;margin-bottom:10px;}.breadCrumb a{min-width:auto;padding:0 10px;margin:0;font:16px/32px Microsoft Yahei;}</style></head><body>";
              if (typeof(data) == 'undefined') {
                res.statusCode = 404;
                res.write('__404 !Page Not Found ' + path.join(itemConf.path, parseUrlObj.pathname));
                res.end();
                return;
              }
              //目录导航开始
              var pathSeparatorArr = parseUrlObj.pathname.split('/');
              pathSeparatorArr.shift();
              pathSeparatorArr.pop();
              var breadCrumb = "<div class='breadCrumb'><a href='/'><b style='font-size:30px;text-shadow:-1px 1px 1px #888;'>❖</b></a>>"
              var dirEach = '/';
              for (var x = 0; x < pathSeparatorArr.length; x++) {
                dirEach += pathSeparatorArr[x] + '/';
                breadCrumb += "<a href='" + dirEach + "'>" + pathSeparatorArr[x] + "</a>>";
              }
              outputData += breadCrumb + "</div>";
              //目录导航结束
              var t = data.length;
              var tOrg = t;
              var count = 0;
              if (t == 0) { //文件夹为空
                outputData += path.join(itemConf.path, parseUrlObj.pathname) + "文件夹为空</body></html>";
                res.write(outputData);
                res.end();
                return;
              }

              function isPath(pathtemp, pathName, isCallBack, notCallBack) {
                fs.stat(pathtemp, function(err, dataInner) {
                  count++;
                  if(dataInner){
                    if (dataInner.isDirectory()) {
                      isCallBack(pathName);
                    } else {
                      notCallBack(pathName);
                    };
                    if (count == tOrg) {
                      outputData += "</body></html>";
                      res.write(outputData);
                      res.end();
                    };
                  }
                });
              }
              while (t--) {
                isPath(path.join(itemConf.path, parseUrlObj.pathname, data[t]), path.join(parseUrlObj.pathname, data[t]), function(pathname) {
                  pathname = pathname.replace(/\\/g, '/');
                  outputData += "<a href='" + pathname + "/' class='path'>✉" + pathname.split('/')[pathname.split('/').length - 1] + "</a>";
                }, function(pathname) {
                  pathname = pathname.replace(/\\/g, '/');
                  outputData += "<a href='" + pathname + "' target='_blank'>" + pathname.substr(pathname.lastIndexOf('/') + 1) + "</a>";
                }, t)
              }
            });
          } else {
            res.statusCode = 404;
            res.write('__404 !Page Not Found ' + path.join(itemConf.path, parseUrlObj.pathname));
            res.statusCode = 404;
            res.end();
          };
        };
      });
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    // grab a random port.
    if (itemConf.port) {
      server.listen(itemConf.port, itemConf.host, (err) => {
        serverAll.push(server);
        address = server.address();
        shell.openExternal('http://' + itemConf.host + ':' + address.port);
      });
    } else {
      server.listen(0, itemConf.host, () => {
        serverAll.push(server);
        address = server.address();
        shell.openExternal('http://' + itemConf.host + ':' + address.port);
      });
    }
    var socketTemp = require('socket.temp'); //socket发送信息
    socketTemp.upgrad(server, function(data) { //文件变动通过socket发送信息
    });
    //监视文件变动
    if(itemConf.preload){
      var Gaze = require('gaze'); //监视文件变动
      Gaze([itemConf.path + "/**/*.css", itemConf.path + "/**/*.js", itemConf.path + "/**/*.html", itemConf.path + "/**/*.png", itemConf.path + "/**/*.jpg", itemConf.path + "/**/*.gif", itemConf.path + "/**/*.htm",itemConf.path + "/**/*.less"], function(err, watcher) {
        /***this.on('all', function(event, filepath) {
            console.log(filepath + ' was ' + event);
          });***/
        this.on('all', function(event, filepath) {
          //var rst = socketTemp.getList();
          //console.log(rst[rst.length-1]['datas'].toString());
          socketTemp.brocast('modifyLiveReload:' + filepath);
        });
      });
    };
    //监视文件变动结束
  });
})
ipcMain.on('packagePaper', (event, arg) => { //打包文件
  fs.readFile(configFilePath, 'utf8', function(err, data) {
    if (err) throw err;
    var configObj = JSON.parse(data);
    var itemConf = configObj[arg]; //打包文件配置
    if (itemConf.packagePath == '') {
      itemConf.packagePath = path.join(os.homedir(), itemConf.path.substr(path.dirname(itemConf.path).length));
      fs.mkdir(itemConf.packagePath, (err) => {});
    }
    //引入图片压缩
    const imagemin = require('imagemin');
    const imageminJpegRecompress = require('imagemin-jpeg-recompress');
    const imageminJpegoptim = require('imagemin-jpegoptim');
    const imageminMozjpeg = require('imagemin-mozjpeg');
    const imageminJpegtran = require('imagemin-jpegtran');
    const imageminGifsicle = require('imagemin-gifsicle');
    const imageminPngquant = require('imagemin-pngquant');
    const imageminOptipng = require('imagemin-optipng');
    const imageminPngcrush = require('imagemin-pngcrush');
    const imageminAdvpng = require('imagemin-advpng');
    //引入图片压缩结束
    shell.openItem(itemConf.packagePath);
    copyDir(itemConf.path, itemConf.packagePath, function(obj) {
      var currentFileExtname = path.extname(obj.destPath).toLowerCase();
      var currentFileDirname = path.dirname(obj.destPath);
      switch (currentFileExtname) {
        case '.html':
        case '.htm':
          obj.data = lpslib.replaceFileWithStr(obj.data, itemConf.path);
          require('jsdom').env(obj.data,(err,window)=>{//less时,替换link的href属性值的.less为.css
            var $=require('jquery')(window);
            $("link").each(function(){
              if($(this).attr('href')){
                var $that=$(this);
                $(this).attr('href',$that.attr('href').replace(/\.less/i,'_less.css'));
                $(this).attr('href',$that.attr('href').replace(/\.styl/i,'_styl.css'));
              }
            });
            obj.data=$("html").prop('outerHTML');
            if (itemConf.htmlBeautify) {//异步必须
              var beautify = require('js-beautify').html;
              obj.data = beautify(obj.data);
            };
            fs.writeFile(obj.destPath,obj.data,(err)=>{});
          });
          obj.write=false;
          break;
        case '.png':
          //imageminPngcrush()(obj.data).then((rst)=>{
           // fs.writeFile(obj.destPath,rst,function(){
           // });
          //})
          //imageminPngcrush()(obj.data).then((data)=>{
            //  fs.writeFile(obj.destPath,data);
          //});
          /***imagemin([obj.srcPath], currentFileDirname, {
              use: [imageminPngquant({
                speed: 6
              })]
            }).then(() => {
              //console.log('Images optimized');
            });***/
          obj.write=false;
          break;
          case '.gif':
          /***imagemin([obj.srcPath], currentFileDirname, {
            use: [imageminGifsicle({
              optimizationLevel: 2
            })]
          }).then(
            //() => {
            //console.log('Images optimized');
            //}
          );***/
          obj.write=false;
          break;
          case '.jpg':
          /***
          case '.jpeg':
              try{imageminJpegoptim()(obj.data).then((rst)=>{
                fs.writeFile(obj.destPath,rst,function(){
                });
              })} catch(e){
                return;
              }
          obj.write=false;
          //obj.data=imageminJpegoptim()(obj.data);
          break;***/
          obj.write=false;
        case '.css':
          var content = obj.data instanceof Buffer ? obj.data.toString() : obj.data;
          if (itemConf.cssConfig == 2) { //压缩css
            obj.data = CleanCSSObj.minify(content).styles;
          } else if (itemConf.cssConfig == 3) { //美化css
            var beautify = require('js-beautify').css;
            obj.data = beautify(content, {
              "selector-separator-newline": false,
              "end-with-newline": false,
              "newline-between-rules": false
            });
          }
          break;
        case '.js':
          if (itemConf.jsConfig == 2) { //压缩js
            var patt = new RegExp(itemConf.jsPath, 'i');
            var extPath = obj.srcPath.substr(itemConf.path.length);
            extPath = extPath.replace(/\\/g, '/');
            if (patt.test(extPath)) {
              try {
                obj.data = UglifyJS.minify(obj.srcPath).code;
              } catch (e) {

              }
            }
          } else if (itemConf.jsConfig == 3) { //美化js
            var content = obj.data instanceof Buffer ? obj.data.toString() : obj.data;
            var beautify = require('js-beautify').js_beautify;
            obj.data = beautify(content, {
              indent_size: 2
            });
          };
          break;
        case '.less':
            var content = obj.data instanceof Buffer ? obj.data.toString() : obj.data;
            var less = require('less');
            less.render(content,function(e,output){
              var destPathLess=obj.destPath.substr(0,obj.destPath.length-5)+'_less.css';
              fs.writeFile(destPathLess,output.css,(err)=>{});
            });
          break;
        case '.styl':
            var content = obj.data instanceof Buffer ? obj.data.toString() : obj.data;
              var stylus = require('stylus');
              stylus(content)
                .include(require('nib').path)
                .include(itemConf.path+'/**')
                .render(function(err, css){
                  var destPathStyl=obj.destPath.substr(0,obj.destPath.length-5)+'_styl.css';
                  fs.writeFile(destPathStyl,css,(err)=>{});
              });
          break;
          default:
          obj=obj;
      }
        return obj;
    });
    //打包图片
    if (itemConf.imgCompress) { //图片压缩
      try{imgmin(itemConf.path, itemConf.packagePath)} catch(e){
        //throw e
      };
    }
  });
})
ipcMain.on('documentready', (event, arg) => {
  if (arg) {
    fs.readFile(configFilePath, 'utf8', function(err, data) {
      if (err) throw err;
      event.sender.send('documentready', data);
    });
  }
});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
