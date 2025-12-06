import asyncio
import os
import re
import time

from threading import Event, Lock

import api.boomjson as bj # cfg helper functions
import api.boomapi  as ba # API helper functions

ANSI_ESCAPE = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')

ANSI_COLORS = {
    '49': 'table-row-odd',
    '100': 'table-row-even',
}

cache_lock = Lock()
shutdown = Event()

active_api_keys = set()
latest_cmd_results = {}
cmd_list = [
    "boom latest && echo",
    "boom favorite && echo",
    "boom drought longest && echo",
    "echo -n Patch && boom patchnotes current && echo",
    "boom hall && echo",
    # Supported board commands might need a better home
    "boom board avg",
    "boom board freq",
    "boom board top",
    "boom board drought",
    "boom board avg _sitesummary_",
    "boom board freq _sitesummary_",
    "boom board top 10"
]

def handle_exit():
    shutdown.set()

def ansi_to_html(text):
    def replace_ansi(match):
        code = match.group(0)
        if code == '\x1B[0m':
            return '</span>'
        elif code.startswith('\x1B['):
            class_code = code[2:-1]
            if class_code in ANSI_COLORS:
                return f'<span class="{ANSI_COLORS[class_code]}">'
        return ''

    text = ANSI_ESCAPE.sub(replace_ansi, text)
    return text.replace('\n', '<br>')

def start_event_loop(loop, prefix):
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(background_runner(prefix))
    finally:
        loop.close()

async def run_cmd_async(cmd):
    proc = await asyncio.create_subprocess_shell(
                     cmd,
                     stdout=asyncio.subprocess.PIPE,
                     stderr=asyncio.subprocess.PIPE
                 )
    out, err = await proc.communicate()
    return out.decode(), err.decode()

async def background_runner(prefix):
    global CMDPREFIX
    CMDPREFIX = prefix

    while not shutdown.is_set():
        if active_api_keys:
            for command in cmd_list:
                for api_key in list(active_api_keys):
                    await refresh_results(api_key, command)
                await asyncio.sleep(1)
        await asyncio.sleep(5)

async def refresh_results(api_key, command):
    global latest_cmd_results

    valid_key, username = ba.validate_key(api_key)
    if not valid_key: return

    if api_key not in latest_cmd_results:
        latest_cmd_results[api_key] = {}

    user_cfg = bj.load_json(f"data/env/{username}.json")
    os.environ['BOOMTABLECOLS'] = user_cfg.get('columns', '')
    os.environ['BOOM_EMOJI'] = user_cfg.get('boom_emoji', '')
    os.environ['HOLE_EMOJI'] = user_cfg.get('hole_emoji', '')
    os.environ['BOT_EMOJI'] = user_cfg.get('bot_emoji', '')
    os.environ['SUPER_EMOJI'] = user_cfg.get('super_emoji', '')
    os.environ['HOG_EMOJI'] = user_cfg.get('hog_emoji', '')
    os.environ['IMPORT_EMOJI'] = user_cfg.get('import_emoji', '')
    os.environ['EXPORT_EMOJI'] = user_cfg.get('export_emoji', '')
    os.environ['CHECK_EMOJI'] = user_cfg.get('check_emoji', '')
    os.environ['NOBOOMHOLIDAY'] = user_cfg.get('ignore_holiday_emojis', '')

    full_cmd = f'{CMDPREFIX}{command}"'
    stdout, stderr = await run_cmd_async(full_cmd)

    with cache_lock:
        latest_cmd_results[api_key][command] = {
            'output': ansi_to_html(stdout),
            'error':  stderr.splitlines(),
            'timestamp': time.time()
        }

