var disk = express.Router();
var diskspace = require('diskspace');

function getDrivers(){
    return Promise.resolve({
        then : function(onFullfil,onReject){
            var spawn = require('child_process').spawn,
            stdout = '',stderr = '',
            list  = spawn('cmd');
            list.stdout.on('data', function (data) {
                stdout += iconv.decode(data,'GBK');
            });
            list.on('exit', function (code) {
                if(code == 0){
                    var lines = stdout.split(/\s*\n/);
                    var drivers = [];
                    for(var i in lines){
                        if(/^([a-zA-Z]):$/.test(lines[i])){
                            drivers.push(RegExp.$1);
                        }
                    }
                    onFullfil(drivers);
                    return;
                }
                onReject(new Error('child process exited with code ' + code));
            });

            list.stdin.write('wmic logicaldisk get name\n');
            list.stdin.end();
        }
    })
}

function check(driver){
    return Promise.resolve({
        then : function(onFullfil,onReject){
            diskspace.check(driver,function(err,total,free,status){
                if(err){
                    onReject(err);
                    return;
                }
                onFullfil({
                    name : driver,
                    total : total,
                    totalText : Math.round(total/1024/1024/1024) + "GB",
                    free : free,
                    freeText : Math.round(free/1024/1024/1024) + "GB",
                    used : total - free,
                    usedText : Math.round((total - free)/1024/1024/1024) + "GB",
                    usedPercent : total > 0 ? Math.round((total-free)/total * 10000/100) : 0
                });
            })
        }
    });
}

disk.get('/',function(req,res){
    co(function*(){
        var drivers = yield getDrivers();
        var datas = [];
        for(var i in drivers){
            datas.push(yield check(drivers[i]));
        }
        res.render('disk',{
            drivers : datas
        });
    })
})

module.exports = disk;


