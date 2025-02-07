#!/bin/sh
# echo
# echo "Connect Quest and hit <return> to continue..."
# read Z
# echo
sleep=5
cropWidth=905
cropHeight=918
maxWidth=2064
maxHeight=2208
leftOffset=400
topOffset=160

adb disconnect
adb kill-server

adb tcpip 5555

sleep $sleep

QUEST_IP=`adb shell ip route | grep 'proto kernel' | awk '{print \$9}'`
echo $QUEST_IP


# echo
# echo "Disconnect Quest and hit <return> to continue..."
# read Z
# echo

sleep $sleep

adb connect $QUEST_IP:5555

sleep $sleep

#-b=bitrate -m= max-size
# scrcpy --crop=2064:2208:2064:100 --window-title='Quest3Cast' --position-x-offset=-520 --position-y-offset=-490  --no-audio --tcpip=$QUEST_IP
#scrcpy --crop=2064:2108:2064:100 --window-title='Quest3Cast' --angle=-22 --scale=195 --position-x-offset=-520 --position-y-offset=-490  --no-audio --tcpip=$QUEST_IP
params=" --crop=$cropWidth:$cropHeight:$((maxWidth + leftOffset)):$topOffset --angle=-20 --tcpip=$QUEST_IP"
echo $params
scrcpy $params


osascript -e 'tell application "Terminal" to quit'
# exit 0