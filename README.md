FEinit beta版
======
基于Grunt和compass的前端项目初始化工具集，因为是在windows系统开发，所以目前仅适合 __windows__ 系统。                   

## 安装

```shell
npm install http://github.com/ksky521/FEinit/tarball/master -g
fe --help
```
__P.S.__：安装最后会选择是否添加鼠标右键功能

## 使用
 * 第一种方法：鼠标右键选择要创建项目的文件夹，选择【初始化FE】，然后按照提示完成项目的创建过程
 * 第二种方法：cmd进入要创建项目的文件夹，执行：```fe init```

### fe -h
查看帮助文件

### fe tasks
还在开发中...

### 项目的src文件夹默认结构如下

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

## 二次开发
支持二次开发和DIY的grunt task。

git本项目，然后需要添加的grunt任务文件，添加到tasks文件夹下即可。

0.1.0版本尚未添加tasks，只有个test……还在努力coding中

命令 ```fe task list``` 可以显示所有支持的grunt task列表


## 卸载
```shell
npm uninstall -g FEinit
```
