#!/bin/bash

#关闭vncserver 
#后面跟一个参数 当为数字时，关闭对应的服务，当为all时，关闭所有服务

X_DIR="/home/wangtan/.vnc";
if [ $# != 1 ]
then
	echo "close.sh: Error Input! $#" >&2
else
	if [ $1x = "all"x ];then
		lists=`ls $X_DIR | grep .pid` >> /dev/null
		for list in $lists;do	
		 	list=${list%.*}   #截取字符串list中，点号前边的字符串
			list=${list#*:}	  #截取字符串list中，冒号后边的字符串,
			vncserver -kill :$list;
			#vnc_port=${{list}};
			websockify_port=$(($list + 5958));
			websockify_pid=`ps aux | grep $websockify_port | grep websockify | awk '{print $2}'`;  
			echo "kill websockify: $websockify_pid , port = $websockify_port";
			if [ "$websockify_pid"x != ""x ]; then
				echo "kill websockify: $websockify_pid , port = $websockify_port";
				kill -9 $websockify_pid;
			fi
		done

	elif [[ $1 =~ ^[0-9]+$ ]];then
   		if [ $1 -lt "5958" ]; then      # if port < 5900 ,then the port is vnc port;
   			list=`ls $X_DIR | grep .$1.pid` >> /dev/null
   			if [ "$list"x != ""x ]; then
				vncserver -kill :$1;
				websockify_port=$(($1 + 5958));
				websockify_pid=`ps aux | grep $websockify_port | grep websockify | awk '{print $2}'`;  
				if [ "$websockify_pid"x != ""x ]; then
					kill -9 $websockify_pid;
				fi
			else echo "No vncserver: $1"
			fi
		else 							#else the port is websockify port;
			websockify_pid=`ps aux | grep $1 | grep websockify | awk '{print $2}'`;  
			if [ "$websockify_pid"x != ""x ]; then
				kill -9 $websockify_pid;
			fi
				vnc_port=$(($1 - 5958));
				list=`ls $X_DIR | grep .$vnc_port.pid` >> /dev/null
   			if [ "$list"x != ""x ]; then
   				vncserver -kill :$vnc_port;
   				echo "success"
   			fi
		fi
	else echo "close.sh: #1 is error:$1";
	fi
fi

