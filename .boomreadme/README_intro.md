# 💥 BOOM! 💥

The goal of this project is to bring the boom to the dev environment. At its purest, the .boomrc is an environment config that randomly ranks users' commands as they are run.

## Setup

To install this repo in your local environment, simply:
```bash
cd ${XDG_CONFIG_HOME:-~/.config}
git clone git@github.com:Vision940/boom # Could also clone with https or unzip repo .zip here
cd boom
bash .boominstaller.bash
```
This will get you set up as a BOOMBOSS and set up the default `.boomconfig` file.

Once the boom installer has run, take a look at `${XDG_DATA_HOME:-~/.local/share}/boom/.boomconfig` and make sure the variables set there look alright. The breakdown of what each variable means is below.

Now, `source ~/.boomrc` to see the intro message and instructions on how to run the boommeter after each command. Don't miss adding the recommended `PROMPT_COMMAND` and `source ~/.boomrc` lines to your `.bashrc` on install as described in the intro message.

If you would like to set up the `BOOM Zone` website, just run the `.siteconfig.bash` script in the top level of the cloned repo.

At this point, you are ready to boom! If there are other users in the /BOOMUSERDIR directory that would like to run the boom, just have them add `_boommeter` to their prompt command and source `~BOOMBOSS/.boomrc`! This is most easily done in the user's `.bashrc` file.

NOTE: When running in a multi-user local environment, users either need to be in a shared group that is used for the path to boom files or the path to boom files for every user needs to be accessible/writable by all users.

## Manual Install

The `.boominstaller.bash` script is tailored to an easy install. There are, however, many ways to install the boom. Follow the steps the boom install script is taking, but feel free to customize it or change paths to install in different locations. As long as the `.boomconfig` file is representative of your changes and the `.boomrc` you source correctly sets the BOOMCFGFILE environment variable, you will be good to go.

## Config

These are the config variables that are expected to be found in BOOMCFGFILE (default `/BOOMUSERDIR/BOOMBOSS/BOOMINSTALL/.boomconfig`):

|Parameter|Meaning|Default|
|--|--|--|
|BOOMUSERDIR|This is the top-level dir where user directories live, but without a leading or trailing slash|home|
|BOOMADMINS|This is a space-delimited string of usernames that have admin privileges in the site chat|$USER|
|BOOMBOSS|This is the user that set up the boom installation and has the BOSS files in their local directory|$USER|
|BOOMINSTALL|This is the directory where local boom data/files live post-install|.local/share/boom|
|BOOMRCS|This should be \<repo-clone\>/rcs|.config/boom/rcs|
|BOOMTZ|This is the local timezone of the boom install|\<local user tz\>|
|BOOMCONTS|This is the container engine command to be used (for boomexec)|sudo docker|
|BOOMPORT|This is the port where the website will live|9029|
|BOOMSITE|This is the site address for boomzone|http://$hostname:9029|
|BOOMSITECMD|This is the browser command that boomzone will use to open the zone from the cmd line|firefox --new-tab|

The .boomrc will add missing required config variables to BOOMCFGFILE automatically; ensure that the values there are what you want for your installation.

Check out other optional BOOMCFGFILE and user-defined config variables using the `boom conf` command!

## RC Breakdown

Here is a breakdown of all .boom\*rc files and a brief description of what they each contain:

|File|Description|Default|
|--|--|--|
|.boomrc|The main code. The boom will not run without this file. The recommended way to source this is through a created script `~/.boomrc` that sets BOOMCFGFILE then sources this file.|Sourced|
|.boomalphrc|This is a simple rc that contains text2ascii mappings for the `chat /text` command. It is far from essential, but it is separate because of how much space it takes up.|Sourced|
|.boombarrc|This is a pseudo-WIP rc that draws a status bar on the last line of the terminal with the `boombar` command. There are many configuration options for this, check out `boomdocs boombar` for more details.|Sourced|
|.boomdevrc|This rc is not in the BOOMRCS directory by default but can be enabled with `ln -s ../.boomdevrc .` in the BOOMRCS directory. It enables the `boomdev` command, which has utilities for those wanting to develop the boom.|Not Sourced|
|.boomdocsrc|This is a pretty essential rc that enables the commented documentation above each function/alias in the .boomrc to be parsed and printed to the terminal like a --help text.|Sourced|
|.boomenvrc|This is a simple rc that enables boom commands to be run without `boom` in front of them. It is enabled with `boom env` after sourcing `.boomrc`|Not Sourced|
|.boomgoalrc|This rc includes necessary code for the `boom goal` command to function.|Sourced|
|.boomholidayrc|This rc is an optional rc that adds festive themes throughout the year!|Sourced|
|.boompollrc|This rc includes necessary code for the `boom poll` command to function.|Sourced|
|.boomsimplerc|This is the rc that enables boom sessions through `boomexec` and `boomssh`. It is essential if you plan to take the boom with you when you travel to other machines/containers.|Sourced|

Again, the recommended way to source these is by creating a custom `.boomrc` file in an easy-to-access place that sets BOOMCFGFILE and sources the repo's `.boomrc` file. This breakdown is just here to provide brief documentation on what each rc file does.

## Updates

To update boom, simply `git pull` the latest changes, read the patch notes, and re-source the `.boomrc` to make sure nothing has changed.

If the site is in use and the site files have changed since the last update, re-run the `.siteconfig.bash` script. This will set up the server fresh based on the current state of the generic repo server files, and it will preserve the server's local `data/` directory.

If updating with a downloaded .zip of the repo, `rsync -av --delete <unzipped repo dir> <install dir>` should work well to update the existing install without git.

## Requirements

To run the boom, you will need `bash 4.4` or higher, as well as typical bash utilities, such as `sed`, `awk`, `date`, and `curl`.

To run the server, you will need `python3.9` or higher, with the `bcrypt` and `flask` packages installed.

## Uninstall

Uninstallation is very straightforward. To uninstall all files created outside of the repo clone, just `rm -rf /$BOOMUSERDIR/$BOOMBOSS/$BOOMINSTALL` and `rm ~/.boomrc`! Be aware that this will erase all personal data, such as rankings and records. Each user will also need to remove their `~/$BOOMINSTALL` directory to uninstall. The repo clone itself must also be removed, of course. If the site was set up as a service, that service file will need to be removed as well.

## 

💥💥💥💥💥 Have fun booming! 💥💥💥💥💥

