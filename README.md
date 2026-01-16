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


## Docs
The below boomdocs output was generated as of patch 2.8.21:

```text
Commands in the .boomrc suite:
	doombot
		turn off boombot mode in style!
		this alias runs `boombot exit`
	doomsite
		kill site if launched with `boomzone` cmd
		`doomzone` is aliased to this as well
	doom
		pause random output and turn off all boom commands
		also will kill site launched with `boomzone`
		clears terminal after running - will persist and clear all terminals as of patch 1.7.13
		resume boom functionality with `bringtheboom`
	bringtheboom
		activate the boom meter in all terminals!
		this command will re-activate the boom meter after running doom!
	boomhelp
		print important parts of boom intro text
		help functionality of boomhelp deprecated by boomdocs
	boomzone [summary | term]
		quick alias to run `boom zone`
	boomstoday
		quick alias to run `boom board today`
	text2ascii TEXT
		text2ascii will print a basic ascii version of input TEXT
		this command allows the equivalent functionality of `chat /text` in the cmd line
	boombar [conf | exit]
		boombar opens up a boom status bar on the bottom row of the terminal with fully customizable content!
		run `boombar conf` to view the custom BOOMBAR_* env vars and magic strings that can be used with them
		boombar will evaluate your configuration by replacing the auto-updated variable names with their current values
		run `boombar exit` to remove the bar from the terminal

		to have the bar show up on terminal startup, add `[[ "$-" =~ "i" ]] && boombar` to your .bashrc after sourcing the .boomrc!
	boomdocs [CMD]
		boomdocs lists all currently existent functions and aliases from boom rc files
		alternatively, show documentation for only one function or alias with CMD arg
	bang [NUM]
		bang will print NUM (default 1) booms to the terminal!
		this is useful to run with `chat $(bang X)` to put X booms in chat
	boommeter THING
		this function ranks THING on the boommeter!
	doommeter THING
		this function ranks THING on the doommeter...
	boomavg [CMD]
		this function prints your average rank and total booms for every command!
		if CMD arg present, function will only print avg for CMD
	boom <cmd> <opts>
		central location for boomuser commands
		see `boomdocs` for other boom-related command help
		use options below in place of <cmd> <opts>

		avg [CMD]
			runs boomavg with optional CMD arg
		board [avg | drought | freq | full | today | top [NUM] | help | CMD | -] [USER USER ...]
			shows boom leaderboard for all boomusers
			users will be ordered by source date, USER args, or the space-delimited BOOMTABLECOLS env var (see `boom conf`)
			will print avg/freq/top/drought boards with all commands boomed by 2+ users by default, or:
	
			avg
				see and compare user avgs of all commands randomly boomed by more than one person
			drought
				see and compare longest & current droughts
			freq
				see and compare boom frequency for all commands randomly boomed by more than one person
			full
				see full chart of boom avgs and freqs including cmds only boomed by one user
			today
				see amount of booms each user has received today - same as `chat /boomstoday` but the output is sorted
			top
				see all-time top NUM (default 5) boomed commands for all users
			help
				show boom board help
			CMD
				see avg and freq boards for specific CMD for all users
			-
				use this before listing input column order for the default board command
		chat [/<cmd> | cipher | decipher | edit | env | clear | timeout | help] [COMMENT]
			post COMMENT to the boom zone (http://<host>:BOOMPORT)
			quote COMMENT in terminal or use env to avoid problematic chars in bash cmd line parsing
			use `chat` alias to be faster
			mention boomusers with @
	
			cipher COMMENT
				put COMMENT in code on the site
			clear
				save off and clear chat log from site
			decipher [NUM | CODE]
				read last NUM (default 5) ciphered lines in code on the site
				alternatively, input a CODE to decipher
			edit WORD REPLACEMENT
				find and replace WORD in last chat with REPLACEMENT string
				edited chats will show up with an asterisk on the site
				edit will walk you through all instances of word and give you a preview of the change
				REPLACEMENT can be multiple words with the use of quotes
			env
				enter a command line interface where each line is a chat command!
				the chat env is a fully-featured env that runs chat cmds without typing `chat`
				chats input to the env will escape special chars for you!
				supports emojis, /cmds, completion, mentions, ascii, ciphers, edits, etc.
				new chats and bot responses will print (newest on bottom) while in the env
				type "exit" to exit, "?" to see boom chat help, and "help" to see chat help in env
			timeout
				list current chat timeouts and minutes remaining for each
			help
				show chat /<cmd> help
			/<cmd>
				if <cmd> is valid, BoomBot will reply in chat!
				see `chat help` for valid <cmd> values!
		conf
			view configuration options and commands for the boom suite!
		drought [longest | rarity]
			the boom drought tracks how many unique commands have run since the last random boom
			the default boom drought behavior prints your current drought
	
			longest
				see the current longest boom drought
			rarity [fav] [NUM]
				see the rarity of a NUM length drought
				defaults to showing rarity of your current drought
				add fav positional arg for favorite odds
		env [exit | help]
			source the boom env to allow running boom commands with completion without the preceeding `boom`
			aliases created by this command will be printed to the terminal
			this will not overwrite existing commands
			exit will unalias env commands and help will print this help
	
			add `boom env &>/dev/null` to your .bashrc to start terminals with the boom env sourced!
		favorite [entries]
			display BoomBot's favorite user for the day!
			BoomBot's favorite has the odds of a random boom slashed by 1/3!
			get random booms to increase the odds of being the favorite tomorrow!
			add entries keyword to view current entries per user for tomorrow's drawing!
		hall
			display all who have entered the hallowed hall of BOOM
		latest
			display who was most recently randomly boomed
		meter THING
			runs boommeter on THING
		patchnotes [full | latest [NUM]]
			print latest boomrc patch notes
			use latest keyword to show NUM (default 1) latest lines of patch notes
			use full keyword to show all patch notes
		poll [create | list | print [TITLE] | vote [TITLE] | help]
			create, vote on, and view chat polls for all boomusers
			will run list by default, or:
	
			create
				enter an environment to build a poll to put in chat - env commands are displayed with `?`
			list
				list all polls found in the current chat session, as well as vote counts and expiration dates
			print [TITLE]
				print out most recent poll or poll described by TITLE
				TITLE will complete in cmd line with chat emoji completion available
			vote [TITLE]
				vote on most recent poll or poll described by TITLE
				TITLE will complete in cmd line with chat emoji completion available
			help
				show boom poll help
		silent
			toggles silent mode where _boommeter will still run but nothing will be printed
			this is useful if users don't want to doom but also don't want output
		todo
			list upcoming boomrc features
			loosely organized by priority - top TODO should be next up
		total [PERSON | all]
			view total booms for yourself, boomuser PERSON, or all boomusers
		zone [site | summary | term]
			print this help message by default
			run with these args to view the zone in different formats:
	
			site
				launch the boom zone site (http://<host>:BOOMPORT) from cmd line - allows killing site with doom
			summary
				display the boom boards/stats in the terminal as formatted on the default site layout
			term
				show an automatically updating site-like view of all three columns in the terminal!
				this "site view" has a unique summary and can be exited by pressing any key
				columns will be cut off in this view if the data is too long for the column
		help
			prints this help message
	boombot [conf | exit]
		boombot puts the terminal in BoomBot Mode!
		run commands in BoomBot Mode to earn SUPER booms from BoomBot!
		run `boombot conf` to see current state of customizable BoomBot Mode values!
		run `boombot exit` to exit BoomBot Mode

		auto mode allows _boommeter to put user in BoomBot Mode automatically if a super boom is available
		add `AUTOBOOMBOT=yes` to .bashrc after sourcing .boomrc to use auto mode

		to customize boombot's prompt, set BOOMBOTPROMPT with USER, HOSTNAME, and PWD in .bashrc
		the prompt should be set after sourcing .boomrc - default is ' USER\033[00m@\033[1;34mHOSTNAME\033[00m PWD'

		if you want to run a command in the prompt, set BOOMBOTPROMPTCMD to the desired command in .bashrc
		the command will be validated and run, and its output will show after BOOMBOTPROMPT and before ' > '
		the command should be set after sourcing .boomrc - default is unset
	chat [/<cmd> | cipher | decipher | edit | env | clear | timeout | help] [COMMENT]
		quick command to execute `boom chat`
		this command does not get stored in bash history
		see `boomdocs boom chat` and `boom chat help` for more detailed help
	boom{exec | ssh} [USER@]NAME [START-DIR]
		ssh as USER or BOOMCONTS (default 'sudo docker') exec to host/container at NAME, bringing the boom in and out with you!
		the created session will cd to START-DIR on startup if provided
		these functions will allow you to randomly boom in a foreign environment
		boomexec and boomssh can be chained together to export booms from multiple hosts/containers in one session
		this is enabled by exporting a stripped down version of _boommeter at each new login
		enabled commands in this "simple" mode are:

		boomsu
			run sudo su, but maintain the boom session as root
		boom{exec | ssh} [USER@]NAME
			chain exec/ssh to export booms from anywhere
		doom
			turn off the random boom meter and disable commands
		bringtheboom
			resume the random boom meter
		boommeter THING
			rank THING on the boom meter!

		booms acquired while away from home will be exported on exits and imported back to local rankings on origin session closure!
		booms acquired while away from home will count towards favorite entries if the favorite has been decided for the day
		a boom exec/ssh session is similar to patch 1.0.0 - you will not see 6 booms, super booms, droughts, favorite odds, or quests
		dynamic completion allows boomexec/boomssh to be completed both locally and in launched sessions!
		all boom-related functions, env variables, and files are removed/destroyed on session closure
		all boom-related commands are hidden from history in open sessions, but boomsu is still able to be boomed!
```

## Patch Notes
The below patchnotes output was generated as of patch 2.8.21:

```text
# 2.8.21 - re-write custom emojis on each source to instantly reflect changes
# 2.8.20 - bug fixes to support site logins - fixed board table cols bug and <user>.json generation
# 2.8.19 - more robust handling for EPOCHSECONDS -- not relying on bash being 5.0+
# 2.8.18 - boom zone updated to not open zone by default
# 2.8.17 - major change of heart - silently supporting bash pre-4.4 - old versions will just be more bug-prone with booming empty lines
# 2.8.16 - boommeterrunner now uses fc instead of history to determine last command run - avoids issues with multi line cmds
# 2.8.15 - add NYE to NY holiday emojis - happy 2026
# 2.8.14 - `boom conf` updated with more BOOMCFGFILE optional vars for boss
# 2.8.13 - BOOMNOWEEKENDFAV has more robust handling in boomstoday, boom favor, boomsession import, and chat /boomstoday
# 2.8.12 - chat env tracks history and can use up/down arrows to navigate, some 3.0.0 features in beta
# 2.8.11 - bar exit handling improved to prevent lingering bars
# 2.8.10 - check if user is root and if USER is unset on source
# 2.8.9  - support shorter board summary site-side (also site update for top 10 in info page)
# 2.8.8  - board summary now shows cmds only if users/5+2 have boomed - avg/freq solo boards still just need 2 users
# 2.8.7  - /ascii delete|rules now supported for more accessibility
# 2.8.6  - general bug fixes, ascii doesn't need \ escaped in file now
# 2.8.5  - site config is built with emoji preferences as well as column prefs
# 2.8.4  - restore boombot bar integration with background updater - lastbooms and bbmremark use global tmp files
# 2.8.3  - handle doom state in background bar updater
# 2.8.2  - installation bug fixes
# 2.8.1  - boombar handles boomnotify file if on
# 2.8.0  - major boombar improvements - bar updates in background and works better with less, man, vim, etc
# 2.7.10 - mentions handled in `chat edit`
# 2.7.9  - add complete docs call to boom env alias Exc docs
# 2.7.8  - `zone chat` and `zone booms` are deprecated in favor of `zone term`
# 2.7.7  - fix ascii display bug in chat env
# 2.7.6  - `doommeter` added
# 2.7.5  - BOOMBOTCHATFREQ config env var added
# 2.7.4  - chat clear only works with no further args and asks for confirmation
# 2.7.3  - set up site user account on sourcing .boomrc
# 2.7.2  - BOOMNOWEEKENDFAV config env var added
# 2.7.1  - `chat /roast random` and `chat /hype random` commands implemented
# 2.7.0  - boom boards have customizable columns now with completion
# 2.6.6  - boom emoji being different in two simultaneous boom sessions will no longer lose booms on export
# 2.6.5  - `boom conf` command documented
# 2.6.4  - boom roasts and hypes customizable in BOOMCFGFILE
# 2.6.3  - boom emojis entirely customizable - boom conf added but not in docs
# 2.6.2  - boom holiday update - optional .boomholidayrc provides holiday themed boom emojis!
# 2.6.1  - `board top NUM` now shows NUM top boomed commands
# 2.6.0  - `zone term` added to view an updating version of the site from a terminal
# 2.5.10 - complete with ssh completion function no matter what it's called for boomssh, fallback is complete -A hostname
# 2.5.9  - only check config if not site runner
# 2.5.8  - chat env is fully featured, chat/boom env both documented
# 2.5.7  - fix BOOMTZ to use timedatectl or /etc/localtime instead of date +%Z
# 2.5.6  - add boomdevrc with initial `boomdev commit` command attempt to automatically append current boomdocs to README.md
# 2.5.5  - update boomdocs to have no bold option for readme generation
# 2.5.4  - add config arguments to make boom installable/configurable for anyone
# 2.5.3  - set BOOMTZ in config file so all machines are looking at local dates/times for date-related functionality
# 2.5.2  - boombar initializes with BBMREMARK set if AUTOBOOMBOT turns boombot on
# 2.5.1  - add .boomconfig for customization outside of defaults - BOOMCFGFILE must be set when sourced
# 2.5.0  - migrate boom files to .config
# 2.4.7  - chat env completion spits out options on tab hit
# 2.4.6  - chat env completion completes from where the cursor is now
# 2.4.5  - bug fixes to boom suboptions completion when using chat cmds and boombot chatting on doom/bringtheboom
# 2.4.4  - behavior change - drought defaults to just show your drought, `drought me` still supported but no longer in docs
# 2.4.3  - modulo 0 quest reroll stopped and /corecarl leading 0 removed, quest rerolls based on if quest file has been changed that day, not boom log
# 2.4.2  - `chat /corecarl` added
# 2.4.1  - boombot chats when someone dooms/bringstheboom
# 2.4.0  - chat env is full-featured with completion, commands, ascii, and mentions!
# 2.3.10 - chat env has full chat completion for all but emojis and mentions
# 2.3.9  - chat env has basic hard-coded completion
# 2.3.8  - chat env supports emojis and chat can replace -emoji- strings if they weren't completed in terminal
# 2.3.7  - zone chat uses same chat printer fxn as chat env that flips chat but not ascii, env cannot be at beginning of chat env chat
# 2.3.6  - chat env can handle CIPHER, EDITED, ASCII tags and print out chats since last chat into env
# 2.3.5  - `chat env` added but not documented
# 2.3.4  - boombar/bot env are now boombar/bot conf externally to not be confused with new boom env and upcoming chat env
# 2.3.3  - boom env adds docs alias
# 2.3.2  - board, env, patchnotes, and drought all have semi-hidden help subarg that will print out boomdocs from case without saying error on the arg
# 2.3.1  - DROUGHT WATCH print added to boom log
# 2.3.0  - `boom env` added but not documented
# 2.2.21 - boom board can be called with CMD or help now
# 2.2.20 - calls to bc use here strings now instead of echo with a pipe
# 2.2.19 - drought rarity now takes "fav" arg
# 2.2.18 - BOOMPATCH can be shown in boombar
# 2.2.17 - boombar is finally documented
# 2.2.16 - boombar env now includes BTODAY args for today's booms for $USER and today's leaderboard top 3 names/numbers
# 2.2.15 - boombar handles when prefix/suffix size exceeds window size
# 2.2.14 - boombar is more resistant to window resizing
# 2.2.13 - boomsess works on pre bash 4.4, but not happy about it... boomrc requires bash from the past decade but can't force containers to have that
# 2.2.12 - added DROUGHTRATIO_CPM to boobmar env
# 2.2.11 - if container defaults to root user, don't enable boomsu
# 2.2.10 - fix bug with boomsu histignore handling, modify chat in histignore to chat* instead of chat *
# 2.2.9  - MAJOR BUGFIX - boommeter can now tell if calling line was empty... this is huge for removing erroneous empty-line booms in multi-term env
# 2.2.8  - `boombot env` supported, inspired by `boombar env`
# 2.2.7  - boomrc suite uses $USER shell builtin instead of $(whoami)
# 2.2.6  - boombot will randomly remark in chat
# 2.2.5  - BOOMFAV and LASTUSERBOOM added to boombar env
# 2.2.4  - boomdocs doesn't read the docs if doomed, instead gives hint to `bringtheboom`
# 2.2.3  - boomlog filtering wasn't actually filtering (scary)... fixed the regex to match for ^[^<bad chars>]+$
# 2.2.2  - fixes for persistent doom (it messed up more than we thought)
# 2.2.1  - boom favorite is smarter about when nobody has boomed in a day
# 2.2.0  - `boombar` released with boombot mode integration and basic boom/drought display options
# 2.1.2  - boomsessions will skip empty exports instead of exporting nothing then skipping empty imports
# 2.1.1  - text after NUM in chat /rarity call is ignored
# 2.1.0  - new chart just dropped - `boom board top` to see top booms per user
# 2.0.12 - unset dbus session bus address in boomexec just in case
# 2.0.11 - `boom patchnotes latest [NUM]` added to avoid printing 123 lines in the terminal
# 2.0.10 - boom board calculation was counting numbers from commands, fixed that... also fixed passing 25 milestone on import
# 2.0.9  - doom for boomsessions is separate from "big doom" && boomsession can be used on hosts with home dir but wrong permissions
# 2.0.8  - fix for persistent doom where handling is disabled if file is not writable - hosts without write permission were auto-bringthebooming
# 2.0.7  - boom total mult rewards will no longer falsely super boom a command that won't log towards the total ([!./]+)
# 2.0.6  - .sessionlog populating grep will filter out binary file matches (weird bug)
# 2.0.5  - users can no longer run boomsu while boomsued
# 2.0.4  - boomsu remembers calling UID/GID and chowns if it has to restart the session
# 2.0.3  - csplit/chain import handling allows one universal log for all boomssh/exec sessions, handling updated to avoid lingering logs
# 2.0.2  - boomzone now alias for boom zone instead of vice-versa, and zone command can show site columns in terminal
# 2.0.1  - quest eligibility changed such that a command is eligible for quest selection if more than half+1 users have boomed it
# 2.0.0  - boomssh/exec/su released and chainable/completeable/documented
# 1.7.20 - chat /ascii completion implemented with -o default because that's better
# 1.7.19 - running chat no longer allows booming on first empty line in other tabs
# 1.7.18 - HISTIGNORE append fix - chat was getting added infinitely
# 1.7.17 - `boomstoday` bugfix - was checking wrong file for if anyone had boomed
# 1.7.16 - BOOMBOTPROMPTCMD is able to run commands in the boombot mode prompt
# 1.7.15 - default timeout set - shortened to 15 minutes from 30
# 1.7.14 - `boom board today`/`boomstoday` added and documented
# 1.7.13 - doom persists now - all terminals will clear after dooming in one and bringtheboom after booming in one
# 1.7.12 - fixed -$- evaluating as -himBHs in chat emoji completion
# 1.7.11 - boombot can be mentioned in cipher and will respond in cipher
# 1.7.10 - ascii chars are enforced correctly in /ascii command
# 1.7.9  - new font and random font output for text2ascii
# 1.7.8  - alphabet implementation has moved to its own rc instead of a local dir with ascii files - much better
# 1.7.7  - more alphabet ascii added, /text and /boomstoday docced, /text has length validation, bug fixes with fav entries
# 1.7.6  - `chat /text` added but not documented
# 1.7.5  - no emojis in chat /ascii
# 1.7.4  - `chat /boomstoday` added to list current boom standings per day based on favorite entry list
# 1.7.3  - boommeter random hits just ignore super problematic characters altogether - can still boom scripts without logging
# 1.7.2  - boombot reacts to ascii
# 1.7.1  - chat /ascii completion defaults to filepaths when no ~/ascii dir exists
# 1.7.0  - `chat /ascii` is here with completion and validation and documentation
# 1.6.15 - admin/boss/host are readonly now
# 1.6.14 - edit has documentation
# 1.6.13 - chat edit completion implemented - 4th arg will complete with what current 3rd arg is for ez typo fixes
# 1.6.12 - deprecated doomnow, doom will now clear terminal
# 1.6.11 - `chat edit` added but not docced or completed
# 1.6.10 - `boom zone` support added
# 1.6.9  - boomzone and doomsite added and integrated into doom/doomnow - doomnow only adds clear now, doesn't clear chat
# 1.6.8  - boombot completion
# 1.6.7  - boombot mode prompt configurable, autoboombot mode no longer prevents entering boombot mode
# 1.6.6  - chat timeout cmd shows current timeouts and remaining duration
# 1.6.5  - update chat to check for timeout in case first cmd after timeout is chat
# 1.6.4  - boom favorite entry max expanded to 8
# 1.6.3  - `boom favorite entries` added to show current state of entries for favorite drawing
# 1.6.2  - more emojis in list
# 1.6.1  - emoji completion parsing only shows named options - bug fix
# 1.6.0  - emojis are in chat!
# 1.5.12 - boombot mode handles cases where _boombotName doesn't exist - e.g. PS1 is passed thru ssh
# 1.5.11 - bug fixes with daily resets for AUTOBOOMBOT and favorite
# 1.5.10 - boombot doesn't roast its favorite!
# 1.5.9  - `boom favorite` added with completion, daily re-roll, and odds reduction for favorite
# 1.5.8  - boombot auto mode option added such that users can automatically optimize boombot super boom farming
# 1.5.7  - boom total full and boom chat /total all added w/ completion - full and all are now interchangable in cmds
# 1.5.6  - boomdocs completion
# 1.5.5  - boomdocs implemented to deprecate boom help and boomhelp - future commands will be documented here
# 1.5.4  - boom drought output suppression feature removed in favor of boom silent
# 1.5.3  - chat hype options filled out more
# 1.5.2  - early `chat /hype` implementation, need more hype up phrases, boombot can only award 1 super boom daily
# 1.5.1  - `boom silent` will suppress all _boommeter output without removing boom fxns when silence desired, not doom
# 1.5.0  - boombot mode development complete
# 1.4.13 - freq board aligned to 3 digit freqs - tuckerdc's vim won the race to 100 random
# 1.4.12 - BoomBot only refers to self as BoomBot
# 1.4.11 - `bang [NUM]` is now a fxn that prints NUM bangs (default 1)
# 1.4.10 - `doom` and `doomnow` handle boombot mode cases and `doombot` added as alias for `boombot exit`
# 1.4.9  - `boombot` starts boombot mode and `boombot exit` leaves it - more to come there
# 1.4.8  - bang alias can be used in chat with $(bang)
# 1.4.8  - timeouts active and working
# 1.4.7  - /timeout added but no handling
# 1.4.6  - boom boss and boom admins added
# 1.4.5  - freq board has totals
# 1.4.4  - `boom total` added to view totals outside of chat
# 1.4.3  - bug fixes worthy of a patch - some math and path fixes
# 1.4.2  - boom quest re-rolls every day
# 1.4.1  - /total [PERSON] implemented
# 1.4.0  - SUPER boom multipliers active - score landscape has changed
# 1.3.14 - boom quests are active - a random command boomed by 3+ people can now award x2 the booms!
# 1.3.13 - boom hall bug fix (also 6 has been hit now)
# 1.3.12 - starts doomed if boomfiles aren't writable
# 1.3.11 - `boom todo` to show feature roadmap
# 1.3.10 - /total command added to see total booms easily without updating freq board
# 1.3.9  - /work command added for you slackers
# 1.3.8  - users can mention BoomBot in chat for a boom rating
# 1.3.7  - fix bug with mentioning .sa accounts
# 1.3.6  - check current patch with `chat /patch` and maybe roast if on an old version
# 1.3.5  - more roasts added
# 1.3.4  - chat roasts work with @ mentions
# 1.3.3  - `chat /roast` completion implemented
# 1.3.2  - `chat /roast` implemented
# 1.3.1  - 1 booms is bad grammar - checks for plurals now - yeah, we're grammarphiles
# 1.3.0  - chat commands implemented with completion - `chat /help` for cmd list
# 1.2.12 - `boom drought rarity [NUM]` added
# 1.2.11 - chat cipher now supports mentions
# 1.2.10 - can mention @everyone in boom chat
# 1.2.9  - fix user glitch and add @ completion to chat mentions
# 1.2.8  - first pass at mentions - completion to come
# 1.2.7  - quotes filtered out of chat cipher - look out for future chars that break cipher to filter
# 1.2.6  - `chat clear` starts new chat with message containing who reset log
# 1.2.5  - `chat` can now boom without bugging but also while still being ignored by history
# 1.2.4  - `chat decipher` takes number input for how many lines to decode
# 1.2.3  - `chat cipher` and `chat decipher` added
# 1.2.2  - fix doomnow chat clear
# 1.2.1  - fix boom streak bug and improve help text
# 1.2.0  - boom chat development complete, `boom chat clear` saves off log and clears chats from site
# 1.1.12 - boomhog streaks should persist between terminals
# 1.1.11 - `chat` added to HISTIGNORE so `chat` is not saved in history
# 1.1.10 - `boom chat` allows posting chat to website - `chat` alias also works
# 1.1.9  - boommeter command rankings are saved to a log and displayed on the site
# 1.1.8  - `boom board full` added to not restrict leaderboard to commands only boomed by multiple users
# 1.1.7  - view patch notes with `boom patchnotes`
# 1.1.6  - boom avg and boomavg tab completion
# 1.1.5  - boom drought output frequency adjusted, drought record tracking established
# 1.1.4  - doom stops boom drought and `doomnow` clears as well, no commands work when doomed
# 1.1.3  - boom drought and other bug fixes/improvements
# 1.1.2  - bug fix with space after "^ $1" in sed commands
# 1.1.1  - set boom files to 644 with chmod on source
# 1.1.0  - add `boom` command for tracking per-user command rankings & hall of boom for random 6 hits
# 1.0.4  - boomavg bug fix and more detailed intro text, type `boomhelp` for intro text anytime
# 1.0.3  - random boom streak implementation
# 1.0.2  - boomavg now takes a filter arg
# 1.0.1  - update to not use slashes in sed cmds and not randomly rank cmds with [./!]
# 1.0.0  - initial _boommeter randomization setup complete, file sourceable from anywhere
# 0.X.X  - terminal emojis found, boommeter developed
```
