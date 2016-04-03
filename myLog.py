#!/usr/bin/env python
# encoding: utf-8

import logging


logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(filename)s[line: %(lineno)d] %(levelname)s %(message)s',
                    datefmt='%a, %d %b %Y %H:%M:%S',
                    filename='qqlogging.log',
                    filemode='w')
console = logging.StreamHandler()
console.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s : %(levelname)-4s %(message)s')
console.setFormatter(formatter)
logging.getLogger('').addHandler(console)


def logDebug(message):
    logging.debug(message)


def logInfo(message):
    logging.info(message)


def logWarn(message):
    logging.warning(message)
