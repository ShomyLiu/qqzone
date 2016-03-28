#!/usr/bin/env python
# encoding: utf-8

from scrapyHandler import ScrapyHandler
from qq import QQ
import webHandler
import ConfigParser
import os
import random


web = webHandler.WebHandler()

cf = ConfigParser.ConfigParser()
cf.read('info.conf')


def parse():
    '''
    从info.conf中读取配置信息
    '''
    qq = cf.get('info', 'qq')
    pwd = cf.get('info', 'pwd')
    return qq, pwd


def func(hostqq, url, tp):
    try:
        data = web.Request(url, type=tp)
        pic = file('%s/%s.%s' %(hostqq, str(random.random()), tp), 'wb')
        pic.write(data)
        pic.close()
    except Exception, e:
        print str(e)


def multi(qq):
    '''
    多线程爬取
    '''
    numthread = cf.get('info', 'numthread')
    s = ScrapyHandler(qq.picUrl, int(numthread), func)
    s.wait_allfinish()


def getAlbum(qq):

    global test_qq
    test_qq = ''  # 要爬取人的qq号, 不写默认为空。
    qq.getAlbumList(test_qq)
    # qq.getAlbumList() 无参数默认爬取自己的相册

    if len(qq.picUrl) < 2:
        print 'few pictures'
    else:
        if test_qq == '':
            test_qq = qq.qq  # 默认是自己的号码
        if not os.path.exists(test_qq):
            os.mkdir(test_qq)
        multi(qq)


def login():
    method = raw_input('选择方式登录:1.二维码;2.帐号密码;\n')
    if method == '1':
        qq = QQ(method='1')
        qq.login()
    elif method == '2':  # 从配置文件读取信息
        qqNum, pwd = parse()
        #  qqNum = raw_input('输入QQ号:')
        #  qqPwd = raw_input('输入密码:')
        qq = QQ(qqNum, pwd)
        qq.login()
    else:
        print '请输入1,或者2'
    return qq

if __name__ == '__main__':

    qq = login()  # 登录入口
    getAlbum(qq)  # 获取相册
