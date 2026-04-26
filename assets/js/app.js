const Storage = {
    get: (key, fallback) => {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.get([key], (result) => {
                    resolve(result[key] !== undefined ? result[key] : fallback);
                });
            } else {
                const local = localStorage.getItem('helium_' + key);
                resolve(local ? JSON.parse(local) : fallback);
            }
        });
    },
    set: (key, value) => {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                chrome.storage.sync.set({ [key]: value }, resolve);
            } else {
                localStorage.setItem('helium_' + key, JSON.stringify(value));
                resolve();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const clockEl = document.getElementById('clock');
    const ampmEl = document.getElementById('ampm');
    const dateEl = document.getElementById('date');
    const timeToggle = document.getElementById('time-toggle');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.querySelector('.search-icon');
    const suggestionsList = document.getElementById('suggestions-list');
    const tabTray = document.getElementById('tab-tray');
    const bangIndicator = document.getElementById('bang-indicator');

    // Modal Elements
    const modal = document.getElementById('bookmark-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');
    const siteNameInput = document.getElementById('site-name');
    const siteUrlInput = document.getElementById('site-url');

    const defaultBookmarks = [
        { name: 'GitHub', url: 'https://github.com' },
        { name: 'YouTube', url: 'https://youtube.com' },
        { name: 'Reddit', url: 'https://reddit.com' },
        { name: 'HN', url: 'https://news.ycombinator.com' }
    ];

    let state = {
        bookmarks: await Storage.get('bookmarks', defaultBookmarks),
        timeFormat: await Storage.get('timeFormat', '12h'),
        focusMode: await Storage.get('focusMode', false),
        bangHistory: await Storage.get('bangHistory', {}),
        selectedIndex: -1,
        suggestionElements: [],
        debounceTimer: null,
        lastQuery: ''
    };

    // Entrance
    setTimeout(() => {
        document.querySelectorAll('.entrance-reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('revealed'), i * 60);
        });
        if (state.focusMode) document.body.classList.add('focus-active');
        searchInput.focus();
    }, 50);

    // Clock
    const updateClock = () => {
        const now = new Date();
        let h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        if (state.timeFormat === '12h') {
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            if (ampmEl) ampmEl.textContent = ampm;
        } else {
            if (ampmEl) ampmEl.textContent = '';
        }
        h = String(h).padStart(2, '0');
        if (clockEl) clockEl.innerHTML = `${h}<span class="colon" style="opacity:0.4; margin: 0 0.05em;">:</span>${m}`;
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options);
        if (timeToggle) timeToggle.textContent = state.timeFormat.toUpperCase();
    };

    timeToggle.addEventListener('click', async () => {
        state.timeFormat = state.timeFormat === '12h' ? '24h' : '12h';
        await Storage.set('timeFormat', state.timeFormat);
        updateClock();
    });

    // Bookmarks
    const getIconUrl = (url) => {
        try {
            const domain = new URL(url).hostname;
            // High quality icons from unavatar
            return `https://unavatar.io/${domain}?fallback=https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } catch (e) { return ''; }
    };

    const renderTray = () => {
        if (!tabTray) return;
        tabTray.innerHTML = '';
        state.bookmarks.forEach((item, index) => {
            const a = document.createElement('a');
            a.href = item.url;
            a.className = "tab-link";

            const del = document.createElement('div');
            del.className = 'delete-btn';
            del.innerHTML = '&times;';
            del.addEventListener('click', async (e) => {
                e.preventDefault(); e.stopPropagation();
                state.bookmarks.splice(index, 1);
                await Storage.set('bookmarks', state.bookmarks);
                renderTray();
            });

            const icon = document.createElement('div');
            icon.className = 'icon-shortcut';
            const img = document.createElement('img');
            img.src = getIconUrl(item.url);
            img.onerror = () => {
                img.style.display = 'none';
                icon.innerHTML = `<span>${item.name[0].toUpperCase()}</span>`;
            };
            icon.appendChild(img);
            
            const span = document.createElement('span');
            span.className = 'site-name';
            span.textContent = item.name;
            
            a.append(del, icon, span);
            tabTray.appendChild(a);
        });

        const addBtn = document.createElement('div');
        addBtn.className = 'tab-link add-btn';
        addBtn.innerHTML = `<div class="icon-shortcut"><span style="font-size:20px;opacity:0.4;">+</span></div><span class="site-name">Add Site</span>`;
        addBtn.addEventListener('click', () => { modal.classList.remove('hidden'); siteNameInput.focus(); });
        tabTray.appendChild(addBtn);
    };

    // Modal
    modalCancel.addEventListener('click', () => modal.classList.add('hidden'));
    modalSave.addEventListener('click', async () => {
        const name = siteNameInput.value.trim();
        let url = siteUrlInput.value.trim();
        if (name && url) {
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            state.bookmarks.push({ name, url });
            await Storage.set('bookmarks', state.bookmarks);
            renderTray();
            modal.classList.add('hidden');
            siteNameInput.value = ''; siteUrlInput.value = '';
        }
    });

    // Suggestions Logic - EXACT FROM REFERENCE
    const updateBangIndicator = (query) => {
        if (!bangIndicator) return;
        const trigger = query.split(' ')[0].toLowerCase();
        const bang = trigger.startsWith('!') && CONFIG.bangsList.find(b => b.trigger === trigger);
        if (bang) {
            const domain = new URL(bang.url.replace('{q}', 't')).hostname;
            bangIndicator.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" style="width:20px; height:20px; border-radius:50%;">`;
            bangIndicator.style.opacity = '1';
            searchIcon.style.opacity = '0';
        } else {
            bangIndicator.style.opacity = '0';
            searchIcon.style.opacity = '0.4';
        }
    };

    const renderSuggestions = (suggestions, isBangs = false) => {
        state.selectedIndex = -1;
        suggestionsList.innerHTML = '';
        if (!suggestions || suggestions.length === 0) {
            suggestionsList.classList.remove('active');
            return;
        }
        if (isBangs) {
            suggestions.sort((a, b) => (state.bangHistory[b.trigger] || 0) - (state.bangHistory[a.trigger] || 0));
        }
        suggestions.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            if (isBangs) {
                li.innerHTML = `<span style="font-family:monospace;font-weight:700;margin-right:12px;color:#fff;">${item.trigger}</span><span style="opacity:0.5;font-size:0.9em;">${item.name}</span>`;
                li.dataset.value = item.trigger + ' ';
            } else {
                li.textContent = item;
                li.dataset.value = item;
            }
            li.addEventListener('mousedown', (e) => {
                e.preventDefault();
                searchInput.value = li.dataset.value;
                if (isBangs) { searchInput.focus(); renderSuggestions([]); }
                else { searchForm.dispatchEvent(new Event('submit')); }
            });
            li.addEventListener('mouseenter', () => updateSelection(index));
            suggestionsList.appendChild(li);
        });
        state.suggestionElements = Array.from(suggestionsList.children);
        suggestionsList.classList.add('active');
    };

    const updateSelection = (index) => {
        state.suggestionElements.forEach(el => el.classList.remove('selected'));
        state.selectedIndex = index;
        if (index >= 0 && index < state.suggestionElements.length) {
            state.suggestionElements[index].classList.add('selected');
        }
    };

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const query = val.trim();
        updateBangIndicator(val);
        if (!query) { renderSuggestions([]); return; }

        if (query.startsWith('!')) {
            if (query === '!focus') { renderSuggestions([]); return; }
            const matches = CONFIG.bangsList.filter(b => b.trigger.startsWith(query.toLowerCase())).slice(0, 6);
            renderSuggestions(matches, true);
            return;
        }

        clearTimeout(state.debounceTimer);
        state.lastQuery = query;
        searchIcon.classList.add('loading');
        
        state.debounceTimer = setTimeout(() => {
            // PORTED EXACT LOGIC FROM REFERENCE PROJECT
            fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    searchIcon.classList.remove('loading');
                    // data[0] is query, data[1] is array of suggestions
                    if (data && data[0].toLowerCase() === state.lastQuery.toLowerCase() && data[1]) {
                        renderSuggestions(data[1].slice(0, 6));
                    }
                })
                .catch(() => {
                    searchIcon.classList.remove('loading');
                });
        }, 150);
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const idx = state.selectedIndex < state.suggestionElements.length - 1 ? state.selectedIndex + 1 : 0;
            updateSelection(idx);
            if (state.suggestionElements[idx]) searchInput.value = state.suggestionElements[idx].dataset.value;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const idx = state.selectedIndex > 0 ? state.selectedIndex - 1 : state.suggestionElements.length - 1;
            updateSelection(idx);
            if (state.suggestionElements[idx]) searchInput.value = state.suggestionElements[idx].dataset.value;
        } else if (e.key === 'Escape') {
            renderSuggestions([]);
        }
    });

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const val = searchInput.value.trim();
        if (!val) return;
        if (val === '!focus') {
            state.focusMode = !state.focusMode;
            await Storage.set('focusMode', state.focusMode);
            document.body.classList.toggle('focus-active', state.focusMode);
            searchInput.value = '';
            return;
        }
        if (val.startsWith('!')) {
            const parts = val.split(' ');
            const trigger = parts[0].toLowerCase();
            const bang = CONFIG.bangsList.find(b => b.trigger === trigger);
            if (bang) {
                state.bangHistory[trigger] = (state.bangHistory[trigger] || 0) + 1;
                await Storage.set('bangHistory', state.bangHistory);
                window.location.href = bang.url.replace('{q}', encodeURIComponent(parts.slice(1).join(' ')));
                return;
            }
        }
        const engine = CONFIG.search.engineUrls[CONFIG.search.default] || CONFIG.search.engineUrls.google;
        window.location.href = `${engine}${encodeURIComponent(val)}`;
    });

    updateClock();
    setInterval(updateClock, 1000);
    renderTray();
});
