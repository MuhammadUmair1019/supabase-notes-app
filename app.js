// Initialize Supabase
const SUPABASE_URL = "https://jwdawhgfgzeybfpcamzs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZGF3aGdmZ3pleWJmcGNhbXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjI3NTIsImV4cCI6MjA3MTQzODc1Mn0.h_KmDnCoB9YgLNj7qfctrNrbqolHgVrrHlHW_rFzjRY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");

const notesSection = document.getElementById("notes-section");
const authSection = document.getElementById("auth-section");
const notesList = document.getElementById("notes-list");
const notesLoader = document.getElementById("notes-loader");
const notesEmpty = document.getElementById("notes-empty");
const searchInput = document.getElementById("search");
const newTitleInput = document.getElementById("new-title");
const newNoteInput = document.getElementById("new-note");
const addNoteBtn = document.getElementById("add-note");
const cancelEditBtn = document.getElementById("cancel-edit");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toast-text");
const toastSpinner = document.getElementById("toast-spinner");
const toastIcon = document.getElementById("toast-icon");

// 🔹 AUTH HANDLING
signupBtn.addEventListener("click", async () => {
  showToast("Creating your account...", undefined, "loading");
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  hideToast();
  if (error) {
    showToast(error.message, 2500, "error");
  } else {
    showToast("Signup successful! Check your email.", 2500, "success");
  }
});

loginBtn.addEventListener("click", async () => {
  showToast("Logging in...", undefined, "loading");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  hideToast();
  if (error) {
    showToast(error.message, 2500, "error");
  } else {
    showToast("Welcome back!", 1200, "success");
    showNotes();
  }
});

logoutBtn.addEventListener("click", async () => {
  showToast("Signing out...", undefined, "loading");
  await supabase.auth.signOut();
  hideToast();
  authSection.style.display = "block";
  notesSection.style.display = "none";
  // Hide logout in header on sign out
  if (logoutBtn) logoutBtn.classList.add("hidden");
  showToast("Signed out", 1200, "success");
});

// 🔹 PROTECTED ROUTE
async function showNotes() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    showToast("Please log in first!", 1800);
    return;
  }

  authSection.style.display = "none";
  notesSection.style.display = "block";
  // Show logout in header when authenticated
  if (logoutBtn) logoutBtn.classList.remove("hidden");
  loadNotes();
}

// 🔹 CRUD OPERATIONS
let editState = { id: null };

async function loadNotes(searchTerm = "") {
  notesList.innerHTML = "";
  // Show loader
  if (notesLoader) notesLoader.classList.remove("hidden");
  if (notesEmpty) notesEmpty.classList.add("hidden");
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    showToast("Failed to load notes", 2000, "error");
    if (notesLoader) notesLoader.classList.add("hidden");
    return;
  }

  // Filter client-side for simple search
  const filtered = (notes || []).filter((n) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (n.title && n.title.toLowerCase().includes(term)) ||
      (n.content && n.content.toLowerCase().includes(term))
    );
  });

  if (filtered.length === 0) {
    if (notesEmpty) notesEmpty.classList.remove("hidden");
  }

  filtered.forEach((note) => {
    const li = document.createElement("li");
    li.className = "flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/60 p-3";

    const text = document.createElement("div");
    text.className = "text-slate-200";
    const title = document.createElement("h3");
    title.className = "mb-1 text-slate-100 font-medium";
    title.textContent = note.title || "Untitled";
    const body = document.createElement("div");
    body.className = "text-slate-300";
    body.textContent = note.content || "";
    text.appendChild(title);
    text.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "flex shrink-0 items-center gap-2";

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.textContent = editState.id === note.id ? "Editing" : "Edit";
    editBtn.disabled = editState.id === note.id;
    editBtn.className = "px-3 py-1.5 text-sm rounded-lg border border-emerald-600/30 bg-emerald-500/10 text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500/20";
    editBtn.onclick = () => {
      editState.id = note.id;
      newTitleInput.value = note.title || "Untitled";
      newNoteInput.value = note.content || "";
      addNoteBtn.textContent = "Save Changes";
      cancelEditBtn.classList.remove("hidden");
      newNoteInput.focus();
    };

    // Delete Button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "px-3 py-1.5 text-sm rounded-lg border border-rose-600/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20";
    delBtn.onclick = async () => {
      const { error } = await supabase.from("notes").delete().eq("id", note.id);
      if (error) {
        showToast(error.message, 2000, "error");
      } else {
        showToast("Deleted Successfully", 1200, "success");
        if (editState.id === note.id) {
          // Reset edit state if the edited note was deleted
          editState.id = null;
          newTitleInput.value = "";
          newNoteInput.value = "";
          addNoteBtn.textContent = "Add Note";
          cancelEditBtn.classList.add("hidden");
        }
        loadNotes(searchInput?.value || "");
      }
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(text);
    li.appendChild(actions);
    notesList.appendChild(li);
  });
  // Hide loader when done
  if (notesLoader) notesLoader.classList.add("hidden");
}

addNoteBtn.addEventListener("click", async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    showToast("You must log in first!", 1800);
    return;
  }

  if(newNoteInput.value.trim() === "") {
    showToast("Please enter a note", 1800, "error");
    return;
  }

  const titleValue = (newTitleInput.value || "").trim() || "Untitled";
  if (editState.id) {
    // Save edits
    await supabase
      .from("notes")
      .update({ title: titleValue, content: newNoteInput.value })
      .eq("id", editState.id);
    editState.id = null;
    addNoteBtn.textContent = "Add Note";
    cancelEditBtn.classList.add("hidden");
    showToast("Saved changes", 1200, "success");
  } else {
    await supabase.from("notes").insert([
      { title: titleValue, content: newNoteInput.value, user_id: user.id },
    ]);
    showToast("Note added", 1200, "success");
  }
  newNoteInput.value = "";
  newTitleInput.value = "";
  loadNotes(searchInput?.value || "");
});

// Check session on page load to decide header logout visibility
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    showNotes();
  } else {
    if (logoutBtn) logoutBtn.classList.add("hidden");
  }
})();

// Search notes
searchInput && searchInput.addEventListener("input", (e) => {
  loadNotes(e.target.value);
});

// Cancel inline edit
cancelEditBtn && cancelEditBtn.addEventListener("click", () => {
  editState.id = null;
  addNoteBtn.textContent = "Add Note";
  cancelEditBtn.classList.add("hidden");
  newTitleInput.value = "";
  newNoteInput.value = "";
});

// Toast helpers
function showToast(message, autoHideMs, variant) {
  if (!toast) return;
  toastText && (toastText.textContent = message);
  // Reset visuals
  toast.classList.remove("hidden");
  if (toastSpinner) toastSpinner.classList.add("hidden");
  if (toastIcon) {
    toastIcon.className = "h-4 w-4";
    toastIcon.innerHTML = "";
    toastIcon.classList.add("hidden");
  }

  if (variant === "loading") {
    toastSpinner && toastSpinner.classList.remove("hidden");
  } else if (variant === "error") {
    if (toastIcon) {
      toastIcon.classList.remove("hidden");
      toastIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-rose-400"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 012 0v2a1 1 0 11-2 0v-2zm.293-6.707a1 1 0 011.414 0L12 6.586l1.293-1.293a1 1 0 111.414 1.414L13.414 8l1.293 1.293a1 1 0 01-1.414 1.414L12 9.414l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 8 9.293 6.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>';
    }
  } else if (variant === "success") {
    if (toastIcon) {
      toastIcon.classList.remove("hidden");
      toastIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-emerald-400"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';
    }
  }
  if (autoHideMs) {
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(hideToast, autoHideMs);
  }
}
function hideToast() {
  if (!toast) return;
  toast.classList.add("hidden");
}
