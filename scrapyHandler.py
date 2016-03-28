#!/usr/bin/env python
# encoding: utf-8

# ref_blog:http://www.open-open.com/home/space-5679-do-blog-id-3247.html

import threading
import Queue
import time


class ScrapyException(Exception):
    pass


class ScrapyHandler(object):
    '''
    handle to manager threadings
    '''
    def __init__(self, data, thread_num, func):
        '''
        data:
        thread_num:
        func: the work func
        '''
        self.work_queue = Queue.Queue()
        self.threads = []
        self.func = func
        self.init_queue(data)
        self.init_threads(thread_num)

    def init_queue(self, data):
        '''
        add data to queue
        '''
        for i in data:
            self.work_queue.put((self.func, i))

    def init_threads(self, thread_num):
        '''
        init the threads pool
        '''
        for i in range(thread_num):
            self.threads.append(Work(self.work_queue))

    def wait_allfinish(self):
        '''
        add join to wait all threads finished
        '''
        for item in self.threads:
            if item.isAlive():
                item.join()


class Work(threading.Thread):
    '''
    start the work for every threading
    '''
    def __init__(self, work_queue):
        threading.Thread.__init__(self)
        self.work_queue = work_queue
        self.start()

    def run(self):
        '''
        overwrite the run : work
        '''
        while True:
            try:
                if not self.work_queue.empty():
                    do_works, args = self.work_queue.get(block=False)
                    if isinstance(args, list) or isinstance(args, tuple):
                        do_works(*args)
                    else:
                        do_works(args)
                    time.sleep(0.01)
                    self.work_queue.task_done()
                else:
                    break
            except Exception, e:
                print str(e)
                break
