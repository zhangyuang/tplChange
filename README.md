# tplchange
php smarty to node nunjucks

## 使用方法
```
git clone git@github.com:zhangyuang/tplchange.git

npm link

smtonj [path] true? 
```
输入true则代表覆盖源文件，不然在原目录下生成新文件，为news+原文件名
配合 [reextension](https://github.com/zhangyuang/reExtension) 模块批量替换文件后缀名模块一起使用效果更佳

## 原理
利用正则匹配慢慢替换，由于每个人的编码风格不同，所以不一定能完全匹配上，建议根据实际项目可自行修改index.js文件内容。
