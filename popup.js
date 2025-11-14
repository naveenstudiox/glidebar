// ================= ICONS =================
const ICON_TRASH = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
     xmlns="http://www.w3.org/2000/svg">
  <path d="M9 3H15M4 6H20M18 6L17.2 19.2C17.15 20.2 16.3 21 15.3 21H8.7C7.7 21 6.85 20.2 6.8 19.2L6 6"
    stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// ================= STATE =================
let state = {
  currentMode: "links",
  links: [],
  notes: [],
  searchQuery: "",
  editingNoteId: null,
  settings: { theme: "dark" }
};

// ================= LOAD / SAVE STORAGE =================
function loadData() {
  chrome.storage.local.get(["Glidebar"], (res) => {
    if (res.Glidebar) {
      state.links = res.Glidebar.links || [];
      state.notes = res.Glidebar.notes || [];
      state.settings = res.Glidebar.settings || { theme: "dark" };
    }
    applyTheme();
    renderContent();
  });
}

function saveData() {
  chrome.storage.local.set({
    Glidebar: {
      links: state.links,
      notes: state.notes,
      settings: state.settings
    }
  });
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.settings.theme);
  const themeBtn = document.getElementById("themeBtn");
  themeBtn.textContent = state.settings.theme === "dark" ? "☀️" : "🌙";
  themeBtn.title = state.settings.theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

// ================= HELPERS =================
function isURL(str) {
  // More strict URL validation
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  
  // Check if it has common URL patterns
  if (str.includes('://') || str.includes('www.') || /\.[a-z]{2,}/.test(str)) {
    try {
      new URL(str.includes("://") ? str : "https://" + str);
      return true;
    } catch {
      return false;
    }
  }
  
  return false;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d;
  const m = diff / 60000;
  const h = diff / 3600000;
  const day = diff / 86400000;
  if (m < 1) return "Just now";
  if (m < 60) return `${Math.floor(m)}m ago`;
  if (h < 24) return `${Math.floor(h)}h ago`;
  if (day < 7) return `${Math.floor(day)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showToast(msg, duration = 2000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), duration);
}

// ================= CRUD =================
function addLink(url) {
  if (!url.includes("://")) url = "https://" + url;

  // Check for duplicates
  if (state.links.some(l => l.url === url)) {
    showToast("⚠️ Link already exists");
    return;
  }

  const link = {
    id: Date.now().toString(),
    url,
    title: extractDomain(url),
    favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(url)}&sz=64`,
    createdAt: new Date().toISOString()
  };

  state.links.unshift(link);
  saveData();
  renderContent(true);
  showToast("✅ Link added");
}

function addNote(content, title = "") {
  if (!content.trim()) return;
  
  const note = {
    id: Date.now().toString(),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.notes.unshift(note);
  saveData();
  renderContent(true);
  showToast("✅ Note added");
}

function deleteLink(id) {
  state.links = state.links.filter((l) => l.id !== id);
  saveData();
  renderContent();
  showToast("🗑️ Link deleted");
}

function deleteNote(id) {
  state.notes = state.notes.filter((n) => n.id !== id);
  saveData();
  renderContent();
  showToast("🗑️ Note deleted");
}

// ================= EDITOR =================
function openNoteEditor(id = null) {
  state.editingNoteId = id;

  const titleInput = document.getElementById("noteTitleInput");
  const editor = document.getElementById("noteEditor");
  const modal = document.getElementById("noteModal");
  const modalTitle = document.querySelector(".modal-title");

  if (id) {
    const note = state.notes.find((n) => n.id === id);
    titleInput.value = note?.title || "";
    editor.value = note?.content || "";
    modalTitle.textContent = "✍️ Edit Note";
  } else {
    titleInput.value = "";
    editor.value = "";
    modalTitle.textContent = "✨ New Note";
  }

  modal.classList.add("active");
  setTimeout(() => titleInput.focus(), 100);
}

function closeNoteEditor() {
  state.editingNoteId = null;
  document.getElementById("noteModal").classList.remove("active");
}

function saveNote() {
  const title = document.getElementById("noteTitleInput").value.trim();
  const content = document.getElementById("noteEditor").value.trim();
  
  if (!content) {
    showToast("⚠️ Note content cannot be empty");
    return;
  }

  if (state.editingNoteId) {
    const note = state.notes.find((n) => n.id === state.editingNoteId);
    if (note) {
      note.title = title;
      note.content = content;
      note.updatedAt = new Date().toISOString();
      showToast("✅ Note updated");
    }
  } else {
    const note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.notes.unshift(note);
    showToast("✅ Note created");
  }

  saveData();
  renderContent();
  closeNoteEditor();
}

// ================= RENDER =================
function renderContent(animated = false) {
  const container = document.getElementById("contentArea");

  if (animated) {
    container.classList.add("fadeSlide");
    setTimeout(() => container.classList.remove("fadeSlide"), 300);
  }

  if (state.currentMode === "links") renderLinks(container);
  else renderNotes(container);
}

function renderLinks(container) {
  const q = state.searchQuery.toLowerCase();
  const filtered = state.links.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    const emptyMsg = state.searchQuery 
      ? `No links found for "${escapeHtml(state.searchQuery)}"`
      : "No links yet";
    
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔗</div>
        <div class="empty-text">${emptyMsg}</div>
        ${!state.searchQuery ? '<div style="margin-top: 8px; font-size: 13px; color: var(--text-muted);">Paste a URL above to get started</div>' : ''}
      </div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (l) => `
    <div class="link-item" data-id="${l.id}">
      <div class="link-left">
        <img class="favicon" src="${l.favicon}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%2218%22 font-size=%2218%22>🔗</text></svg>'">
        <div class="link-text">
          <div class="link-title">${escapeHtml(l.title)}</div>
          <div class="link-url">${escapeHtml(l.url)}</div>
        </div>
      </div>

      <button class="delete-link" data-id="${l.id}" title="Delete link">
        ${ICON_TRASH}
      </button>
    </div>
  `
    )
    .join("");
}

function renderNotes(container) {
  const q = state.searchQuery.toLowerCase();
  const filtered = state.notes.filter((n) =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    const emptyMsg = state.searchQuery 
      ? `No notes found for "${escapeHtml(state.searchQuery)}"`
      : "No notes yet";
    
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">${emptyMsg}</div>
        ${!state.searchQuery ? '<div style="margin-top: 8px; font-size: 13px; color: var(--text-muted);">Type something above to create a note</div>' : ''}
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="notes-grid">
      ${filtered
        .map(
          (n) => `
        <div class="note-card" data-id="${n.id}">
          ${n.title ? `<div class="note-card-title">${escapeHtml(n.title)}</div>` : ''}
          <div class="note-preview">${escapeHtml(n.content.substring(0, 200))}</div>

          <div class="note-footer">
            <div class="note-time">${formatTime(n.updatedAt)}</div>

            <button class="delete-note" data-id="${n.id}" title="Delete note">
              ${ICON_TRASH}
            </button>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}

// ================= EVENTS =================
document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle
  document.getElementById("themeBtn").addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    applyTheme();
    saveData();
    showToast(`${state.settings.theme === "dark" ? "🌙" : "☀️"} ${state.settings.theme === "dark" ? "Dark" : "Light"} mode enabled`);
  });

  // Mode switch
  document.getElementById("modeLinks").addEventListener("click", () => {
    if (state.currentMode === "links") return;
    
    state.currentMode = "links";
    state.searchQuery = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("modeLinks").classList.add("active");
    document.getElementById("modeNotes").classList.remove("active");
    renderContent(true);
  });

  document.getElementById("modeNotes").addEventListener("click", () => {
    if (state.currentMode === "notes") return;
    
    state.currentMode = "notes";
    state.searchQuery = "";
    document.getElementById("searchInput").value = "";
    document.getElementById("modeNotes").classList.add("active");
    document.getElementById("modeLinks").classList.remove("active");
    renderContent(true);
  });

  // Search
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    renderContent();
  });

  // Quick input
  const quick = document.getElementById("quickAddInput");
  quick.addEventListener("keydown", (e) => {
    const val = quick.value.trim();
    if (!val) return;

    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      
      // FIXED: Better URL detection
      if (isURL(val)) {
        addLink(val);
      } else {
        // It's a regular note, open the editor for full note with title
        openNoteEditor();
        document.getElementById("noteEditor").value = val;
      }
      quick.value = "";
    }

    // Shift + Enter: Add as quick note without title
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      addNote(val);
      quick.value = "";
    }

    // Cmd/Ctrl + Enter: Open full editor
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openNoteEditor();
      document.getElementById("noteEditor").value = val;
      quick.value = "";
    }
  });

  // Content area event delegation
  document.getElementById("contentArea").addEventListener("click", (e) => {
    // Delete link
    const linkDel = e.target.closest(".delete-link");
    if (linkDel) {
      e.stopPropagation();
      deleteLink(linkDel.dataset.id);
      return;
    }

    // Delete note
    const noteDel = e.target.closest(".delete-note");
    if (noteDel) {
      e.stopPropagation();
      deleteNote(noteDel.dataset.id);
      return;
    }

    // Open note editor
    const noteCard = e.target.closest(".note-card");
    if (noteCard && !e.target.closest(".delete-note")) {
      openNoteEditor(noteCard.dataset.id);
      return;
    }

    // Open link in new tab
    const linkItem = e.target.closest(".link-item");
    if (linkItem && !e.target.closest(".delete-link")) {
      const link = state.links.find((l) => l.id === linkItem.dataset.id);
      if (link) {
        chrome.tabs.create({ url: link.url });
      }
    }
  });

  // Modal events
  document.getElementById("closeModal").addEventListener("click", closeNoteEditor);
  document.getElementById("saveNoteBtn").addEventListener("click", saveNote);

  // Close modal on outside click
  document.getElementById("noteModal").addEventListener("click", (e) => {
    if (e.target.id === "noteModal") {
      closeNoteEditor();
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("noteModal").classList.contains("active")) {
      closeNoteEditor();
    }
  });

  // Save note on Ctrl/Cmd + Enter in editor
  document.getElementById("noteEditor").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      saveNote();
    }
  });

  // Initial load
  loadData();
});