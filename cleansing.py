#!/usr/bin/env python
# encoding: utf-8
"""
cleansing.py

Implement data cleansing for raw SCATS data.
Algorithm:
1. Skip header
2. Convert invalid record "-1022" or "" to "0"
3. Sum up all records, if equal to 0, ignore

Usage: python cleansing.py input_filename output_filename
By default put this program and input file within the same folder

Note: Raw SCATS file (y2008-y2014) is about 77G, and the data that cleansed
is about 35G, take about 24h to finish. This program should be rewritten to
a Spark job to speed up.

Created by Siqi Wu on 15 Feb 2016.
Email: wusiqi.china@gmail.com
"""

import sys
import os

input = open(sys.argv[1], 'r')
output = file(sys.argv[2], 'w+')

# 1. Skip header
input.readline()

for line in input:
    fields = line.split(",")
    sum = 0
    length = len(fields)
    for i in range(3, length-1):
        # 2. Convert invalid record "-1022" or "" to "0"
        if (len(fields[i]) == 2 or int(fields[i][1: -1]) < 0):
            fields[i] = '"0"'
            sum += 0
        else:
            sum += int(fields[i][1: -1])
    # 3. Sum up all records, if equal to 0, ignore
    if sum == 0:
        continue
    output.write(line)

input.close()
output.close()
