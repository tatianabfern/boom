#!/usr/bin/env bash

EXPECTED_BOOMRCS=${XDG_CONFIG_HOME:-$HOME/.config}/boom
EXPECTED_BOOMINSTALL=${XDG_DATA_HOME:-$HOME/.local/share}/boom

if [ "$0" != "${0##*/}" ]; then
  echo ERROR: Please run this script from the directory it is located in
  exit 1
fi

if [ -z "$USER" ]; then
  echo .siteconfig: WARNING: USER is unset. The .boomrc expects the USER env var to be set before source. Defaulting to $(whoami) and continuing...
  echo .siteconfig: WARNING: Either set USER in \$BOOMCFGFILE or set BOOMWARN=no before sourcing to suppress .boomrc warnings.
  USER="$(whoami)"
fi

if [ ! -d "$EXPECTED_BOOMRCS" ]; then
  echo $EXPECTED_BOOMRCS does not exist - change this script to run where boom is cloned
  exit 1
fi
if [ ! -d "$EXPECTED_BOOMINSTALL" ]; then
  echo $EXPECTED_BOOMINSTALL does not exist - change this script to point to BOOMINSTALL
  exit 1
fi

echo Treating $EXPECTED_BOOMINSTALL as /BOOMUSERDIR/BOOMBOSS/BOOMINSTALL, aka /${HOME%$USER}/$USER/${EXPECTED_BOOMINSTALL#$HOME} \(// delimited\)
echo
echo "Using $EXPECTED_BOOMINSTALL for server location"
echo Expecting .boomserver to live in $EXPECTED_BOOMRCS/.boomserver
read -p "Is this correct [y/N]?" respY
if [[ ! " y yes yup fs " =~ " ${respY,,} " ]]; then
  exit 1
fi

configfile=$EXPECTED_BOOMINSTALL/.boomconfig
if [ ! -f "$configfile" ]; then
  echo ERROR: Could not find .boomconfig - ensure boom is set up
  exit 1
fi
source $configfile

echo Copying over .boomserver from template...
if [ -d "$EXPECTED_BOOMINSTALL/.boomserver/data" ]; then
  echo Preserving current site data...
  mv -v "$EXPECTED_BOOMINSTALL/.boomserver/data" "$EXPECTED_BOOMINSTALL"
fi
mkdir -pv $EXPECTED_BOOMINSTALL/.boomserver/data/env || exit 1
chmod 777 $EXPECTED_BOOMINSTALL/.boomserver/data/env || exit 1
\cp -Rvf $EXPECTED_BOOMRCS/.boomserver $EXPECTED_BOOMINSTALL || exit 1
if [ -d "$EXPECTED_BOOMINSTALL/data" ]; then
  echo Restoring existing site data...
  rm -r "$EXPECTED_BOOMINSTALL/.boomserver/data"
  mv -v "$EXPECTED_BOOMINSTALL/data" "$EXPECTED_BOOMINSTALL/.boomserver"
fi

backendfile=$EXPECTED_BOOMINSTALL/.boomserver/.boombackend.py
echo Configuring $backendfile using boom config...
sed -i "\|BOOMUSERDIR| s|<unset>|\"$BOOMUSERDIR\"|" $backendfile || exit 1
sed -i "\|BOOMBOSS| s|<unset>|\"$BOOMBOSS\"|" $backendfile || exit 1
sed -i "\|BOOMRCS| s|<unset>|\"$BOOMRCS\"|" $backendfile || exit 1
sed -i "\|BOOMINSTALL| s|<unset>|\"$BOOMINSTALL\"|" $backendfile || exit 1
sed -i "\|BOOMPORT| s|<unset>|\"$BOOMPORT\"|" $backendfile || exit 1
sed -i "\|BOOMCFGFILE| s|<unset>|\"$configfile\"|" $backendfile || exit 1

servicefile=$EXPECTED_BOOMINSTALL/.boomserver/boomzone.service
echo Configuring $servicefile using boom config...
sed -i "s|<USER>|$USER|" $servicefile || exit 1
sed -i "s|<TL_BOOMINSTALL>|/$BOOMUSERDIR/$BOOMBOSS/$BOOMINSTALL|" $servicefile || exit 1

echo
read -p "IMPORTANT: The default password (DEFPASSWD) defined in .boomserver/.boombackend.py is the sha256 hash of 'boomers'. Hit enter to acknowledge. " respY
echo
read -p "Server files configured. Would you like to enable the service? [y/N]" respY
if [[ ! " y yes yup fs " =~ " ${respY,,} " ]]; then
  echo Setup complete. Run \`cd $EXPECTED_BOOMINSTALL/.boomserver\; python3 ${backendfile#$EXPECTED_BOOMINSTALL/.boomserver/}\` to start the site at $BOOMSITE
  exit 0
fi

echo Enabling and starting boomzone.service
echo "The following commands are about to run:"
echo "  sudo ln -sv $servicefile /usr/lib/systemd/system/ || exit 1"
echo "  sudo systemctl enable boomzone || exit 1"
echo "  sudo systemctl start boomzone || exit 1"

sudo ln -sv $servicefile /usr/lib/systemd/system/ || exit 1
sudo systemctl enable boomzone || exit 1
sudo systemctl start boomzone || exit 1

echo Setup complete. Start boom zone in browser with \`boomzone\` or navigate to $BOOMSITE to view

