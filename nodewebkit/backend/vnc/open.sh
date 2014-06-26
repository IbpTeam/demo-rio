#!/bin/bash

#本文件根据输入的参数判断是启动doc还是web的远程桌面。
#输入的命令格式如下：
#	./open.sh -web www.baidu.com  //默认启动百度搜索的远程桌面
#	./open.sh -doc /home/wt/文档/vnc.doc  //默认打开vnc.doc的远程桌面。
#

WEBSOCKIFY_PORT=5958
VNC_PORT=1 
HOST="localhost"
VNCPATH=$(cd "$(dirname $0)";pwd)
W_DIR="$VNCPATH/noVNC/utils";
X_DIR="$HOME/.vnc";

if [ $# != 2 ] 
then
	echo "Error Input!" >&2
else
	#find port that hasn't used by vncserver;
	for PORT in $(seq 58);do
	list=`ls $X_DIR | grep .$PORT.pid` >> /dev/null
   	if [ "$list"x != ""x ]; then
        	PORT=$(($PORT + 1));
    	else
    		VNC_PORT=$PORT;
        	WEBSOCKIFY_PORT=$(($WEBSOCKIFY_PORT + $PORT));
        	echo $WEBSOCKIFY_PORT;
        	break;
        fi
	done

    if [ $1x = "-web"x ]   #默认打开搜狐网页
	then
         cp  $X_DIR/xstartup-copy $X_DIR/xstartup;
	 echo "firefox $2" >> $X_DIR/xstartup;
    else
	if [ $1x = "-doc"x ]     #默认开打doc文档
	then
		if [ -f "$2" ];then
         	cp  $X_DIR/xstartup-copy $X_DIR/xstartup;
	 	echo "xdg-open \"$2\"" >> $X_DIR/xstartup;
		else 
	 	echo "Error FilePath!" >&2
		exit
		fi
	fi
    fi
	 vncserver :$VNC_PORT

	 #check websockify is opened? if not then open 
	websockifyList=`ps aux | grep $WEBSOCKIFY_PORT | grep websockify` >> /dev/null
	if [ "$websockifyList"x = ""x ]; then
			VNC_PORT=$(($VNC_PORT + 5900));
        	gnome-terminal -e "$W_DIR/websockify.py $WEBSOCKIFY_PORT $HOST:$VNC_PORT"
        	#echo "$WEBSOCKIFY_PORT $HOST:$VNC_PORT " >&2
        	#$W_DIR/websockify.py $WEBSOCKIFY_PORT $HOST:$VNC_PORT
    fi
	 
fi
