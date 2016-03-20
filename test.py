#!/usr/bin/env python
# encoding: utf-8


from qq import QQ

if __name__ == '__main__':
    method = raw_input('选择方式登录:1.二维码;2.帐号密码;\n')
    if method == '1':
        qq = QQ(method='1')
        qq.login()

    elif method == '2':
        qqNum = raw_input('输入QQ号:')
        qqPwd = raw_input('输入密码:')
        qq = QQ(qqNum, qqPwd)
        qq.login()
    else:
        print '请输入1,或者2'
    # 参数如果为空，默认自己相册;
    # 不然为输入自己好友的qq号，获取其相片url
    qq.getAlbumList()
