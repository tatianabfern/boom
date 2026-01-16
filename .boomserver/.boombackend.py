import asyncio
import os
import signal
import threading
import time

import api.boomjson  as bj # cfg helper functions
import api.boomapi   as ba # API helper functions
import api.boomcmds  as bc # background cmd runner
import api.boomfiles as bf # file parsers/line generators

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
    return render_template('boom.html')

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

        # Add api key to active keys if it isn't yet
        if api_key not in bc.active_api_keys:
            bc.active_api_keys.add(api_key)

        if cmd not in bc.cmd_list:
            return jsonify(error=[f"\"{cmd}\" not in expected command list"], user=username), 400

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
            return jsonify(error=[f"No cached result exists yet for {cmd} - hit timeout"], user=username), 503

        if "error" in user_cache and user_cache["error"]:
            code = 500
            if user_cache["code"]: code = user_cache["code"]
            return jsonify(user_cache), code

        return jsonify(user_cache)
    except Exception as e:
        return jsonify(error=[str(e)], user=username), 500

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
                return jsonify(output=stdout, error=stderr, user=username), code

        return jsonify(output=stdout, error=stderr, user=username)
    except Exception as e:
        return jsonify(error=str(e), user=username), 500

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

def read_file(filename, default_type = "log", lingering = False):
    data = request.get_json()
    api_key = data.get('key')
    full = data.get('full', False)

    valid_key, username = ba.validate_key(api_key)
    if not valid_key: return jsonify(error="Invalid API Key"), 401

    client_hashes = data.get("hashes", {}) or {}

    if full:
        client_hashes = {}

    with open(filename, 'r') as file:
        lines = file.readlines()

    window = bf.build_window(lines, default_type, lingering)

    actions = bf.diff(client_hashes, window)

    return jsonify(
        full=full,
        actions=list(actions),
        order=[item["id"] for item in window],
        hashes={item["id"]: item["hash"] for item in window} if len(actions) > 0 else {},
        user=username
    )

@app.route('/read_log_file', methods=['POST'])
def read_log_file():
    try:
        return read_file(f"/{BOOMUSERDIR}/{BOOMBOSS}/{BOOMINSTALL}/.boomlog")
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/read_boommeter_file', methods=['POST'])
def read_boommeter_file():
    try:
        return read_file(f"/{BOOMUSERDIR}/{BOOMBOSS}/{BOOMINSTALL}/.boommeterlog",
                         default_type = "chat", lingering = True)
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

    if usern == None and passwd == DEFPASSWD:
        return jsonify(valid=True, key=ba.DEFKEY)
    elif usern in users:
        user = users[usern]
        if not ba.verify_password(passwd, user["password_hash"]):
            return jsonify(valid=False), 401

        # Only regenerate key if inactive
        active, _ = ba.validate_key(user["api_key"])
        if not active:
            key, expr = ba.generate_api_key()
            user["api_key"] = key
            user["api_key_expires"] = expr
            bj.save_users(users)
        else:
            key = user["api_key"]
            expr = user["api_key_expires"]
            bc.active_api_keys.add(key)

        return jsonify(valid=True, key=key, expires=expr, user=usern)
    else:
        return jsonify(valid=False), 401

bg_updater = asyncio.new_event_loop()
updater_thread = threading.Thread(target=bc.start_event_loop, args=(bg_updater,CMDPREFIX), daemon=True)
updater_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=BOOMPORT, debug=True, threaded=True)

