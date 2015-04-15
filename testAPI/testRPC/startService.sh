i=0
while read line; do
  # echo $line
  i=`expr $i + 1`
  tmp=($line)
  name[$i]=${tmp[0]}
  path[$i]=${tmp[1]}
done < "SvrList"

l=${#name[@]}
num=`expr $l + 1`
until [[ $num -le $l ]]; do
  i=1
  echo "Please choose a Service to run:"
  for s in ${name[@]}; do
    echo "$i. $s"
    i=`expr $i + 1`
  done
  echo "0. Exit test"

  read num
  if [ $num -gt $l ]; then
    echo "Please choose a right service to start."
  fi
done

if [ $num -eq 0 ]; then
  exit 0
fi

echo "Starting ${name[$num]} service"
nodejs ${path[$num]}

# case $num in
	# 1) echo "Starting mix service"
	# dir='../../service/mix/start.js'
	# node $dir
	# ;;
	# 2) 
	# echo "not DONE yet, please add start data service code here."
	# ;;
	# *) echo 'Please choose a right service to start.'
	# ;;
# esac
