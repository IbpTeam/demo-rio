#!/bin/sh

toppath=$(cd "$(dirname $0)"; pwd)
$toppath/node-webkit-v0.8.4/nw $toppath/nodewebkit
