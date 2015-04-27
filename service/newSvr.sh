if [ x == $1x ]; then
  echo 'Usage: ./newSvr.sh ${service name}'
  exit 1
fi

mkdir $1 && cd $1 && mkdir implements interface && npm init
