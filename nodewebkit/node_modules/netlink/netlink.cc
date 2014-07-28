#include <sys/types.h>  
#include <sys/socket.h>  
#include <asm/types.h>  
#include <linux/netlink.h>  
#include <linux/rtnetlink.h>  
#include <stdlib.h>  
#include <stdio.h>  
#include <sys/ioctl.h>  
#include <linux/if.h>  
#include <string.h>  
#include <node.h>
#include <v8.h>

using namespace v8;
//using namespace std;
#define BUFLEN 20480  
  
Handle<Value> RunCallback(const Arguments& args) {
    HandleScope scope; 
    Local<Function> cb = Local<Function>::Cast(args[0]);
    const unsigned argc = 1;
    int fd, retval;  
    char buf[BUFLEN] = {0};  
    int len = BUFLEN;  
    struct sockaddr_nl addr;  
    struct nlmsghdr *nh;  
    struct ifinfomsg *ifinfo;  
    struct rtattr *attr;  
  
    fd = socket(AF_NETLINK, SOCK_RAW, NETLINK_ROUTE);  
    setsockopt(fd, SOL_SOCKET, SO_RCVBUF, &len, sizeof(len));  
    memset(&addr, 0, sizeof(addr));  
    addr.nl_family = AF_NETLINK;  
    addr.nl_groups = RTNLGRP_LINK;  
    bind(fd, (struct sockaddr*)&addr, sizeof(addr));  
    while ((retval = recv(fd, buf, BUFLEN,0)) > 0)  
    {  
        for (nh = (struct nlmsghdr *)buf; NLMSG_OK(nh, retval); nh = NLMSG_NEXT(nh, retval))  
        {  
            if (nh->nlmsg_type == NLMSG_DONE)  
                break;  
            else if (nh->nlmsg_type == NLMSG_ERROR)  
                return scope.Close(String::New("error"));  
            else if (nh->nlmsg_type != RTM_NEWLINK)  
                continue;  
            ifinfo = (struct ifinfomsg *)NLMSG_DATA(nh);  
            printf("%u: %s", ifinfo->ifi_index,(ifinfo->ifi_flags & IFF_LOWER_UP) ? "up" : "down" );  
        
            attr = (struct rtattr*)(((char*)nh) + NLMSG_SPACE(sizeof(*ifinfo)));  
            len = nh->nlmsg_len - NLMSG_SPACE(sizeof(*ifinfo));  
            char str[50];
            for (; RTA_OK(attr, len); attr = RTA_NEXT(attr, len))  
            {  
                if (attr->rta_type == IFLA_IFNAME)  
                {  
                    printf(" %s", (char*)RTA_DATA(attr));  
                    strcpy(str,(char*)RTA_DATA(attr));
                    break;  
                }  
            }  
            printf("hello:%s\n",str);
            //Local<Value> argv[argc] = { Local<Value>::New((ifinfo->ifi_flags & IFF_LOWER_UP) ? String::New(strcat("up#","sss")) : String::New(strcat("down#","sss"))) };
            Local<Value> argv[argc] = { Local<Value>::New((ifinfo->ifi_flags & IFF_LOWER_UP) ? String::New("up") : String::New("down")) };
            cb->Call(Context::GetCurrent()->Global(), argc, argv);
            return scope.Close(Undefined());
            //return scope.Close((ifinfo->ifi_flags & IFF_LOWER_UP) ? String::New("up") : String::New("down"));  
            
        }  
    }  
}

void Init(Handle<Object> exports, Handle<Object> module) {
  module->Set(String::NewSymbol("exports"),
      FunctionTemplate::New(RunCallback)->GetFunction());
}
NODE_MODULE(netlink, Init) 
