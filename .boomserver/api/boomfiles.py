import hashlib
import re
import time

POLL_REGEX = re.compile(r'\[POLL (\d+)\]')
EXPIRY_REGEX = re.compile(r'-e (\d+)\b')

MAX_VISIBLE = 74

def hash_line(line: str):
    return hashlib.sha1(line.encode('utf-8')).hexdigest()

def extract_poll(line: str):
    m = POLL_REGEX.search(line)
    if not m:
        return None
    poll_id = int(m.group(1))

    expiry = 0
    e = EXPIRY_REGEX.search(line)
    # We expect e to exist, but this won't break
    if e:
        expiry = int(e.group(1))

    return {
        "id": f"poll-{poll_id}",
        "expires": poll_id + expiry
    }

def build_window(lines, default_type = "log", lingering = False):
    now = int(time.time())
    start = max(0, len(lines) - MAX_VISIBLE)
    earlier_lines = list(enumerate(lines[:-MAX_VISIBLE], start=0))
    window_lines = list(enumerate(lines[-MAX_VISIBLE:], start=start))

    lingering_logs = []
    logs = []

    if lingering:
        # Sticky active polls at bottom of file
        for idx, line in earlier_lines:
            poll = extract_poll(line)
            if poll and poll["expires"] > now:
                lingering_logs.append({
                    "id": poll["id"],
                    "type": "poll",
                    "hash": hash_line(line),
                    "payload": { "text": line.rstrip() }
                })

    for idx, line in window_lines:
        poll = extract_poll(line)
        if poll:
            logs.append({
                "id": poll["id"],
                "type": "poll",
                "hash": hash_line(line),
                "payload": { "text": line.rstrip() }
            })
        else:
            displine = line
            log_type = default_type

            if line.startswith('[CIPHER] '):
                displine = line.removeprefix('[CIPHER] ')
            elif line.startswith('[EDITED] '):
                displine = f"*{line.removeprefix('[EDITED] ')}"
            elif line.startswith('[ASCII] '):
                displine = line.removeprefix('[ASCII] ')
                log_type = "ascii"

            logs.append({
                "id": f"log-{idx}",
                "type": log_type,
                "hash": hash_line(displine),
                "payload": { "text": displine.rstrip() }
            })

    return list(reversed(logs[max(0, len(lingering_logs)-1):])) + list(reversed(lingering_logs))

def diff(prev_hashes, curr):
    curr_map = {x["id"]: x for x in curr}

    actions = []

    # Drop anything the client has that is no longer in the current window
    for prev_id in prev_hashes:
        if prev_id not in curr_map:
            actions.append({"op": "drop", "id": prev_id})

    # Iterate in current order so appends/updates are in order
    for item in curr:
        curr_id = item["id"]
        prev_hash = prev_hashes.get(curr_id)

        # Append anything missing from client's view
        if prev_hash is None:
            actions.append({
                "op": "append",
                "id": curr_id,
                "type": item["type"],
                "payload": item["payload"],
            })
        # Update lines with a changed hash
        elif prev_hash != item["hash"]:
            actions.append({
                "op": "update",
                "id": curr_id,
                "payload": item["payload"],
            })

    return actions

