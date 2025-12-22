#!/usr/bin/env bash

echo "                💥💥💥💥💥 Welcome to the boom installer  💥💥💥💥💥"
echo
echo "This script will set you up as a BOOMBOSS to run a local installation of the .boomrc!"

if [ -z "$USER" ]; then
  echo .boominstaller: WARNING: USER is unset. The .boomrc expects the USER env var to be set before source. Defaulting to $(whoami) and continuing...
  echo .boominstaller: WARNING: Either set USER in \$BOOMCFGFILE or set BOOMWARN=no before sourcing to suppress .boomrc warnings.
  USER="$(whoami)"
fi

# These variables are horribly named
# BOOMINSTALL will be where personal boom data / boss data for everyone is stored
# BOOMRCS will be EXPECTED_BOOMRCS/rcs, aka the path to .boomrc
EXPECTED_BOOMRCS=${XDG_CONFIG_HOME:-$HOME/.config}/boom
EXPECTED_BOOMINSTALL=${XDG_DATA_HOME:-$HOME/.local/share}/boom

createFile() {
  if [ -e "$EXPECTED_BOOMINSTALL/$1" ]; then
    echo ERROR: $1 already exists in $EXPECTED_BOOMINSTALL
    return 1
  fi

  echo Creating $EXPECTED_BOOMINSTALL/$1 || return 1
  echo -ne "$2" > $EXPECTED_BOOMINSTALL/$1 || return 1
  chmod 777 $EXPECTED_BOOMINSTALL/$1 || return 1

  return 0
}

if [ "$0" != "${0##*/}" ]; then
  echo ERROR: Please run this script from the directory it is located in
  exit 1
fi

if [ ! -d "$EXPECTED_BOOMRCS" ]; then
  echo $EXPECTED_BOOMRCS does not exist - change this script to run where boom is cloned
  exit 1
fi
if [ ! -d "$EXPECTED_BOOMINSTALL" ]; then
  echo $EXPECTED_BOOMINSTALL does not exist - will create
  \mkdir -pv $EXPECTED_BOOMINSTALL
fi

echo Treating $EXPECTED_BOOMINSTALL as /BOOMUSERDIR/BOOMBOSS/BOOMINSTALL, aka /${HOME%$USER}/$USER/${EXPECTED_BOOMINSTALL#$HOME} \(// delimited\)
echo
echo "Using $EXPECTED_BOOMINSTALL for files owned by BOOMBOSS ($USER)"
echo Expecting .boomrc to live in $EXPECTED_BOOMRCS/rcs
read -p "Is this correct [y/N]?" respY
if [[ ! " y yes yup fs " =~ " ${respY,,} " ]]; then
  exit 1
fi

# Each dir to boominstall needs to be accessible by all users - this could look like perms or a shared group
longpath=
for path in ${EXPECTED_BOOMINSTALL//\// }; do
  if [[ ! " 777 755 " =~ " $(stat -c "%a" "$longpath/$path") " && "$1" != "skippermcheck" ]]; then
    echo "WARNING: $longpath/$path is not 755 or higher - please resolve and try script again"
    echo
    echo "         If planning to use boom with multiple users, all users must be able to see"
    echo "          and modify the boom files in each others\' home directories. This can look"
    echo "          like a shared users group or lenient access perms to local homes. Because"
    echo "          this is a local development tool, we are not as worried about permission security."
    echo
    echo "         If using a shared group or only a single user, run this script as \`$0 skippermcheck\`"
    echo "          to ignore warning."
    unset longpath
    exit 1
  fi
  longpath+="/$path"
done

# Each dir to boomrcs needs to be accessible by all users
longpath=
for path in ${EXPECTED_BOOMRCS//\// }; do
  if [[ ! " 777 755 " =~ " $(stat -c "%a" "$longpath/$path") " && "$1" != "skippermcheck" ]]; then
    echo "WARNING: $longpath/$path is not 755 or higher - please chmod and try script again"
    echo
    echo "         If planning to use boom with multiple users, all users must be able to see"
    echo "          and copy the boom rc files in the boss' home directory. This can look"
    echo "          like a shared users group or lenient access perms to BOOMRCS. Because"
    echo "          this is a local development tool, we are not as worried about permission security."
    echo
    echo "         If using a shared group or only a single user, run this script as \`$0 skippermcheck\`"
    echo "          to ignore warning."
    unset longpath
    exit 1
  fi
  longpath+="/$path"
done
unset longpath

firstQuest=e9fe7e88e89d532379960402db8f9458194dae772aa5fda5a12806c22215f0ff
chmod 777 $EXPECTED_BOOMINSTALL
createFile .boomusers         " $USER\n"        || exit 1
createFile .boomhall          ""                || exit 1
createFile .boomlog           ""                || exit 1
createFile .boomdroughtrecord " $USER 0\n"      || exit 1
createFile .boommeterlog      ""                || exit 1
createFile .boomquest         "$firstQuest"     || exit 1 # it's ls, people
createFile .boomtimeout       ""                || exit 1
createFile .boomfavor         "$USER\n $USER\n" || exit 1

if [ ! -f ".boomemojis" ]; then
  echo Creating symlink to .boomemojis
  ln -s $EXPECTED_BOOMRCS/.boomemojis $EXPECTED_BOOMINSTALL || exit 1
fi
if [ ! -f ".boomtables.py" ]; then
  echo Creating symlink to .boomtables.py
  ln -s $EXPECTED_BOOMRCS/.boomtables.py $EXPECTED_BOOMINSTALL || exit 1
fi

BOOMCFGFILE=$EXPECTED_BOOMINSTALL/.boomconfig
BOOMRC_FILE=$EXPECTED_BOOMRCS/rcs/.boomrc
BOOMINSTALL=${EXPECTED_BOOMINSTALL#$HOME/}
BOOMRCS=${EXPECTED_BOOMRCS#$HOME/}/rcs
BOOMUSERDIR=${HOME%/$USER}
BOOMUSERDIR=${BOOMUSERDIR#/}
BOOM_SKIPPERMCHECK=$1
echo Sourcing $BOOMRC_FILE to generate .boomconfig and user-specific files
if [ -f "$BOOMRC_FILE" ]; then
  PROMPT_COMMAND=_boommeter source $BOOMRC_FILE
else
  echo ERROR: Could not source $BOOMRC_FILE
  exit 1
fi

echo Creating new file .boomrc in ~ with config applied for users to source
localrc=~/.boomrc
echo BOOMCFGFILE=$BOOMCFGFILE >> $localrc
echo source $BOOMRC_FILE >> $localrc

echo
echo Setting BOOMINSTALL to ${EXPECTED_BOOMINSTALL#$HOME/}
echo "readonly BOOMINSTALL=\"${EXPECTED_BOOMINSTALL#$HOME/}\" &>/dev/null" >> $BOOMCFGFILE
echo Setting BOOMRCS to ${EXPECTED_BOOMRCS#$HOME/}
echo "readonly BOOMRCS=\"${EXPECTED_BOOMRCS#$HOME/}/rcs\" &>/dev/null" >> $BOOMCFGFILE
echo Setting BOOMUSERDIR to $BOOMUSERDIR
echo "readonly BOOMUSERDIR=\"$BOOMUSERDIR\" &>/dev/null" >> $BOOMCFGFILE

if [[ "$1" == "skippermcheck" ]]; then
  echo Setting perm check skip in $BOOMCFGFILE
  echo -e "\nBOOM_SKIPPERMCHECK=skippermcheck" >> $BOOMCFGFILE
fi

echo
echo To get started, source ~/.boomrc!

echo
echo "                💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥"

