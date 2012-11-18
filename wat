#!/bin/bash

# Foreground terminal colors
cfblack="\033[30m";
cfred="\033[31m";
cfgreen="\033[32m";
cfyellow="\033[33m";
cfblue="\033[34m";
cfmagenta="\033[35m";
cfcyan="\033[36m";
cfwhite="\033[37m";

# Background terminal colors
cbblack="\033[40m";
cbred="\033[41m";
cbgreen="\033[42m";
cbyellow="\033[43m";
cbblue="\033[44m";
cbmagenta="\033[45m";
cbcyan="\033[46m";
cbwhite="\033[47m";

# Text attributes
tnorm="\033[0m"; 
tbold="\033[1m";
tunder="\033[4";
tblink="\033[5m";
treverse="\033[7m";


# Reset
creset="\033[0m";

declare -a args
args=(${*// / }) 

cmd=$1;

if [ $# -lt 1 ]
then
  echo
  echo -e "${tbold}${cfwhite}Usage:${cfblue} $0 ${cfyellow}<command>${creset}"
  echo
  echo -e "\t${tbold}${cfgreen}where ${cfyellow}<command> ${cfwhite}is :-${creset}"
  echo
  echo -e "\t${tbold}${cfyellow}- bootstrap${cfgreen}:${creset} - Installs dependencies ${cfwhite}[${cfcyan}nodeunit${cfwhite},${cfcyan}profile${cfwhite},${cfcyan}byline${cfwhite},${cfcyan}docco${cfwhite}]${creset} via ${cfcyan}npm."
  echo -e "\t${tbold}${cfyellow}- test${cfgreen}:${creset} - Runs ${cfcyan}nodeunit${creset} tests."
  echo -e "\t${tbold}${cfyellow}- docco${cfgreen}:${creset} - Runs ${cfcyan}docco${creset} to generate docs."
  echo -e "\t${tbold}${cfyellow}- profile${cfgreen}:${creset} - Runs ${cfcyan}profile${creset}'d benchmark."
  echo -e "\t${tbold}${cfyellow}- microbench${cfgreen}:${creset} - Runs a micro benchmark."
  echo -e "\t${tbold}${cfyellow}- samples${cfgreen}:${creset} - Runs samples."
  echo
  echo -e "\t${cfred}${cwhite}No args and you get this help. :)${creset}"
  echo
  exit
fi

echo -e "${tbold}${cfblue}Wat? ${cfyellow}$1${creset}"
case $cmd in
  bootstrap )
    sudo easy_install pygments
    npm install nodeunit profile docco byline
	;;
  test )
    if [ $# -gt 1 ]
    then
	  NODE_PATH=lib node_modules/nodeunit/bin/nodeunit ${args[@]:1}
    else
      NODE_PATH=lib node_modules/nodeunit/bin/nodeunit test;
    fi
	;;
  docco )
    node_modules/docco/bin/docco `find lib -name \*.js`
    ;;
  profile )
   NODE_PATH=lib node_modules/profile/bin/nodeprofile -o=profile.txt samples/microbench-nontemporal.js
    ;;
  microbench )
    NODE_PATH=lib node samples/microbench-nontemporal.js
    ;;
  samples )
    if [ $# -gt 1 ]
    then
      NODE_PATH=lib node "${args[@]:1:$#-1}"
    else
      echo
      echo -e "\t${tbold}${cfyellow}Usage:${cfblue} ./wat ${creset}${tbold} samples ${cfyellow}<sample>"
      echo
      echo -e "\twhere <sample> is:${creset}"
      echo -e "\t\t${cfcyan}samples/analytics.js${creset} - Runs the eep.js statistics package sample"
      echo -e "\t\t${cfcyan}samples/composite.js${creset} - Runs the eep.js composite function sample"
      echo -e "\t\t${cfcyan}samples/custom.js${creset} - Runs Tim Bray's Wide Finder inspired custom aggregate function sample"
      echo -e "${creset}"
    fi
	;;
esac
