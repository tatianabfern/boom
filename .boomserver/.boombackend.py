import asyncio
import os
import signal
import threading
import time

import api.boomjson as bj # cfg helper functions
import api.boomapi  as ba # API helper functions
import api.boomcmds as bc # background cmd runner

from flask import Flask, jsonify, render_template, send_from_directory, request, Response

app = Flask(__name__)

DEFPASSWD = "a27c37953ea57cf95ec55e628cf518b168e7b62bc50ff0a1c8b7ab39da0f93ad"

BOOMUSERDIR=<unset>
BOOMBOSS=<unset>
BOOMRCS=<unset>
BOOMINSTALL=<unset>
BOOMPORT=<unset>
BOOMCFGFILE=<unset>
CMDPREFIX=f"export BOOMSITERUNNER=runner; export BOOMCFGFILE=\"{BOOMCFGFILE}\"; export BOOMSOURCE=\"/{BOOMUSERDIR}/{BOOMBOSS}/{BOOMRCS}/.boomrc\"; bash -c \"source $BOOMSOURCE &>/dev/null; "

def handle_exit(*args):
    bc.handle_exit()

    try:
        bg_updater.call_soon_threadsafe(lambda: None)
    except RuntimeError:
        # Event loop closed already
        pass

    updater_thread.join(timeout=5)

    raise KeyboardInterrupt()

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

@app.route('/')
def index():
    return render_template('.boom.html')

@app.route('/popup')
def popup():
    return render_template('popup.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico',
                               mimetype='image/vnd.microsoft.icon')

def run_simple_command(cmd):
    try:
        api_key = request.get_json().get('key')
        valid_key, username = ba.validate_key(api_key)
        if not valid_key: return jsonify(error="Invalid API Key"), 401

        if cmd not in bc.cmd_list:
            return jsonify(error=[f"\"{cmd}\" not in expected command list"]), 400

        user_cache = {}
        timeout = 10
        waited = 0
        while waited < timeout:
            with bc.cache_lock:
                user_cache = bc.latest_cmd_results.get(api_key, {}).get(cmd, {})
            if user_cache:
                break
            time.sleep(.05)
            waited += .05

        if not user_cache:
            return jsonify(error=[f"No cached result exists yet for {cmd} - hit timeout"]), 503

        if "error" in user_cache and user_cache["error"]:
            return jsonify(user_cache), 500

        return jsonify(user_cache)
    except Exception as e:
        return jsonify(error=[str(e)]), 500

# Legacy code
#@app.route('/run_command', methods=['POST'])
#def run_command():
#    return run_simple_command('boom latest && echo && boom favorite && echo && boom drought longest && echo && boom board && echo -n Patch && boom patchnotes current && echo && boom hall')

#############################
# Individual command routes #
#############################

@app.route('/run_boom_latest_command', methods=['POST'])
def run_boom_latest_command():
    return run_simple_command('boom latest && echo')

@app.route('/run_boom_favorite_command', methods=['POST'])
def run_boom_favorite_command():
    return run_simple_command('boom favorite && echo')

@app.route('/run_boom_drought_longest_command', methods=['POST'])
def run_boom_drought_longest_command():
    return run_simple_command('boom drought longest && echo')

@app.route('/run_boom_board_command', methods=['POST'])
def run_boom_board_command():
    api_key = request.get_json().get('key')
    valid_key, username = ba.validate_key(api_key)
    if not valid_key: return jsonify(error="Invalid API Key"), 401

    boardarg = request.get_json().get('boardcmd') # One of avg/drought/freq/full/today/top/null
    if boardarg is None: boards = [""]
    elif ' ' in boardarg: boards = boardarg.split()
    else: boards = [boardarg]

    try:
        # Empty boardarg == avg/freq/top/drought boards
        stdout = ""
        stderr = []
        for arg in boards:
            arg = arg.replace("-", " ")
            result = run_simple_command(f'boom board {arg}')

            if isinstance(result, tuple):
                response, code = result
                data = response.get_json()
            else:
                data = result.get_json()
                code = 200

            stdout += data.get('output', '')
            stderr.extend(data.get('error', []))

            if code >= 400:
                return jsonify(output=stdout, error=stderr), code

        return jsonify(output=stdout, error=stderr)
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/run_boom_patchnotes_current_command', methods=['POST'])
def run_boom_patchnotes_current_command():
    return run_simple_command('echo -n Patch && boom patchnotes current && echo')

@app.route('/run_boom_hall_command', methods=['POST'])
def run_boom_hall_command():
    return run_simple_command('boom hall && echo')

@app.route('/get_boom_emoji', methods=['POST'])
def get_boom_emoji():
    return run_simple_command('echo -n \$_BE_BOOM')

#############################

@app.route('/read_log_file', methods=['POST'])
def read_log_file():
    try:
        api_key = request.get_json().get('key')
        valid_key, username = ba.validate_key(api_key)
        if not valid_key: return jsonify(error="Invalid API Key"), 401

        logfile = f"/{BOOMUSERDIR}/{BOOMBOSS}/{BOOMINSTALL}/.boomlog"
        with open(logfile, 'r') as file:
            lines = file.readlines()
            display = reversed(lines[-54:]) if len(lines) > 54 else reversed(lines)
            return jsonify(lines=list(display))
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/read_boommeter_file', methods=['POST'])
def read_boommeter_file():
    try:
        api_key = request.get_json().get('key')
        valid_key, username = ba.validate_key(api_key)
        if not valid_key: return jsonify(error="Invalid API Key"), 401

        logfile = f"/{BOOMUSERDIR}/{BOOMBOSS}/{BOOMINSTALL}/.boommeterlog"
        with open(logfile, 'r') as file:
            lines = file.readlines()
            for idx, line in enumerate(lines):
                if line.startswith('[CIPHER] '):
                    lines[idx] = line.lstrip('[CIPHER] ')
                elif line.startswith('[EDITED] '):
                    lines[idx] = f"*{line.lstrip('[EDITED] ')}"
                elif line.startswith('[ASCII] '):
                    lines[idx] = line.lstrip('[ASCII] ')
            display = reversed(lines[-53:]) if len(lines) > 53 else reversed(lines)
            return jsonify(lines=list(display))
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/boomuser', methods=['POST'])
def boomuser():
    data = request.get_json()
    username = data["username"]
    password = DEFPASSWD

    users = bj.load_users()

    if username in users:
        # No need to create user if exists
        return jsonify({})

    valid_user = False
    with open(f"/{BOOMUSERDIR}/{BOOMBOSS}/{BOOMINSTALL}/.boomusers", "r") as f:
        for line in f:
            if line.strip() == username:
                valid_user = True

    if not valid_user:
        return jsonify(success=False, error="Invalid user")

    users[username] = {
        "password_hash": ba.hash_password(password),
        "api_key": None,
        "api_key_expires": 0
    }

    bj.save_users(users)

    return jsonify(success=True)

@app.route('/boompass', methods=['POST'])
def boompass():
    data = request.get_json()
    passwd = data['password']
    usern  = data['username'] if 'username' in data else None

    users = bj.load_users()

    if usern not in users and passwd == DEFPASSWD:
        return jsonify(valid=True, key=ba.DEFKEY)
    elif usern in users:
        user = users[usern]
        if not ba.verify_password(passwd, user["password_hash"]):
            return jsonify(valid=False), 401

        key, expr = ba.generate_api_key()
        user["api_key"] = key
        user["api_key_expr"] = expr
        bj.save_users(users)

        return jsonify(valid=True, key=key, expires=expr, user=usern)
    else:
        return jsonify(valid=False), 401

bg_updater = asyncio.new_event_loop()
updater_thread = threading.Thread(target=bc.start_event_loop, args=(bg_updater,CMDPREFIX), daemon=True)
updater_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=BOOMPORT, debug=True, threaded=True)

