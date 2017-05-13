#!/bin/python

import httplib
import time
import sys

while True:
    conn = httplib.HTTPConnection("localhost", 8001)
    conn.request("GET", "/matt")
    res = conn.getresponse()
    score = res.read()
    target = open(sys.argv[1], 'w')
    target.write(score)
    target.close()
    time.sleep( 1.0 )
