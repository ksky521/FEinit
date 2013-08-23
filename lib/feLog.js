var colors = require('colors');
var fs = require('fs');
var join = require('path').join;
var help = join(__dirname, '../bin/help.txt'); //帮助文件

var log = module.exports = {
    note: function(msg) {
        if (msg) {
            log.log('[>>> ](green)' + msg)
        }
        return log;
    },
    warn: function(msg) {
        if (msg) {
            log.log('[>>> ](red)' + msg);
        }
        return log;
    },
    error: function(msg) {
        if (msg) {
            log.log('[>>> ](bold.red)' + msg);
        }
        return log;
    },
    tips: function() {
        log.log('[ERROR](bold.red)：命令有误，请使用 "fe --help" 查看帮助');
        return log;
    },
    ln: function(msg) {
        var lines = msg.split(/\n/);
        var reg = /\[(.*?)\]\((.*?)\)/g;
        lines.map(function(line) {
            // console.log(line);
            var m = line.replace(reg, function(match, _1, _2, l) {
                var c = _2.split('.');
                var back = _1;
                c.map(function(v) {
                    back = back[v];
                });
                return back;
            });
            process.stdout.write(m);
        });

    },
    log: function(msg) {
        var lines = msg.split(/\n/);
        var reg = /\[(.*?)\]\((.*?)\)/g;
        lines.map(function(line) {
            // console.log(line);
            var m = line.replace(reg, function(match, _1, _2, l) {
                var c = _2.split('.');
                var back = _1;
                c.map(function(v) {
                    back = back[v];
                });
                return back;
            });
            console.log(m)
        });
    },
    help: function() {
        log.logo();
        var txt = fs.readFileSync(help, 'utf-8').toString();
        log.log(txt);
        return log;
    },
    logo: function() {
        var version = require('../package.json').version;
        console.log('   __________________________________________________');
        console.log('  |       ' + ' ______  ______   _         _  _   '.rainbow.bold + '        |');
        console.log('  |       ' + '|  ____||  ____| (_)       (_)| |  '.rainbow.bold + '        |');
        console.log('  |       ' + '| |__   | |__     _  _ __   _ | |_ '.rainbow.bold + '        |');
        console.log('  |       ' + '|  __|  |  __|   | ||  _ \\ | || __|'.rainbow.bold + '        |');
        console.log('  |       ' + '| |     | |____  | || | | || || |_ '.rainbow.bold + '        |');
        console.log('  |       ' + '|_|     |______| |_||_| |_||_| \\__|'.rainbow.bold + ' v' + version + ' |');
        console.log('  |                                                  |');
        console.log('  |__________________________________________________|');
        console.log('\n');
        return log;
    }
};