#!/usr/bin/env python
# encoding: utf-8

import random
import re
import PyV8
import tempfile
import os
import sys
from webHandler import WebHandler as Web


class QQException(Exception):
    '''
    handle exception in login and scray data
    '''
    pass


class QQ(object):
    '''
    qq class for: loginning, scray data
    '''

    def __init__(self, qq='', pwd=''):
        self.qq = qq
        self.pwd = pwd
        self.r = Web()
        self.appid = "549000912"
        self.js_ver = "10151"
        self.action = "3-16-1457838106926"

        self.login_sig = ""
        self.verifycode = ""
        self.pt_vcode_v1 = ""
        self.verifycode = ""
        self.pt_verifysession_v1 = ""

    def login(self):
        '''
        The main process for login
        '''
        self.getLogin_sig()
        self.getVerifycode()
        self.checklogin()

    def checklogin(self):
        '''
        Ready to login the QQZone, push a request to login
        '''
        url = 'http://ptlogin2.qq.com/login'
        para = {
            'u': self.qq,
            'verifycode': self.verifycode,
            'pt_vcode_v1': self.pt_vcode_v1,
            'pt_verifysession_v1': self.pt_verifysession_v1,
            'p': self.getPwdEncryption(),
            'pt_randsalt': 0,
            'u1': 'http://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
            'ptredirect': 0,
            'h': 1,
            't': 1,
            'g': 1,
            'from_ui': 1,
            'ptlang': 2052,
            'action': self.action,
            'js_ver': self.js_ver,
            'js_type': 1,
            'login_sig': self.login_sig,
            'pt_uistyle': 32,
            'aid': self.appid,
            'daid': 5
        }
        ptuUI_BC = self.r.Request(url, data=para, headers={"Host": 'ptlogin2.qq.com'})
        print ptuUI_BC

    def getPwdEncryption(self):
        '''
        Get the encryption of password using PyV8
        with the javascript code
        '''
        with PyV8.JSContext() as ctxt:
            ctxt.eval(open('RSA.txt').read())
            rsa =ctxt.locals.getEncryption
            self.pwd = rsa(self.pwd, self.qq, self.verifycode)
            return self.pwd

    def getVerifycode(self):
        '''
        judge whether if verycode necessary or not.
        and get the verycode,and some other information
        '''
        url ='http://check.ptlogin2.qq.com/check'
        para = {
            'regmaster': '',
            'pt_tea': 1,
            'pt_vcode': 1,
            'uin': self.qq,
            'appid': self.appid,
            'js_ver': self.js_ver,
            'js_type': 1,
            'login_sig': self.login_sig,
            'u1': 'http://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
            'r': random.random()
        }
        checkVc = self.r.Request(url, data=para)
        _li = re.findall(r"'([^']*)'", checkVc)
        #  assert _li[0] == '0',_li[0]
        if _li[0] == '0':
            self.pt_vcode_v1 = _li[0]
            self.verifycode = _li[1]
            self.pt_verifysession_v1 = _li[3]

        elif _li[0] =='1':
            self.pt_vcode_v1 = _li[0]
            self.pt_verifysession_v1 = _li[1]
            self.verifycode = self.getInputVcode()
            # todo

    def getInputVcode(self):
        '''
        input the verifycode  manually,by the picture
        using tempfile module to generate a tmp file,
        which will be deleted auto
        '''
        url = 'http://captcha.qq.com/getimage'
        para = {
            'uin'		: self.qq,
            'aid'		: self.appid,
            'cap_cd'	: self.pt_verifysession_v1
        }

        vcode_data = self.r.Request(url, data=para, type='jpg')
        tmp = tempfile.mkstemp(suffix='.jpg')
        os.write(tmp[0], vcode_data)
        os.close(tmp[0])

        assert sys.platform.find('linux') >= 0

        #  different system platform is different to open file
        if sys.platform.find('linux') >= 0:
            os.system('xdg-open %s'% tmp[1])
        elif sys.platform.find('darwin') > 0:
            os.startfile(tmp[1])
        else:
            os.system('call %s' % tmp[1])

        return raw_input('input the vcode:')

    def getLogin_sig(self):
        '''
        get a necessary login  sig in cookie while get a request
        '''
        url = 'http://xui.ptlogin2.qq.com/cgi-bin/xlogin?'
        para = {
            "proxy_url": 'http://qzs.qq.com/qzone/v6/portal/proxy.html',
            "daid": 5,
            "hide_title_bar": 1,
            "low_login": 0,
            "qlogin_auto_login": 1,
            "no_verifyimg": 1,
            "link_target": "blank",
            "appid": self.appid,
            "style": "22",
            "target": "self",
            "s_url": "http://qzs.qq.com/qzone/v5/loginsucc.html?para=izone",
            "pt_qr_app": "手机QQ空间",
            "pt_qr_link": "http://z.qzone.com/download.html",
            "self_regurl": "http://qzs.qq.com/qzone/v6/reg/index.html",
            "pt_qr_help_link": "http://z.qzone.com/download.html"
        }
        self.r.Request(url, data=para)
        self.login_sig = self.r.getCookie('pt_login_sig')
        print self.login_sig
        if self.login_sig == "":
            raise QQException("Error in getting login_sig")
