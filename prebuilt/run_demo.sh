#!/bin/bash
#############################################################
# @file run_demo.sh
#
# @brief TIMAC 2.0 run_demo.sh - run the demo from prebuilt directory
#
# Group: WCS LPC
# $Target Device: DEVICES $
#
#############################################################
# $License: BSD3 2016 $
#############################################################
# $Release Name: PACKAGE NAME $
# $Release Date: PACKAGE RELEASE DATE $
#############################################################

hostarch=`uname -m`


if [ "x${hostarch}x" == "xarmv7lx" ]
then
    my_arch_name=bbb
fi

if [ "x${hostarch}x" == "xx86_64x" ]
then
    my_arch_name=host
fi

if [ "x${my_arch_name}x" == 'xx' ]
then
    echo "Unknown Host type: ${hostarch}"
    echo "Expected: armv7l {for BBB}"
    echo "Expected: x86_64 {for Linux 64bit host}"
    exit 1
fi

HERE=`pwd`

BIN_DIR=${HERE}/bin

GATEWAY_DIR=${HERE}/gateway

echo "Launching the Collector Application in the background"
cd ${BIN_DIR}
bash ./run_collector.sh
if [ $? != 0 ]
then
    echo "Something seems wrong with the collector app"
    exit 1
fi
cd ${HERE}


echo "Launching Node-JS gateway application in background"
cd ${GATEWAY_DIR}
bash ./run_gateway.sh
if [ $? != 0 ]
then
    echo "Something seems wrong with the gateway app"
    exit 1
fi
cd ${HERE}

if [ "x${my_arch_name}x" == "xhostx" ]
then
    echo "Launching Web Browser ... for  http://localhost:1310"
    xdg-open http://localhost:1310
else
    
    all_urls=`ifconfig | grep 'inet addr' | tr ' ' '\n' | grep 'addr' | grep -v '127.0.0.1'`
    echo ""
    echo "On your host, launch your browser using:"
    for x in $all_urls
    do
        y=`echo $x | sed s/addr://`
        echo ""
        echo "    http://$y:1310"
        echo ""
    done
fi
