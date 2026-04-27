const Storage = {
  get: (key, fallback) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.get([key], (result) => {
          resolve(result[key] !== undefined ? result[key] : fallback);
        });
      } else {
        const local = localStorage.getItem("helium_" + key);
        resolve(local ? JSON.parse(local) : fallback);
      }
    });
  },
  set: (key, value) => {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.set({ [key]: value }, resolve);
      } else {
        localStorage.setItem("helium_" + key, JSON.stringify(value));
        resolve();
      }
    });
  },
};

// Global callback for JSONP Google Suggestions
window.handleGoogleSuggestions = (data) => {
  const searchIcon = document.querySelector(".search-icon");
  if (searchIcon) searchIcon.classList.remove("loading");
  if (data && data[1] && window.renderSuggestionsProxy) {
    window.renderSuggestionsProxy(data[1].slice(0, 6));
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  // UI Elements
  const clockEl = document.getElementById("clock");
  const ampmEl = document.getElementById("ampm");
  const dateEl = document.getElementById("date");
  const timeToggle = document.getElementById("time-toggle");
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchIcon = document.querySelector(".search-icon");
  const suggestionsList = document.getElementById("suggestions-list");
  const tabTray = document.getElementById("tab-tray");
  const bangIndicator = document.getElementById("bang-indicator");

  // Modal Elements
  const modal = document.getElementById("bookmark-modal");
  const modalCancel = document.getElementById("modal-cancel");
  const modalSave = document.getElementById("modal-save");
  const siteNameInput = document.getElementById("site-name");
  const siteUrlInput = document.getElementById("site-url");

   const ICONS = {
    reddit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 11.5c0-1.65-1.35-3-3-3-.61 0-1.18.19-1.66.51-1.67-1.18-4.31-2-7.32-2l1.5-4.5 4.5 1c0 1.1.9 2 2 2 1.1 0 2-.9 2-2s-.9-2-2-2c-.76 0-1.42.42-1.75 1.05l-5.1-.1.15-.05-1.7 5.15c-3.03.03-5.7.85-7.39 2.04-.49-.33-1.07-.53-1.7-.53-1.65 0-3 1.35-3 3 0 1.22.74 2.27 1.79 2.73-.09.43-.14.88-.14 1.34 0 4.2 4.7 7.6 10.5 7.6s10.5-3.4 10.5-7.6c0-.46-.05-.91-.14-1.34 1.05-.46 1.79-1.51 1.79-2.73zM7.5 14c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 4c-1.5 1.5-4.5 1.5-6 0-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 1.1.7 2.6.7 3.2 0 .4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4zm-.5-2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>`,
    messenger: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.618 4.469 8.627V24l4.088-2.242c1.092.303 2.243.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.293 14.803l-3.074-3.273-5.996 3.273L10.707 7.31l3.074 3.273 5.996-3.273-6.484 7.493z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    gmail: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    gmeet: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.1 16.5l-3.3-3.3v2.8H7.2V8h6.6v2.8l3.3-3.3v9z"/></svg>`,
    chatgpt: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.707 7.293a1 1 0 00-1.414-1.414L10.586 10l4.707 4.707a1 1 0 001.414-1.414L13.414 11l3.293-3.293z"/></svg>`,
    claude: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.707 7.293a1 1 0 00-1.414-1.414L10.586 10l4.707 4.707a1 1 0 001.414-1.414L13.414 11l3.293-3.293z"/></svg>`,
    gemini: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.707 7.293a1 1 0 00-1.414-1.414L10.586 10l4.707 4.707a1 1 0 001.414-1.414L13.414 11l3.293-3.293z"/></svg>`,
  };

  const defaultBookmarks = [
    { name: "Reddit", url: "https://reddit.com", icon: "reddit" },
    { name: "Messenger", url: "https://messenger.com", icon: "messenger" },
    { name: "GitHub", url: "https://github.com", icon: "github" },
    { name: "Facebook", url: "https://facebook.com", icon: "facebook" },
    { name: "Instagram", url: "https://instagram.com", icon: "instagram" },
    { name: "Gmail", url: "https://mail.google.com", icon: "gmail" },
    { name: "GMeet", url: "https://meet.google.com", icon: "gmeet" },
    { name: "ChatGPT", url: "https://chatgpt.com", icon: "chatgpt" },
    { name: "Claude", url: "https://claude.ai", icon: "claude" },
    { name: "Gemini", url: "https://gemini.google.com", icon: "gemini" },
  ];

  let state = {
    bookmarks: defaultBookmarks,
    timeFormat: "12h",
    focusMode: false,
    bangHistory: {},
    selectedIndex: -1,
    suggestionElements: [],
    debounceTimer: null,
    lastQuery: "",
    editingIndex: -1,
  };

  const updateClock = () => {
    if (!clockEl) return;
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    if (state.timeFormat === "12h") {
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      if (ampmEl) ampmEl.textContent = ampm;
    } else {
      if (ampmEl) ampmEl.textContent = "";
    }
    h = String(h).padStart(2, "0");
    clockEl.innerHTML = `${h}<span class="colon" style="opacity:0.4; margin: 0 0.05em;">:</span>${m}`;
    const options = { weekday: "long", month: "long", day: "numeric" };
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-US", options);
    if (timeToggle) timeToggle.textContent = state.timeFormat.toUpperCase();
  };

  const getIconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      // unavatar.io is great for high-quality brand logos
      return `https://unavatar.io/${domain}?fallback=https://icon.horse/icon/${domain}`;
    } catch (e) {
      return "";
    }
  };

  const renderTray = () => {
    if (!tabTray) return;
    tabTray.innerHTML = "";
    state.bookmarks.forEach((item, index) => {
      const a = document.createElement("a");
      a.href = item.url;
      a.className = "tab-link";

      const actions = document.createElement("div");
      actions.className = "tab-actions";

      const editBtn = document.createElement("div");
      editBtn.className = "action-btn edit-btn";
      editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>`;
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(index);
      });

      const delBtn = document.createElement("div");
      delBtn.className = "action-btn delete-btn";
      delBtn.innerHTML = "&times;";
      delBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        state.bookmarks.splice(index, 1);
        await Storage.set("bookmarks", state.bookmarks);
        renderTray();
      });

      actions.append(editBtn, delBtn);

      const icon = document.createElement("div");
      icon.className = "icon-shortcut";

      const img = document.createElement("img");
      img.src = getIconUrl(item.url);
      
      img.onerror = () => {
        // Final fallback to letter if all APIs fail
        img.style.display = "none";
        icon.innerHTML = `<span>${item.name[0].toUpperCase()}</span>`;
      };
      icon.appendChild(img);

      const info = document.createElement("div");
      info.className = "site-info";
      
      const span = document.createElement("span");
      span.className = "site-name";
      span.textContent = item.name;

      info.append(span);
      a.append(actions, icon, info);
      tabTray.appendChild(a);
    });

    const addBtn = document.createElement("div");
    addBtn.className = "tab-link add-btn";
    addBtn.innerHTML = `<div class="icon-shortcut"><span style="font-size:20px;opacity:0.4;">+</span></div><div class="site-info"><span class="site-name">Add Site</span></div>`;
    addBtn.addEventListener("click", () => {
      openModal();
    });
    tabTray.appendChild(addBtn);
  };

  const openModal = (index = -1) => {
    state.editingIndex = index;
    const modalTitle = modal.querySelector("h2");
    const previewContainer = document.getElementById("icon-preview");
    
    if (index >= 0) {
      const b = state.bookmarks[index];
      siteNameInput.value = b.name;
      siteUrlInput.value = b.url;
      modalTitle.textContent = "Edit Bookmark";
      modalSave.textContent = "Update Bookmark";
      updateIconPreview(b.url);
    } else {
      siteNameInput.value = "";
      siteUrlInput.value = "";
      modalTitle.textContent = "Add New Bookmark";
      modalSave.textContent = "Save Bookmark";
      if (previewContainer) previewContainer.innerHTML = "";
    }
    modal.classList.remove("hidden");
    siteNameInput.focus();
  };

  const updateIconPreview = (url) => {
    const previewContainer = document.getElementById("icon-preview");
    if (!previewContainer) return;
    if (!url) {
      previewContainer.innerHTML = "";
      return;
    }
    
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) fullUrl = "https://" + url;
    
    const iconUrl = getIconUrl(fullUrl);
    if (iconUrl) {
      previewContainer.innerHTML = `<div class="icon-shortcut"><img src="${iconUrl}" onerror="this.parentElement.innerHTML='<span>?</span>'"></div>`;
    }
  };

  const updateBangIndicator = (query) => {
    if (!bangIndicator || !searchIcon) return;
    const trigger = query.split(" ")[0].toLowerCase();
    const bang =
      trigger.startsWith("!") &&
      CONFIG.bangsList.find((b) => b.trigger === trigger);
    if (bang) {
      const domain = new URL(bang.url.replace("{q}", "t")).hostname;
      bangIndicator.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" style="width:20px; height:20px; border-radius:50%;">`;
      bangIndicator.style.opacity = "1";
      searchIcon.style.opacity = "0";
    } else {
      bangIndicator.style.opacity = "0";
      searchIcon.style.opacity = "0.6";
    }
  };

  const renderSuggestions = (suggestions, isBangs = false) => {
    if (!suggestionsList) return;
    state.selectedIndex = -1;
    suggestionsList.innerHTML = "";
    if (!suggestions || suggestions.length === 0) {
      suggestionsList.classList.remove("active");
      return;
    }
    if (isBangs) {
      suggestions.sort(
        (a, b) =>
          (state.bangHistory[b.trigger] || 0) -
          (state.bangHistory[a.trigger] || 0),
      );
    }
    suggestions.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";
      if (isBangs) {
        li.innerHTML = `<span style="font-family:monospace;font-weight:700;margin-right:12px;color:#fff;">${item.trigger}</span><span style="opacity:0.5;font-size:0.9em;">${item.name}</span>`;
        li.dataset.value = item.trigger + " ";
      } else {
        li.textContent = item;
        li.dataset.value = item;
      }
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        searchInput.value = li.dataset.value;
        if (isBangs) {
          searchInput.focus();
          renderSuggestions([]);
        } else {
          searchForm.dispatchEvent(new Event("submit"));
        }
      });
      li.addEventListener("mouseenter", () => updateSelection(index));
      suggestionsList.appendChild(li);
    });
    state.suggestionElements = Array.from(suggestionsList.children);
    suggestionsList.classList.add("active");
  };

  const updateSelection = (index) => {
    state.suggestionElements.forEach((el) => el.classList.remove("selected"));
    state.selectedIndex = index;
    if (index >= 0 && index < state.suggestionElements.length) {
      state.suggestionElements[index].classList.add("selected");
    }
  };

  // 1. Initial immediate focus
  if (searchInput) searchInput.focus();

  // 2. Load and Render state
  const [bookmarks, timeFormat, focusMode, bangHistory] = await Promise.all([
    Storage.get("bookmarks", defaultBookmarks),
    Storage.get("timeFormat", "12h"),
    Storage.get("focusMode", false),
    Storage.get("bangHistory", {}),
  ]);

  state.bookmarks = bookmarks.length > 0 ? bookmarks : defaultBookmarks;
  state.timeFormat = timeFormat;
  state.focusMode = focusMode;
  state.bangHistory = bangHistory;

  updateClock();
  renderTray();
  updateBangIndicator("");

  // 3. Start Entrance Animation
  setTimeout(() => {
    document.querySelectorAll(".entrance-reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("revealed"), i * 60);
    });
    if (state.focusMode) document.body.classList.add("focus-active");
    if (searchInput) searchInput.focus();
  }, 50);

  // Events
  if (timeToggle) {
    timeToggle.addEventListener("click", async () => {
      state.timeFormat = state.timeFormat === "12h" ? "24h" : "12h";
      await Storage.set("timeFormat", state.timeFormat);
      updateClock();
    });
  }

  if (modalCancel)
    modalCancel.addEventListener("click", () => modal.classList.add("hidden"));

  if (siteNameInput) {
    siteNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        siteUrlInput.focus();
      }
    });
  }

  if (siteUrlInput) {
    siteUrlInput.addEventListener("input", (e) => {
      updateIconPreview(e.target.value);
    });
    siteUrlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        modalSave.click();
      }
    });
  }

  if (modalSave) {
    modalSave.addEventListener("click", async () => {
      const name = siteNameInput.value.trim();
      let url = siteUrlInput.value.trim();
      if (name && url) {
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        
        if (state.editingIndex >= 0) {
          state.bookmarks[state.editingIndex] = { name, url };
        } else {
          state.bookmarks.push({ name, url });
        }
        
        await Storage.set("bookmarks", state.bookmarks);
        renderTray();
        modal.classList.add("hidden");
        siteNameInput.value = "";
        siteUrlInput.value = "";
        state.editingIndex = -1;
      }
    });
  }

  window.renderSuggestionsProxy = (suggestions) =>
    renderSuggestions(suggestions);

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      const query = val.trim();
      updateBangIndicator(val);
      if (!query) {
        renderSuggestions([]);
        return;
      }

      if (query.startsWith("!")) {
        if (query === "!focus") {
          renderSuggestions([]);
          return;
        }
        const matches = CONFIG.bangsList
          .filter((b) => b.trigger.startsWith(query.toLowerCase()))
          .slice(0, 6);
        renderSuggestions(matches, true);
        return;
      }

      clearTimeout(state.debounceTimer);
      state.lastQuery = query;
      if (searchIcon) searchIcon.classList.add("loading");

      state.debounceTimer = setTimeout(() => {
        const oldScript = document.getElementById("google-suggest-script");
        if (oldScript) oldScript.remove();

        const script = document.createElement("script");
        script.id = "google-suggest-script";
        script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=handleGoogleSuggestions`;
        script.onerror = () => {
          if (searchIcon) searchIcon.classList.remove("loading");
          script.remove();
        };
        document.body.appendChild(script);
      }, 150);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const idx =
          state.selectedIndex < state.suggestionElements.length - 1
            ? state.selectedIndex + 1
            : 0;
        updateSelection(idx);
        if (state.suggestionElements[idx])
          searchInput.value = state.suggestionElements[idx].dataset.value;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const idx =
          state.selectedIndex > 0
            ? state.selectedIndex - 1
            : state.suggestionElements.length - 1;
        updateSelection(idx);
        if (state.suggestionElements[idx])
          searchInput.value = state.suggestionElements[idx].dataset.value;
      } else if (e.key === "Escape") {
        renderSuggestions([]);
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (!val) return;
      if (val === "!focus") {
        state.focusMode = !state.focusMode;
        await Storage.set("focusMode", state.focusMode);
        document.body.classList.toggle("focus-active", state.focusMode);
        searchInput.value = "";
        return;
      }
      if (val.startsWith("!")) {
        const parts = val.split(" ");
        const trigger = parts[0].toLowerCase();
        const bang = CONFIG.bangsList.find((b) => b.trigger === trigger);
        if (bang) {
          state.bangHistory[trigger] = (state.bangHistory[trigger] || 0) + 1;
          await Storage.set("bangHistory", state.bangHistory);
          window.location.href = bang.url.replace(
            "{q}",
            encodeURIComponent(parts.slice(1).join(" ")),
          );
          return;
        }
      }
      const engine =
        CONFIG.search.engineUrls[CONFIG.search.default] ||
        CONFIG.search.engineUrls.google;
      window.location.href = `${engine}${encodeURIComponent(val)}`;
    });
  }

  setInterval(updateClock, 1000);
});
