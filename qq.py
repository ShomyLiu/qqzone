#!/usr/bin/env python
# encoding: utf-8

import random
import re
import PyV8
import tempfile
import time
import os
import sys
import json
import myLog
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

    def __init__(self, qq='', pwd='', method='2'):
        self.qq = str(qq)
        self.pwd = str(pwd)
        self.login_method = method
        self.r = Web()
        self.appid = "549000912"
        self.js_ver = "10151"
        self.action = "3-16-1457838106926"
        self.login_flag = False

        self.login_sig = ""
        self.verifycode = ""
        self.pt_vcode_v1 = ""
        self.verifycode = ""
        self.pt_verifysession_v1 = ""
        self.g_tk = ""

        self.picUrl = []

    def login(self):
        '''
        The main process for login
        two ways: accout+pwd && QR
        '''
        self.getLogin_sig()

        if self.login_method == '2':
            self.loginWithAccout()
        else:
            self.loginWithQR()

        if self.login_flag:
            self.getG_TK()

    def publishMessage(self, content):
        '''
        an api for publish message
        '''
        url = 'http://taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6?g_tk=%s' %self.g_tk
        para = {
            'qzreferrer': 'http://user.qzone.qq.com/2335509736',
            'syn_tweet_verson': 1,
            'paramstr': 1,
            'pic_template': '',
            'richtype': '',
            'richval': '',
            'special_url': '',
            'subrichtype': '',
            'who': 1,
            'con': content,
            'feedversion': 1,
            'ver': 1,
            'ugc_right': 1,
            'to_tweet': 0,
            'to_sign': 0,
            'hostuin': self.qq,
            'code_version': 1,
            'format': 'fs',
        }
        self.r.Request(url, data=para, method='POST')
        myLog.logInfo('publish message success: %s' %content)

    def getAlbumList(self, qq=''):
        '''
        get the albulmlist of qq=qq
        '''
        if qq == '':
            qq = self.qq
        self.picUrl = []
        url = 'http://h5.qzone.qq.com/proxy/domain/alist.photo.qq.com/fcgi-bin/fcg_list_album_v3'
        para ={
            '_': time.time(),
            'appid': 4,
            'callback': 'shine0_Callback',
            'callbackFun': 'shine0',
            'filter': 1,
            'format': 'jsonp',
            'g_tk': self.g_tk,
            'handset': 4,
            'hostUin': qq,
            'idcNum': 0,
            'inCharset': 'utf-8',
            'needUserInfo': 1,
            'notice': 0,
            'outCharset': 'utf-8',
            'pageNumModeClass': 15,
            'pageNumModeSort': 40,
            'plat': 'qzone',
            'source': 'qzone',
            't': self.getRandomT(),
            'uin': self.qq
        }
        rtn_data= self.r.Request(url, data=para, headers={'host': 'h5.qzone.qq.com'})
        rtn_data = json.loads(re.findall(r'shine0_Callback\(([\s\S]*?)\);', rtn_data)[0])
        if rtn_data['code'] != 0:  # no access
            myLog.logInfo(qq + ' : no access to enter qqzone')
            return
        try:
            albumList = rtn_data['data']['albumListModeSort']
        except:
            albumList = [album for albums in rtn_data['data']['albumListModeClass'] for album in albums['albumList']]

        if not albumList:  # no albumlist
            myLog.logInfo(qq + ' : albumList is empty')
            return
        #  myLog.logInfo(qq + ': total ' + str(len(albumList)) + ' albums')
        for album in albumList:
            if album['allowAccess'] == 0:
                try:
                    myLog.logInfo(qq + ' : ' + album['name'].encode('utf-8') + ' is not access')
                except:
                    myLog.logInfo(qq + ' : ' + album['name'].encode('gbk') + ' is not access')
                continue

            myLog.logInfo(qq + ' : ' + album['name'] + ' is downloading')
            self.picUrl.extend(self.getPicUrl(album['id'], album['total'], qq))

    def getPicUrl(self, topicId, total, qq):
        '''
        According to the topicId, get all the pics in this album
        return a list : urls
        '''

        picUrls = []
        pageNum = 30
        pages = total / pageNum
        if total % pageNum > 0:
            pages += 1
        url = 'http://h5.qzone.qq.com/proxy/domain/tjplist.photo.qq.com/fcgi-bin/cgi_list_photo'
        para = {
            'g_tk': self.g_tk,
            'callback': 'shine0_Callback',
            't': self.getRandomT(),
            'mode': 0,
            'idcNum': 0,
            'hostUin': qq,
            'topicId': topicId,
            'noTopic': 0,
            'uin': self.qq,
            'pageStart': 0,
            'pageNum': pageNum,
            'skipCmtCount': 0,
            'singleurl': 1,
            'batchId': '',
            'notice': 0,
            'appid': 4,
            'inCharset': 'utf-8',
            'outCharset': 'utf-8',
            'source': 'qzone',
            'plat': 'qzone',
            'outstyle': 'json',
            'format': 'jsonp',
            'json_esc': 1,
            'callbackFun': 'shine0',
            '_': time.time()
        }
        for page in range(pages):
            try:
                para['pageStart'] = page * pageNum
                rtn_data = self.r.Request(url, para, headers={'Host': 'h5.qzone.com'})
                rtn_data = re.findall(r'shine0_Callback\(([\s\S]*?)\);', rtn_data)[0]
                rtnData = json.loads(rtn_data)
                if rtnData['code'] != 0:
                    myLog.logInfo('Skip : ' + topicId)
                    continue
                photoList = rtnData['data']['photoList']
                picUrls.extend(list(map(lambda photo: (qq, photo['url'], photo['phototype']), photoList)))
            except Exception, e:
                myLog.logWarn(str(e))
                #  self.checklogin()
                continue

        return picUrls

    def getG_TK(self):
        '''
        get a parameter : g_tk
        '''
        hash = 5381
        p_skey = self.r.getCookie('p_skey') or self.r.getCookie('skey')
        for c in p_skey:
            hash += (hash << 5) + ord(c)
        self.g_tk = hash & 0x7fffffff

    def getRandomT(self):
        '''
        generate a random number of 7 digits for a post parameter, though it is not necessary
        '''
        return ''.join([random.choice('0123456789') for i in range(9)])

    def loginWithQR(self):
        '''
        using  QRCard login
        '''
        url = 'http://ptlogin2.qq.com/ptqrshow'

        while True:
            para = {
                'appid': self.appid,
                'e': 2,
                'l': 'M',
                's': 3,
                'd': 72,
                'v': 4,
                't': random.random(),
                'daid': 5,
            }
            qrCard = self.r.Request(url, data=para, type='png')
            qrpng = file('qrcard.png', 'wb')
            qrpng.write(qrCard)
            qrpng.close()
            # self.startFile(qrCard, 'png')
            print 'please scan the qrCard using your phone'

            while True:
                checkUrl = 'http://ptlogin2.qq.com/ptqrlogin'
                checkPara = {
                    "u1": "http://qzs.qq.com/qzone/v5/loginsucc.html?para=izone",
                    "ptredirect": 0,
                    "h": 1,
                    "t": 1,
                    "g": 1,
                    "from_ui": 1,
                    "ptlang": 2052,
                    "action": '1-0-1457954762672',
                    "js_ver": self.js_ver,
                    "js_type": 1,
                    "login_sig": self.login_sig,
                    "pt_uistyle": 32,
                    "aid": self.appid,
                    "daid": 5,
                }
                rtnHtml = self.r.Request(checkUrl, data=checkPara)
                _li = re.findall(r"'([^']+)'", rtnHtml)
                if _li[0] == '0':
                    try:
                        myLog.logDebug('认证成功: ' + self.qq + ':' + _li[-1].encode('utf-8'))
                        #  print '认证成功: ', _li[-1].encode('utf-8')
                    except:
                        myLog.logDebug('认证成功: ' + self.qq + ':' + _li[-1].encode('gbk'))
                        #  print '认证成功: ', _li[-1].encode('gbk')

                    self.login_flag = True
                    break
                elif _li[0] == '67':
                    #  print '认证中....'
                    myLog.logInfo('认证中')
                elif _li[0] == '66':
                    #  print '二维码未失效，请扫描登录'
                    myLog.logInfo('二维码未失效，请扫描登录')
                elif _li[0] == '65':
                    #  print '二维码已经失效，请关闭当前二维码，重新扫描'
                    myLog.logInfo('二维码已经失效，请关闭当前二维码，重新扫描')
                    break

                time.sleep(2)

            if _li[0] =='0':
                self.r.Request(_li[2])
                self.qq = re.findall(r'uin=([^&]+)&', _li[2])[0]
                break

    def loginWithAccout(self):
        '''
        using accout and password login
        '''
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
        pt_BC = self.r.Request(url, data=para, headers={"Host": 'ptlogin2.qq.com'})
        _li = re.findall(r"'([^']+)'", pt_BC)
        if _li[-3] == '0':
            self.r.Request(_li[2])
            # print 'login success,', _li[-1]
            myLog.logDebug('login success,' + self.qq)
        self.login_flag = True

    def getPwdEncryption(self):
        '''
        Get the encryption of password using PyV8
        with the javascript code
        '''
        with PyV8.JSContext() as ctxt:
            ctxt.eval(open('script/RSA.txt').read())
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
        url = 'http://captcha.qq.com/cap_union_show'
        para = {
            'clientype': 2,
            'uin': self.qq,
            'aid': self.appid,
            'cap_cd': self.pt_verifysession_v1,
            'pt_style': 32
        }
        page = self.r.Request(url, data=para)
        g_vsig = re.findall(r'var\s+g_vsig\s+=\s"([^"]+)"', page)

        url = 'http://captcha.qq.com/getimage'
        para['rand'] = random.random()
        para['sig'] = g_vsig
        vcode_data = self.r.Request(url, data=para, type='jpg')
        self.startFile(vcode_data, 'jpg')
        vcode = raw_input('input the vcode:')

        # use PyV8 to get a parameter:'collet' for verifycode
        # with PyV8.JSContext() as ctxt:
        #     ctxt.eval(open('collect.js').read())
        #     collect = ctxt.locals.getTrace()
        # verify the vcode whether is right or not
        try:
            from selenium import webdriver
            driver = webdriver.PhantomJS()
            driver.get('script/tmp.html')
            collect = driver.find_element_by_id('hello').text
            driver.quit()
        except:
            raise QQException('Verify failed, please use QRCard to login')

        url = 'http://captcha.qq.com/cap_union_verify_new'
        para = {
            'aid': self.appid,
            'ans': vcode,
            'cap_cd': self.pt_verifysession_v1,
            'capclass': 0,
            'clientype': 2,
            'collect': collect,
            'pt_style': 32,
            'rand': random.random(),
            'sig': g_vsig,
            'uin': self.qq,
        }
        verify_res = json.loads(self.r.Request(url, data=para))
        if verify_res['errorCode'] == '0':
            print '验证码输入正确，正在登录...'
            self.verycode = verify_res['randstr']
        else:
            print '验证码输入错误,请重新登录!'

    def startFile(self, data, type):
        '''
        a func for openning a picture , eg: vcode, qrpicture
        '''
        tmp = tempfile.mkstemp(suffix='.%s' % type)
        os.write(tmp[0], data)
        os.close(tmp[0])

        assert sys.platform.find('linux') >= 0

        #  different system platform is different to open file
        if sys.platform.find('linux') >= 0:
            os.system('xdg-open %s'% tmp[1])
        elif sys.platform.find('darwin') > 0:
            os.startfile(tmp[1])
        else:
            os.system('call %s' % tmp[1])

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
        if self.login_sig == "":
            raise QQException("Error in getting login_sig")
