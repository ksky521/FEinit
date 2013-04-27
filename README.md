FEinit beta版
======

初始化FE项目文件夹的工具

基于Grunt和compass的前端项目初始化工具集。

    FFFFFFFFFFFFFFFFFFFFFFEEEEEEEEEEEEEEEEEEEEEE       iiii                     iiii          tttt          
    F::::::::::::::::::::FE::::::::::::::::::::E      i::::i                   i::::i      ttt:::t          
    F::::::::::::::::::::FE::::::::::::::::::::E       iiii                     iiii       t:::::t          
    FF::::::FFFFFFFFF::::FEE::::::EEEEEEEEE::::E                                           t:::::t          
      F:::::F       FFFFFF  E:::::E       EEEEEE     iiiiiiinnnn  nnnnnnnn    iiiiiiittttttt:::::ttttttt    
      F:::::F               E:::::E                  i:::::in:::nn::::::::nn  i:::::it:::::::::::::::::t    
      F::::::FFFFFFFFFF     E::::::EEEEEEEEEE         i::::in::::::::::::::nn  i::::it:::::::::::::::::t    
      F:::::::::::::::F     E:::::::::::::::E         i::::inn:::::::::::::::n i::::itttttt:::::::tttttt    
      F:::::::::::::::F     E:::::::::::::::E         i::::i  n:::::nnnn:::::n i::::i      t:::::t          
      F::::::FFFFFFFFFF     E::::::EEEEEEEEEE         i::::i  n::::n    n::::n i::::i      t:::::t          
      F:::::F               E:::::E                   i::::i  n::::n    n::::n i::::i      t:::::t          
      F:::::F               E:::::E       EEEEEE      i::::i  n::::n    n::::n i::::i      t:::::t    tttttt
    FF:::::::FF           EE::::::EEEEEEEE:::::E     i::::::i n::::n    n::::ni::::::i     t::::::tttt:::::t
    F::::::::FF           E::::::::::::::::::::E     i::::::i n::::n    n::::ni::::::i     tt::::::::::::::t
    F::::::::FF           E::::::::::::::::::::E     i::::::i n::::n    n::::ni::::::i       tt:::::::::::tt
    FFFFFFFFFFF           EEEEEEEEEEEEEEEEEEEEEE     iiiiiiii nnnnnn    nnnnnniiiiiiii         ttttttttttt  


## 使用方法

进入init文件夹，添加常用的Grunt插件。

### 修改pack.json添加
```javascript
"devDependencies": {
    "grunt": "~0.4.1",
    "grunt-contrib-jshint": "~0.2.0",
    "grunt-contrib-uglify": "~0.1.2",
    "grunt-contrib-nodeunit": "~0.1.2",
    "grunt-contrib": "~0.5.0",
    "grunt-contrib-concat": "~0.1.3",
    "grunt-contrib-compass": "~0.1.3",
    "grunt-contrib-htmlmin": "~0.1.1",
    "grunt-contrib-watch": "~0.3.1",
    "grunt-contrib-imagemin": "~0.1.2",
    "grunt-contrib-qunit": "~0.2.0",
    "grunt-contrib-livereload": "~0.1.2"
}
```

然后进入init文件夹执行

    npm install

### 直接使用npm安装

    npm install grunt-plugins-name --save-dev

### 修改init/src文件目录结构，默认的结构如下

    │  index.html             //首页
    │
    ├─img                    //图片
    │  └─pic                 //切图临时占位图片       
    ├─js                     //js文件夹
    │      .htaccess
    │      broadcast.js
    │      hammer.js
    │      import.php
    │      jquery.1.4.2.js 
    │      jquery.1.8.2.js    
    │      mix.js
    │      template.js
    │      zepto.js
    │
    └─sass                   //compass sass文件夹
            _base.scss       //compass bass文件

### 安装

运行install.cmd

### 卸载

运行uninstall.cmd

### 初始化项目

右键要初始化的项目文件夹，选择【初始化FE项目】，会自动调起cmd，复制文件，然后执行compass初始化