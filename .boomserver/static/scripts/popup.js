let channel;
document.addEventListener('DOMContentLoaded', () => {
    createChannelConnectionOnPopup();
    ensureThemeUiExists();
    initThemePicker();
});

let themesCache = [];
let selectedThemeId = null;

const NEW_WINDOW_DAYS = 14;
function isThemeNew(theme) {
    if (!theme.dateAdded) return false;

    const created = new Date(theme.dateAdded).getTime();
    if (Number.isNaN(created)) return false;

    const now = Date.now();
    const ageMs = now - created;

    const windowMs = NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    return ageMs >= 0 && ageMs <= windowMs;
}

function ensureThemeUiExists() {
    const container = document.querySelector('.container') || document.body;

    const legacySelect =
        document.getElementById('theme-picker') ||
        document.getElementById('theme-select') ||
        document.querySelector('select[name="theme"]');

    if (legacySelect) {
        const legacyWrap = legacySelect.closest('label') || legacySelect;
        legacyWrap.style.display = 'none';
    }

    const existingTagFilter = document.getElementById('tag-filter');
    if (!existingTagFilter) {
        const controls = document.createElement('div');
        controls.className = 'controls';

        const label = document.createElement('label');
        label.className = 'control';

        const span = document.createElement('span');
        span.className = 'control-label';
        span.textContent = 'Filter by tag';

        const select = document.createElement('select');
        select.id = 'tag-filter';
        select.name = 'tag-filter';

        label.appendChild(span);
        label.appendChild(select);
        controls.appendChild(label);

        const h1 = container.querySelector('h1');
        if (h1 && h1.parentNode) {
            h1.insertAdjacentElement('afterend', controls);
        } else {
            container.insertAdjacentElement('afterbegin', controls);
        }
    }

    const existingThemeList = document.getElementById('theme-list');
    if (!existingThemeList) {
        const list = document.createElement('div');
        list.id = 'theme-list';
        list.className = 'theme-list';
        list.setAttribute('role', 'listbox');
        list.setAttribute('aria-label', 'Themes');
        container.appendChild(list);
    }
}

async function initThemePicker() {
    try {
        const response = await fetch('/static/styles/themes/theme-metadata.json');
        const json = await response.json();
        themesCache = Array.isArray(json.themes) ? json.themes : [];

        const tagFilter = document.getElementById('tag-filter');
        if (!tagFilter) {
            return;
        }

        tagFilter.addEventListener('change', () => {
            renderThemeList(themesCache, tagFilter.value);
        });

        buildTagFilter(themesCache);

        if (userSettingsJson !== null && userSettingsJson.theme !== undefined) {
            selectedThemeId = userSettingsJson.theme.id;
        } else if (themesCache.length > 0) {
            selectedThemeId = themesCache[0].id;
        }

        renderThemeList(themesCache, 'any');

        if (selectedThemeId !== null) {
            setTheme(selectedThemeId);
            publishToChannel(selectedThemeId);
        }
    } catch (error) {
        console.error('Error loading metadata:', error);
    }
}

function buildTagFilter(themes) {
    const tagFilter = document.getElementById('tag-filter');
    if (!tagFilter) return;

    tagFilter.innerHTML = '';

    const anyOption = document.createElement('option');
    anyOption.value = 'any';
    anyOption.textContent = 'All tags';
    tagFilter.appendChild(anyOption);

    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = 'New';
    tagFilter.appendChild(newOption);

    const tagSet = new Set();
    for (const theme of themes) {
        if (Array.isArray(theme.tags)) {
            for (const tag of theme.tags) tagSet.add(tag);
        }
    }

    const tags = Array.from(tagSet).sort((a, b) => String(a).localeCompare(String(b)));
    for (const tag of tags) {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    }

    tagFilter.value = 'any';
}

function renderThemeList(themes, tag) {
    const list = document.getElementById('theme-list');
    if (!list) return;

    list.innerHTML = '';

    const filteredThemes =
        tag && tag !== 'any'
            ? tag === 'new'
                ? themes.filter(isThemeNew)
                : themes.filter(t => Array.isArray(t.tags) && t.tags.includes(tag))
            : themes;

    // Sort by first tag then by theme name
    const sortedThemes = [...filteredThemes].sort((a, b) => {
        const aFirstTag = Array.isArray(a.tags) && a.tags.length ? a.tags[0] : '';
        const bFirstTag = Array.isArray(b.tags) && b.tags.length ? b.tags[0] : '';
        const tagCompare = aFirstTag.localeCompare(bFirstTag, undefined, { sensitivity: 'base' });

        if (tagCompare !== 0) return tagCompare;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    if (filteredThemes.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'theme-item';
        empty.style.cursor = 'default';
        empty.textContent = 'No themes match this tag.';
        list.appendChild(empty);
        return;
    }

    for (const theme of sortedThemes) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'theme-item';
        item.setAttribute('role', 'option');
        item.dataset.themeId = theme.id;

        const name = document.createElement('div');
        name.className = 'theme-name';
        name.textContent = theme.name ?? theme.id;

        const meta = document.createElement('div');
        meta.className = 'theme-meta';
        const author = (theme.author ?? '').trim() || 'Unknown author';
        const tagsText = Array.isArray(theme.tags) && theme.tags.length > 0 ? theme.tags.join(', ') : '—';
        meta.textContent = `${author} • ${tagsText}`;

        item.appendChild(name);
        item.appendChild(meta);

        const isSelected = theme.id === selectedThemeId;
        item.classList.toggle('selected', isSelected);
        item.setAttribute('aria-selected', isSelected ? 'true' : 'false');

        item.addEventListener('click', () => selectTheme(theme.id));

        item.classList.toggle('new-theme', isThemeNew(theme));

        list.appendChild(item);
    }
}

function selectTheme(themeId) {
    selectedThemeId = themeId;
    setTheme(themeId);
    publishToChannel(themeId);

    const items = document.querySelectorAll('.theme-item');
    for (const el of items) {
        const isSelected = el.dataset.themeId === themeId;
        el.classList.toggle('selected', isSelected);
        el.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    }
}

window.onload = function() {
    window.addEventListener("message", (event) => {
        const { boomEmoji } = event.data;
        const header = document.getElementById("popup-header");
        header.innerHTML = `${boomEmoji.repeat(3)} BOOM Themes ${boomEmoji.repeat(3)}`;
        const enc = encodeURIComponent(boomEmoji);
        document.body.style.cursor = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 100 100'%3E%3Ctext y='78' font-size='82'%3E${enc}%3C/text%3E%3C/svg%3E") 16 16, auto`;
    });
}

document.addEventListener('keydown', function(event) {
    if (event.key === "c") {
        window.close();
    }
});

