printf "Please choose a Service to run:
	1, mix
	2, data
	...
"
read num
case $num in
	1) echo "Starting mix service"
	dir='../../service/mix/start.js'
	node $dir
	;;
	2) 
	#start data service
	;;
	*) echo 'Please choose a right service to start.'
	;;
esac
