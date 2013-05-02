FEinit beta版
======
基于Grunt和compass的前端项目工具集，因为是在windows系统开发，所以目前仅适合 __windows__ 系统。                   

## 安装

```shell
npm install http://github.com/ksky521/FEinit/tarball/master -g
fe -h
fe -v
```
__P.S.__：安装最后会选择是否添加鼠标右键功能

## 使用
 * 第一种方法：鼠标右键选择要创建项目的文件夹，选择【初始化FE】，然后按照提示完成项目的创建过程
 * 第二种方法：cmd进入要创建项目的文件夹，执行：```fe init```

### fe -h or fe --help
查看帮助文件

## template功能（开发中）
生成（前端）项目的默认文件，可以指定自己电脑任意文件夹为项目模板（称为template），使用时：

 * 进入要创建项目的文件夹
 * 执行 ```fe init templateName``` 
 * fe自动复制对应的template文件夹所有文件到当前路径

PS：```fe init``` 和 右键菜单创建项目，则为默认的template（可以设置）

### template帮助
```shell
fe template -h
```

#### fe自带默认项目的src文件夹结构如下

    │  index.html             //首页
    │
    ├─img                    //图片
    │  └─pic                 //切图临时占位图片       
    ├─js                     //js文件夹
    │      jquery.1.4.2.js 
    │      jquery.1.8.2.js    
    │      zepto.js
    │
    └─sass                   //compass sass文件夹
            _base.scss       //compass bass文件


## 支持的task
列出支持的task命令

所有task支持查看帮助，使用 ```fe taskName -h``` 获取帮助
### fe css [options] filename [folder/files..] to dest.css
合并css，支持import语法解析。

 * 选项 
   * ```-c``` 压缩
 * 默认
   * 合并不压缩

```shell
fe css a.css b.css to ab.css
fe css -c a.css b.css to ab.min.css
```
### fe concat filename [files..] to dest
合并文件

```shell
fe concat file1 file2 file3 to concat
```
## fe js [options] filename [folder/files..] to dest.js
合并压缩js，

 * 选项 
   * ```-b``` or ```--beautify``` 美化
   * ```--no-ascii``` 不ascii化，即不会讲中文转为 ```\uXXX``` 格式
 * 默认
   * 压缩
   * 合并
   * ascii化

```shell
fe js file.js file2.js to min.js
fe js file.js file2.js to min.js --no-ascii
```
## 二次开发
支持二次开发和DIY的grunt task。

git本项目，然后需要添加的grunt任务文件，添加到tasks文件夹下即可。

0.1.0版本尚未添加tasks，只有个test……还在努力coding中

命令 ```fe task --list``` 可以显示所有支持的grunt task列表

## 卸载
```shell
npm uninstall -g FEinit
```

## 关于作者
 * 微博：[@三水清](http://weibo.com/sanshuiqing)
 * github：[github.com/ksky521](http://github.com/ksky521)
 * 博客：[三水清](http://js8.in)