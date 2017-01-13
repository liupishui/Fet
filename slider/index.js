'use strict';
$$.include=function(stringPath){
    var stringPath=$$.serverPath+'/'+stringPath;
    var rst=fs.readFileSync(stringPath,{encoding:'utf8'});
    if(path.extname(stringPath)=='.js'||path.extname(stringPath)=='.json'){
        eval(rst);
    }else{
        res.write(rst);
    }
}
//引入配置文件
$$.include('config.json');
//引入核心文件
$$.include('core/index.js')

//$$.printAll($$);
//$$.controller.main();


//res.end('ssss');
//include('1.html');

/***
const got=require('got');
var URLGet='http://www.baidu.com/';
got(URLGet).then(response=>{
    require('jsdom').env(response.body,(err,window)=>{
            var $=require('jquery')(window);
            $('[href]').each(function(){
                var $that=$(this);
                var href=$that.attr('href');
                if(href.indexOf('http')==-1&&href.indexOf('//')!=0){
                    if(href.indexOf('/')==0){
                        $that.attr('href',URLGet+href);
                    }else{
                        $that.attr('href',URLGet+'/'+href);
                    }
                }
            });
            $('[src]').each(function(){
                var $that=$(this);
                var src=$that.attr('src');
                if(src.indexOf('http')==-1&&src.indexOf('//')!=0){
                    if(src.indexOf('/')==0){
                        $that.attr('src',URLGet+src);
                    }else{
                        $that.attr('src',URLGet+'/'+src);
                    }
                }
            });
            $('[action]').each(function(){
                var $that=$(this);
                var action=$that.attr('action');
                if(action.indexOf('http')==-1&&action.indexOf('//')!=0){
                    if(action.indexOf('/')==0){
                        $that.attr('action',URLGet+action);
                    }else{
                        $that.attr('action',URLGet+'/'+action);
                    }
                }
            });
            res.write($('html').html().toString());
            res.end();
        });
});
***/



