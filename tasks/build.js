//系统模块
var path = require('path');
var join = path.join;
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;

var root = join(__dirname, '../');
var name = 'build';
//非系统模块
var feTask = require(root + '/lib/feTask');
var grunt = require('grunt');
var log = require(join(root, '/lib/feLog'));

var Task = function() {};
util.inherits(Task, feTask);
//help是帮助函数，fe build -h 执行该函数
Task.prototype.help = function() {
    log.log(' >>>fe build task 帮助');
    log.log('    * [fe build a.html](yellow) : 将页面中js和css合并到a.min.html中');
    log.log('    * [fe build a.html to b.html](yellow) : 将页面中js和css合并到b.html中');
    log.log('    * [fe build a.html -b](yellow) : 合并后并且美化');
    log.log('    * [fe build a.html --no-ascii](yellow) : js中文不转成\\uXXX');
    log.log('  [PS](bold.green) 只有在html中build语法正确才可以识别');
    log.log('__________________________________________________________________________');
    log.log('>>>[html中build语法](green)');
    log.log(' * style语法：');
    log.log('     <!-- build:[style](yellow) -->');
    log.log('     <link rel="stylesheet" type="text/css" href="/path/to/css.css" />');
    log.log('     <!-- /build -->');
    log.log(' * script语法：');
    log.log('     <!-- build:[script](yellow) -->');
    log.log('     <script type="text/javascript" src="abc.js"></script>');
    log.log('     <script type="text/javascript" src="js/jquery.js"></script>');
    log.log('     <!-- /build -->');

}

//任务启动函数，this.dest是目的文件(夹)，this.dist是要处理的文件(夹)
Task.prototype.start = function() {
    var that = this;
    //*************************下面是您要开发的内容哦***************************************
    var distLen = this.dist.length;
    if (distLen === 0) {
        //举例：执行grunt的build任务
        this.help();

    } else {
        //执行自己的build任务
        var destFile;
        if (this.dest && this.dest !== this.root) {
            destFile = this.dest;
        }
        this.dist.forEach(function(v) {
            var filepath = join(_.root, v);
            var dirname = path.dirname(filepath);
            var dest = destFile;
            if (!destFile || destFile === '') {
                var extname = path.extname(v);
                var basename = path.basename(v, extname);
                dest = basename + '.min' + extname;
                dest = join(dirname, dest);
            }
            var content = getContent(filepath);
            var html = that.build(content, dirname, dest);
            writeFile(dest, html);
        });
    }
}

function getContent(file) {
    return fs.readFileSync(file, 'utf-8').toString();
}

Task.prototype.build = function(content, filepath, dest) {
    var tags = getBuildTags(content);
    var params = this.mix({
        b: false,
        dir: filepath
    }, this.options);
    content = content.replace('\r\n', EOL); //将不同的换行符统一成unix的
    //部分代码来自grunt-html-build
    tags.forEach(function(tag) {
        var raw = tag.lines.join(EOL);
        var result = parse[tag.type](tag, params);
        content = content.replace(raw, result);
    });


    if (params.b) {
        content = beautify.html(content, {});
    }

    return content;
}

function writeFile(filepath, content) {
    if (content === '') {
        log.warn(filepath + ' is empty！');
        return;
    } else {
        grunt.file.write(filepath, content, {
            encoding: 'utf-8'
        });
        log.note('成功build：' + filepath);
    }


}

var task = module.exports = new Task();
var CleanCSS = require('clean-css');
var uglifyjs = require('uglify-js');

var parse = {
    _jsReg: /src=['"](.+?)['"]/i,
    _cssReg: /href=['"](.+?)['"]/i,
    script: function(tag, params) {
        var content = this.getCode(this._jsReg, tag.lines, params.dir);
        if (!params.b) {

            content = uglifyjs.minify(content, {
                fromString: true,
                output: {
                    ascii_only: !params['no-ascii']
                }
            }).code;
        }
        content = '<script type="text/javascript">\n' + content.trim() + '\n</script>';
        return content;
    },
    style: function(tag, params) {
        var content = this.getCode(this._cssReg, tag.lines, params.dir);
        //console.log(params)
        if (params.b) {
            //美化
            content = moveCharset(content);
        } else {
            content = minifyCSS(content, {
                report: false
            });
        }
        content = '<style type="text/css">\n' + content.trim() + '\n</style>';
        return content;
    },
    getCode: function(reg, lines, dir) {
        var gFile = grunt.file;
        lines = lines.map(function(v) {
            var content = '';
            var m = v.match(reg);
            if (m) {
                var url = m[1]; //url
                if (url) {
                    var aurl = path.relative(dir, url);
                    aurl = join(dir, aurl);
                    if (gFile.exists(aurl)) {
                        content = fs.readFileSync(aurl, 'utf-8').toString();

                        content = CleanCSS._inlineImports(content, {
                            root: task.root,
                            relativeTo: path.relative(task.root, path.dirname(url))
                        });

                    } else {
                        log.error('文件 "' + url + '" 不存在!');
                    }
                }
            }
            return content;
        });

        return lines.join(EOL);
    }
};


//********** 代码修改自 grunt-html-build，author：spa tools**************//
//https://github.com/spatools/grunt-html-build/blob/master/tasks/build-html.js
var // Init 
_ = grunt.util._,
    EOL = '\n',
    beautifier = require('js-beautify'),
    beautify = {
        js: beautifier.js,
        css: beautifier.css,
        html: beautifier.html
    },

    // Tags Regular Expressions
    regexTagStart = /<!--\s*build:(style|script)\s*-->/, // <!-- build:{type} -->
    regexTagEnd = /<!--\s*\/build\s*-->/; // <!-- /build -->

//#endregion

//#region Private Methods

function getBuildTags(content) {
    var lines = content.split(/\n/),
        tag = false,
        tags = [],
        last;

    lines.forEach(function(l) {
        var tagStart = l.match(regexTagStart),
            tagEnd = regexTagEnd.test(l);

        if (tagStart) {
            tag = true;
            last = {
                type: tagStart[1],
                lines: []
            };
            tags.push(last);
        }

        // switch back tag flag when endbuild
        if (tag && tagEnd) {
            last.lines.push(l);
            tag = false;
        }

        if (tag && last) {
            last.lines.push(l);
        }
    });

    return tags;
}



function minifyCSS(source, options) {
    try {
        return CleanCSS.process(source, options);
    } catch (e) {
        grunt.log.error(e);
        grunt.fail.warn('css minification failed.');
    }
}

function moveCharset(data) {
    var lineBreak = process.platform == 'win32' ? '\r\n' : '\n';
    // get first charset in stylesheet
    var match = data.match(/@charset [^;]+;/);
    var firstCharset = match ? (match[0] + '\n') : null;
    if (!firstCharset) return data;

    // reattach first charset and remove all subsequent
    data = firstCharset + data.replace(new RegExp('@charset [^;]+;(' + lineBreak + ')?', 'g'), '');
    return data;
}