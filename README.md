## 一个简单的模拟登录qq空间的工具
>目前该程序使用python实现了模拟登录qq空间，并且实现可以发表说说，还可以获取相册

### 环境依赖

- python2.7
- PyV8:一个用来在Python下执行js代码的轻量的对googlev8的一个封装。安装教程:[PyV8安装](http://shomy.top/2016/03/11/ubuntu-python-pyv8/)

### 模块简介

- webHandler.py: 对网络请求的一个简单封装
- scrapyHandler.py: 多线程模块的一个封装
- qq.py: 模拟登录qq,以及爬取qq相册
- myLog.py: 简单的封装了日志模块
- test.py 提供一份测试代码，从中可以知道用法

### 使用
程序提供了两种登录方式: 扫二维码登录以及输入帐号密码登录。爬取相册时，以相册主人的qq作为文件夹，在当前目录保存其图片。
如果选择验证码登录的话，直接扫码就可以了，如果想帐号密码登录的话，可以把修改`info.conf`文件:
```
[info]
qq=Yourqq
pwd=YouPassword
numthread=5
```
当然也可以修改一下，`test.py`文件,可以自己手动输入帐号密码.
下面的示例是发表说说的一个demo：
```
In [1]: from qq import QQ
In [2]: my = QQ('YourQQ', 'YouPWD')

In [3]: my.login()

In [4]: my.publishMessage('发个说说')
2016-04-05 17:21:52,688 - root : INFO publish message success: 发个说说
```
可以去看看有没有发送成功。

### 后续
- 不足
    - 虽然提供了两种方式登录，不过在使用帐号密码登录失败次数过多，或者异地登录从而产生验证码的时候，即使输入正确的验证码，也会返回错误，另代解决。
    - 代码不太规范~
- 暂时实现了发表说说，获取相册等简单功能，可以扩展.
- 有问题欢迎提issue

### 参考
- [**lufei**](https://lufei.so/)
- [2](https://github.com/yoyzhou/weibo_scrapy)
- [3](http://www.open-open.com/home/space-5679-do-blog-id-3247.html)
