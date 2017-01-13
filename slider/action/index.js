'use strict';
$$.action={
    main:function(a,b){
        $$.run(function *(resume){
            var data={
                works:yield new $$.tables.works_items().getList(10),
                workers:yield new $$.tables.workers().getList(1),
                get:$$.get
            }
            for(var x in $$.post.files){
                var newPath='/public/'+(new Date()-0)+'.'+path.extname($$.post.files[x].name);
                fs.rename($$.post.files[x].path,$$.serverPath+newPath);
                data.imgSrc=newPath;
            }
            $$.render('/tpl/index.html',data);
            res.end();
            $$.connection.destroy();
        });
    },
    news:function(id){
        $$.lib.genny.run(function *(resume){
            var data={
                works:yield new $$.tables.works_items().select(id)
            }
            $$.printAll($$.req);
            res.end();
            $$.connection.destroy();
        });
    }

}
/***
$$.post={};
$$.get={};
$$.files={};
if($$.url.pathname=='/'){
    var i=0;
    if($$.req.method=='POST'){
        var body='';
        req.on('data',function(d){
            i++;
            console.log($$.lib.loadsh);
            console.log(d.toString());
        });
    };
    $$.url.queryNow='main';
    $$.action[$$.url.queryNow]();
}
***/










































