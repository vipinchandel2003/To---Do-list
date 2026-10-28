/**
 * script.js – CodeOrbit Tech To-Do List
 * Pure Vanilla JS + localStorage
 * No frameworks, no dependencies.
 */

'use strict';

/* ==========================================================
   CONSTANTS & STATE
   ========================================================== */
const STORAGE_KEY = 'codeorbit_tasks';

/** @type {'all'|'pending'|'done'} */
let currentFilter = 'all';

/* ==========================================================
   STORAGE HELPERS
   ========================================================== */

/**
 * Load tasks array from localStorage.
 * Returns [] on missing, invalid, or malformed data.
 * @returns {Task[]}
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each entry; skip malformed ones
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.title === 'string' &&
        typeof t.completed === 'boolean' &&
        typeof t.createdAt === 'string'
    );
  } catch {
    return [];
  }
}

/**
 * Save tasks array to localStorage.
 * @param {Task[]} tasks
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage quota exceeded – silently continue
  }
}

/* ==========================================================
   TASK OPERATIONS (pure-ish functions that mutate storage)
   ========================================================== */

/**
 * @typedef {{ id: string; title: string; completed: boolean; createdAt: string }} Task
 */

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Add a new task and persist. Returns the new task. */
function addTask(title) {
  const tasks = loadTasks();
  const task = {
    id: uid(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

/** Toggle completion status of task with given id. */
function toggleTask(id) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks(tasks);
  }
}

/** Update the title of task with given id. */
function updateTask(id, newTitle) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.title = newTitle.trim();
    saveTasks(tasks);
  }
}

/** Delete task with given id. */
function deleteTask(id) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}

/** Return tasks filtered by currentFilter. */
function getFilteredTasks() {
  const tasks = loadTasks();
  if (currentFilter === 'pending') return tasks.filter((t) => !t.completed);
  if (currentFilter === 'done')    return tasks.filter((t) => t.completed);
  return tasks;
}

/* ==========================================================
   DOM HELPERS
   ========================================================== */

/** Show or clear the inline error message */
function setError(msg) {
  const el = document.getElementById('input-error');
  el.textContent = msg;
  el.setAttribute('role', 'alert');
}

/** Format ISO timestamp to "Oct 29, 2026" */
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** Update the stats pills (total / pending / done). */
function updateStats() {
  const all     = loadTasks();
  const pending = all.filter((t) => !t.completed).length;
  const done    = all.filter((t) => t.completed).length;

  document.getElementById('stat-total').textContent   = `Total: ${all.length}`;
  document.getElementById('stat-pending').textContent = `Pending: ${pending}`;
  document.getElementById('stat-done').textContent    = `Done: ${done}`;
}

/* ==========================================================
   RENDER – builds task list from scratch each time
   (single source of truth, no stale handlers)
   ========================================================== */

function renderTasks() {
  const list   = document.getElementById('task-list');
  const tasks  = getFilteredTasks();

  // Clear existing items
  list.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.setAttribute('role', 'status');
    empty.innerHTML = `
      <span class="empty-icon" aria-hidden="true">📋</span>
      <h3>No tasks yet</h3>
      <p>${
        currentFilter === 'pending' ? 'No pending tasks — great job!' :
        currentFilter === 'done'    ? 'No completed tasks yet.' :
        'Add your first task above and get started!'
      }</p>`;
    list.appendChild(empty);
    updateStats();
    return;
  }

  tasks.forEach((task) => {
    list.appendChild(buildTaskItem(task));
  });

  updateStats();
}

/* ==========================================================
   BUILD ONE TASK ITEM  (safe DOM construction, no innerHTML
   for user-supplied text)
   ========================================================== */

function buildTaskItem(task) {
  /* --- li wrapper --- */
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;
  li.setAttribute('role', 'listitem');

  /* --- checkbox --- */
  const cbWrap = document.createElement('div');
  cbWrap.className = 'task-checkbox-wrap';

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'task-checkbox';
  cb.checked = task.completed;
  cb.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
  cb.addEventListener('change', () => {
    toggleTask(task.id);
    renderTasks();
  });
  cbWrap.appendChild(cb);

  /* --- body --- */
  const body = document.createElement('div');
  body.className = 'task-body';

  const textEl = document.createElement('p');
  textEl.className = 'task-text';
  textEl.textContent = task.title;   // ← safe; never innerHTML

  const metaEl = document.createElement('p');
  metaEl.className = 'task-meta';
  metaEl.textContent = `Added ${fmtDate(task.createdAt)}`;

  body.appendChild(textEl);
  body.appendChild(metaEl);

  /* --- action buttons --- */
  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.setAttribute('aria-label', 'Task actions');

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-edit';
  editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
  editBtn.innerHTML = '✏️';
  editBtn.addEventListener('click', () => startEdit(li, task, body, actions));

  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-danger';
  delBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
  delBtn.innerHTML = '🗑️';
  delBtn.addEventListener('click', () => confirmDelete(li, task, body));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  /* --- assemble --- */
  li.appendChild(cbWrap);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}

/* ==========================================================
   INLINE EDIT
   ========================================================== */

function startEdit(li, task, body, actions) {
  // Already editing? Do nothing.
  if (li.classList.contains('editing')) return;
  li.classList.add('editing');

  // Hide static text
  const textEl = body.querySelector('.task-text');
  const metaEl = body.querySelector('.task-meta');
  textEl.style.display = 'none';
  metaEl.style.display = 'none';

  // Build edit input
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = task.title;
  editInput.setAttribute('aria-label', 'Edit task text');
  editInput.maxLength = 300;

  // Save / Cancel buttons
  const editActions = document.createElement('div');
  editActions.className = 'edit-actions';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.style.padding = '4px 14px';
  saveBtn.style.fontSize = 'var(--text-sm)';
  saveBtn.textContent = 'Save';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.style.padding = '4px 12px';
  cancelBtn.style.fontSize = 'var(--text-sm)';
  cancelBtn.textContent = 'Cancel';

  editActions.appendChild(saveBtn);
  editActions.appendChild(cancelBtn);
  body.appendChild(editInput);
  body.appendChild(editActions);

  // Hide action buttons while editing
  actions.style.display = 'none';

  editInput.focus();
  editInput.select();

  function finishEdit() {
    const val = editInput.value.trim();
    if (!val) {
      editInput.focus();
      editInput.style.borderColor = 'var(--clr-danger)';
      return;
    }
    updateTask(task.id, val);
    renderTasks();
  }

  function cancelEdit() {
    // Restore original view without saving
    li.classList.remove('editing');
    textEl.style.display = '';
    metaEl.style.display = '';
    body.removeChild(editInput);
    body.removeChild(editActions);
    actions.style.display = '';
  }

  saveBtn.addEventListener('click', finishEdit);
  cancelBtn.addEventListener('click', cancelEdit);

  // Keyboard: Enter to save, Escape to cancel
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); finishEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
  });
}

/* ==========================================================
   INLINE CONFIRM DELETE
   ========================================================== */

function confirmDelete(li, task, body) {
  // Already showing confirm? Cancel it (toggle behaviour)
  const existing = li.querySelector('.confirm-row');
  if (existing) {
    existing.remove();
    return;
  }

  const row = document.createElement('div');
  row.className = 'confirm-row';
  row.setAttribute('role', 'alert');

  const msg = document.createElement('p');
  msg.textContent = 'Delete this task?';

  const yes = document.createElement('button');
  yes.className = 'btn-confirm-delete';
  yes.textContent = 'Yes, delete';
  yes.setAttribute('aria-label', `Confirm delete: ${task.title}`);

  const no = document.createElement('button');
  no.className = 'btn-cancel-delete';
  no.textContent = 'Cancel';

  row.appendChild(msg);
  row.appendChild(yes);
  row.appendChild(no);

  // Insert confirm row below task body
  li.appendChild(row);

  yes.focus();

  yes.addEventListener('click', () => {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      deleteTask(task.id);
      renderTasks();
    }, { once: true });
  });

  no.addEventListener('click', () => row.remove());

  // Escape key cancels
  row.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') row.remove();
  });
}

/* ==========================================================
   ADD TASK FORM HANDLER
   ========================================================== */

function handleAddTask() {
  const input = document.getElementById('task-input');
  const val   = input.value.trim();

  if (!val) {
    setError('⚠ Task cannot be empty. Please type something.');
    input.focus();
    return;
  }

  setError('');
  addTask(val);
  input.value = '';
  renderTasks();
  input.focus();
}

/* ==========================================================
   FILTER CONTROLS
   ========================================================== */

function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      btns.forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      renderTasks();
    });
  });
}

/* ==========================================================
   BOOTSTRAP
   ========================================================== */

function init() {
  /* Add Task button */
  document.getElementById('add-btn').addEventListener('click', handleAddTask);

  /* Enter key in input */
  document.getElementById('task-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  });

  /* Clear error on typing */
  document.getElementById('task-input').addEventListener('input', () => setError(''));

  /* Filter buttons */
  initFilters();

  /* Initial render (loads from localStorage) */
  renderTasks();
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
