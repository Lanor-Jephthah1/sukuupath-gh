const API_BASE = '';

const emptyState = {
  documents: [],
  summaries: [],
  quizzes: [],
  chats: [],
  notes: [],
};

// ─── User helper ─────────────────────────────────────────────────────────────

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('userAccount') || '{}');
    return user.id || null;
  } catch {
    return null;
  }
}

// ─── LocalStorage helpers ────────────────────────────────────────────────────

function getStorageKey() {
  const userId = getUserId();
  return userId ? `studyLibrary_${userId}` : 'studyLibrary_guest';
}

export function getLibrary() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return { ...emptyState };
    return { ...emptyState, ...JSON.parse(raw) };
  } catch {
    return { ...emptyState };
  }
}

export function saveLibrary(library) {
  localStorage.setItem(getStorageKey(), JSON.stringify(library));
}

export function addLibraryItem(type, item) {
  const library = getLibrary();
  const entry = {
    id: `${type}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...item,
  };
  library[type] = [entry, ...(library[type] || [])];
  saveLibrary(library);
  // Dispatch a storage event so other tabs/components pick it up
  window.dispatchEvent(new Event('studyLibraryUpdated'));
  return entry;
}

export function updateLibraryItem(type, id, updates) {
  const library = getLibrary();
  library[type] = (library[type] || []).map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  saveLibrary(library);
}

export function removeLibraryItem(type, id) {
  const library = getLibrary();
  library[type] = (library[type] || []).filter((item) => item.id !== id);
  saveLibrary(library);
  window.dispatchEvent(new Event('studyLibraryUpdated'));
}

// ─── DB sync helpers ─────────────────────────────────────────────────────────

/**
 * Save an item to the backend DB (fire-and-forget — falls back silently).
 * Also saves to localStorage for instant local access.
 */
export async function addLibraryItemWithDb(type, item) {
  const entry = addLibraryItem(type, item); // always save to localStorage first
  const userId = getUserId();
  if (!userId) return entry;
  try {
    await fetch(`${API_BASE}/api/library/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        item_type: type,
        title: item.title || 'Untitled',
        content: JSON.stringify({ ...entry }),
        created_at: entry.createdAt,
      }),
    });
  } catch {
    // silent — localStorage already has it
  }
  return entry;
}

/**
 * Fetch items from DB and merge into localStorage.
 * Returns the combined result ordered by date.
 */
export async function syncLibraryFromDb() {
  const userId = getUserId();
  if (!userId) return getLibrary();
  try {
    const res = await fetch(`${API_BASE}/api/library/items?user_id=${userId}`);
    if (!res.ok) return getLibrary();
    const dbPayload = await res.json();
    const dbItems = Array.isArray(dbPayload)
      ? dbPayload
      : Object.values(dbPayload || {}).flat();
    const library = getLibrary();
    for (const dbItem of dbItems) {
      try {
        const parsed = JSON.parse(dbItem.content || '{}');
        const type = dbItem.item_type;
        if (!library[type]) library[type] = [];
        // Only add if not already present by id
        const alreadyExists = library[type].some(
          (i) => i.id === parsed.id || i._db_id === dbItem.id
        );
        if (!alreadyExists) {
          library[type].unshift({ ...parsed, _db_id: dbItem.id });
        }
      } catch {
        // skip malformed
      }
    }
    saveLibrary(library);
    return library;
  } catch {
    return getLibrary();
  }
}

/**
 * Delete an item from both localStorage and DB.
 */
export async function removeLibraryItemWithDb(type, id, dbId) {
  removeLibraryItem(type, id);
  if (dbId) {
    try {
      await fetch(`${API_BASE}/api/library/items/${dbId}`, { method: 'DELETE' });
    } catch {
      // silent
    }
  }
}

// ─── Dashboard helpers ────────────────────────────────────────────────────────

export function getDashboardStats() {
  const library = getLibrary();
  return {
    sessionsCompleted:
      library.summaries.length +
      library.quizzes.length +
      library.chats.length,
    quizzesGenerated: library.quizzes.length,
    savedNotes: library.notes.length + library.summaries.length,
  };
}

export function getRecentActivities() {
  const library = getLibrary();
  return [
    ...library.summaries.map((item) => ({
      id: item.id,
      title: `Summary created: ${item.title || 'Study notes'}`,
      sub: new Date(item.createdAt).toLocaleString(),
      icon: 'summarize',
      color: 'bg-blue-50 text-primary',
    })),
    ...library.quizzes.map((item) => ({
      id: item.id,
      title: `Quiz generated: ${item.title || 'Practice quiz'}`,
      sub: new Date(item.createdAt).toLocaleString(),
      icon: 'quiz',
      color: 'bg-amber-50 text-secondary',
    })),
    ...library.chats.map((item) => ({
      id: item.id,
      title: `AI chat: ${item.title || 'Conversation'}`,
      sub: new Date(item.createdAt).toLocaleString(),
      icon: 'chat',
      color: 'bg-emerald-50 text-tertiary-container',
    })),
  ]
    .sort((a, b) => (a.sub < b.sub ? 1 : -1))
    .slice(0, 8);
}
