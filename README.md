## 一个简单的模拟登录qq空间的工具
>目前该程序使用python实现了模拟登录qq空间，并且实现多线程爬取qq相册模块，其余模块等同。

### 环境依赖

- python2.7
- PyV8:一个用来在Python下执行js代码的轻量的对googlev8的一个封装。安装教程:[PyV8安装](http://shomy.top/2016/03/11/ubuntu-python-pyv8/)

### 模块简介
程序提供了两种登录方式: 扫二维码登录以及输入帐号密码登录。爬取相册时，以相册主人的qq作为文件夹，在当前目录保存其图片。

- webHandler.py: 对网络请求的一个简单封装
- scrapyHandler.py: 多线程模块的一个封装
- qq.py: 模拟登录qq,以及爬取qq相册
- test.py 提供一份测试代码，从中可以知道用法

### 后续
- 不足
    - 虽然提供了两种方式登录，不过在使用帐号密码登录失败次数过多，从而产生验证码的时候，即使输入正确的验证码，也会返回错误，另代解决。
    - 代码不太规范~
- 只实现了爬取相册的功能，其他模块可自己添加。

### 参考
[1.lufei]
[2](https://github.com/yoyzhou/weibo_scrapy)
[3](http://www.open-open.com/home/space-5679-do-blog-id-3247.html)
