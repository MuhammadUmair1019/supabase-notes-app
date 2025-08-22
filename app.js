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
const newNoteInput = document.getElementById("new-note");
const addNoteBtn = document.getElementById("add-note");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toast-text");

// 🔹 AUTH HANDLING
signupBtn.addEventListener("click", async () => {
  showToast("Creating your account...");
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  });
  hideToast();
  if (error) {
    showToast(error.message, 2500);
  } else {
    showToast("Signup successful! Check your email.", 2500);
  }
});

loginBtn.addEventListener("click", async () => {
  showToast("Logging in...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });
  hideToast();
  if (error) {
    showToast(error.message, 2500);
  } else {
    showToast("Welcome back!", 1200);
    showNotes();
  }
});

logoutBtn.addEventListener("click", async () => {
  showToast("Signing out...");
  await supabase.auth.signOut();
  hideToast();
  authSection.style.display = "block";
  notesSection.style.display = "none";
  // Hide logout in header on sign out
  if (logoutBtn) logoutBtn.classList.add("hidden");
  showToast("Signed out", 1200);
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
async function loadNotes() {
  notesList.innerHTML = "";
  // Show loader
  if (notesLoader) notesLoader.classList.remove("hidden");
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    if (notesLoader) notesLoader.classList.add("hidden");
    return;
  }

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/60 p-3";

    const text = document.createElement("div");
    text.className = "text-slate-200";
    text.textContent = note.content;

    const actions = document.createElement("div");
    actions.className = "flex shrink-0 items-center gap-2";

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "px-3 py-1.5 text-sm rounded-lg border border-emerald-600/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20";
    editBtn.onclick = async () => {
      const newContent = prompt("Edit note:", note.content);
      if (newContent) {
        await supabase.from("notes").update({ content: newContent }).eq("id", note.id);
        loadNotes();
      }
    };

    // Delete Button
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "px-3 py-1.5 text-sm rounded-lg border border-rose-600/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20";
    delBtn.onclick = async () => {
      const { error } = await supabase.from("notes").delete().eq("id", note.id);
      if (error) {
        showToast(error.message, 1000);
      } else {
        showToast("Deleted Successfully", 1000);
        loadNotes();
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
    showToast("Please enter a note", 1000);
    return;
  }

  await supabase.from("notes").insert([
    { content: newNoteInput.value, user_id: user.id },
  ]);
  newNoteInput.value = "";
  loadNotes();
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

// Toast helpers
function showToast(message, autoHideMs) {
  if (!toast) return;
  toastText && (toastText.textContent = message);
  toast.classList.remove("hidden");
  if (autoHideMs) {
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(hideToast, autoHideMs);
  }
}
function hideToast() {
  if (!toast) return;
  toast.classList.add("hidden");
}
