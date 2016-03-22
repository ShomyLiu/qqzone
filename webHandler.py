#!/usr/bin/env python
# encoding: utf-8

import urllib
import urllib2
import cookielib


class WebException(Exception):
    '''
    handle exception
    '''
    pass


class WebHandler(object):
    '''
    a handler to deal with webrequest: coookie,get or post,etc.
    '''
    def __init__(self):
        self.opener = urllib2.build_opener()
        self.EnableCookie()

    def Request(self, url, data=None, headers={}, method='GET', type=''):
        '''
        a wrapper to send a request
        '''

        # check url invalid or not
        if url is None or url == '':
            raise WebException('url is necessary')

        # add User-Agent to headers
        if 'User-Agent' not in headers:
            headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36 LBBROWSER'

        self.opener.addheaders = headers.items()

        try:
            if data is None:
                req = urllib2.Request(url)
            elif not isinstance(data, dict):
                raise WebException('data is invalid!')
            else:
                if method == 'GET':
                    req = urllib2.Request(url + '?' + urllib.urlencode(data))
                elif method == 'POST':
                    req = urllib2.Request(url, data=urllib.urlencode(data))

            page = urllib2.urlopen(req, timeout=20).read()

            if type != '':
                return page

            # decode to Unicode
            try:
                page = page.decode('utf-8')
            except:
                page = page.decode('gbk', 'ignore')

            return page

        except urllib2.HTTPError, e:
            return WebException(e.fp.read(), '', e.headers, e.code)

    def EnableCookie(self):
        '''
        enable cookie handle, using after your login
        '''
        self.cookiejar = cookielib.CookieJar()
        self.cookieproc = urllib2.HTTPCookieProcessor(self.cookiejar)
        self.opener.add_handler(self.cookieproc)
        #  self.opener = urllib2.build_opener(self.cookieproc)
        urllib2.install_opener(self.opener)

    def EnableProxy(self, proxyDict):
        '''
        Enable use proxy to request:
            proxyDict: {"http":"115.182.83.38:8080"}
        '''
        self.opener.add_handler(urllib2.ProxyHandler(proxyDict))

    def getCookie(self, key=None):
        '''
        Get cookie from CookieJar by key if key is valid
        '''
        if key is None:
            return {x.name: x.value for x in self.cookiejar}
        else:
            for cookie in self.cookiejar:
                if cookie.name == key:
                    return cookie.value
            else:
                return ''
