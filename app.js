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

// Image upload elements
const imageInput = document.getElementById("image-input");
const imageUploadArea = document.getElementById("image-upload-area");
const imagePreviewContainer = document.getElementById("image-preview-container");

// Image upload state
let selectedImages = [];
let uploadedImageUrls = [];

// 🔹 AUTH HANDLING
signupBtn.addEventListener("click", async () => {
  showToast("Creating your account...", undefined, "loading");
  const { error } = await supabase.auth.signUp({
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
  const { error } = await supabase.auth.signInWithPassword({
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

// 🔹 IMAGE UPLOAD FUNCTIONALITY
// Drag and drop functionality
imageUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  imageUploadArea.classList.add('border-emerald-500', 'bg-slate-800/30');
});

imageUploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  imageUploadArea.classList.remove('border-emerald-500', 'bg-slate-800/30');
});

imageUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  imageUploadArea.classList.remove('border-emerald-500', 'bg-slate-800/30');
  const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
  handleImageSelection(files);
});

// File input change
imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  handleImageSelection(files);
});

// Handle image selection
function handleImageSelection(files) {
  const validFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select only image files', 2000, 'error');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast(`File ${file.name} is too large. Maximum size is 10MB`, 2000, 'error');
      return false;
    }
    return true;
  });

  selectedImages = [...selectedImages, ...validFiles];
  displayImagePreviews();
}

// Display image previews
function displayImagePreviews() {
  imagePreviewContainer.innerHTML = '';
  
  if (selectedImages.length === 0) {
    imagePreviewContainer.classList.add('hidden');
    return;
  }

  imagePreviewContainer.classList.remove('hidden');
  
  selectedImages.forEach((file, index) => {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'relative group';
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'w-full h-24 object-cover rounded-lg border border-slate-700';
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    removeBtn.className = 'absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100';
    removeBtn.onclick = () => removeImage(index);
    
    const fileName = document.createElement('p');
    fileName.textContent = file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name;
    fileName.className = 'text-xs text-slate-400 mt-1 truncate';
    
    previewDiv.appendChild(img);
    previewDiv.appendChild(removeBtn);
    previewDiv.appendChild(fileName);
    imagePreviewContainer.appendChild(previewDiv);
  });
}

// Remove image from selection
function removeImage(index) {
  selectedImages.splice(index, 1);
  displayImagePreviews();
}

// Upload images to Supabase Storage
async function uploadImagesToStorage() {
  if (selectedImages.length === 0) return [];
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  
  const uploadPromises = selectedImages.map(async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('note-images')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('note-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  });
  
  const results = await Promise.all(uploadPromises);
  return results.filter(url => url !== null);
}

// Clear image selection
function clearImageSelection() {
  selectedImages = [];
  uploadedImageUrls = [];
  imageInput.value = '';
  displayImagePreviews();
}

// Show image modal for viewing larger images
function showImageModal(imageUrl, allImages, currentIndex) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden';
  modalContent.onclick = (e) => e.stopPropagation();
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  `;
  closeBtn.className = 'absolute top-4 right-4 z-10 p-2 bg-slate-800/80 text-white rounded-full hover:bg-slate-700/80 transition-colors';
  closeBtn.onclick = () => document.body.removeChild(modal);
  
  // Image container
  const imgContainer = document.createElement('div');
  imgContainer.className = 'relative';
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.className = 'w-full h-auto max-h-[80vh] object-contain';
  img.alt = 'Note image';
  
  imgContainer.appendChild(img);
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(imgContainer);
  
  // Navigation if multiple images
  if (allImages && allImages.length > 1) {
    const navContainer = document.createElement('div');
    navContainer.className = 'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2';
    
    allImages.forEach((url, index) => {
      const navBtn = document.createElement('button');
      navBtn.className = `w-3 h-3 rounded-full transition-colors ${
        index === currentIndex ? 'bg-emerald-500' : 'bg-slate-600 hover:bg-slate-500'
      }`;
      navBtn.onclick = () => {
        img.src = url;
        // Update active nav button
        navContainer.querySelectorAll('button').forEach((btn, i) => {
          btn.className = `w-3 h-3 rounded-full transition-colors ${
            i === index ? 'bg-emerald-500' : 'bg-slate-600 hover:bg-slate-500'
          }`;
        });
      };
      navContainer.appendChild(navBtn);
    });
    
    modalContent.appendChild(navContainer);
  }
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Display existing images during editing
function displayExistingImages(imageUrls) {
  imagePreviewContainer.innerHTML = '';
  imagePreviewContainer.classList.remove('hidden');
  
  imageUrls.forEach((imageUrl, index) => {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'relative group';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'w-full h-24 object-cover rounded-lg border border-slate-700';
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;
    removeBtn.className = 'absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100';
    removeBtn.onclick = () => removeExistingImage(index);
    
    const fileName = document.createElement('p');
    fileName.textContent = `Existing Image ${index + 1}`;
    fileName.className = 'text-xs text-slate-400 mt-1 truncate';
    
    previewDiv.appendChild(img);
    previewDiv.appendChild(removeBtn);
    previewDiv.appendChild(fileName);
    imagePreviewContainer.appendChild(previewDiv);
  });
}

// Remove existing image from edit
function removeExistingImage(index) {
  uploadedImageUrls.splice(index, 1);
  if (uploadedImageUrls.length === 0) {
    imagePreviewContainer.classList.add('hidden');
  } else {
    displayExistingImages(uploadedImageUrls);
  }
}

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    showToast("Please log in first!", 1800);
    return;
  }

  notesList.innerHTML = "";
  // Show loader
  if (notesLoader) notesLoader.classList.remove("hidden");
  if (notesEmpty) notesEmpty.classList.add("hidden");
  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
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
    text.className = "text-slate-200 flex-1";
    const title = document.createElement("h3");
    title.className = "mb-1 text-slate-100 font-medium";
    title.textContent = note.title || "Untitled";
    const body = document.createElement("div");
    body.className = "text-slate-300";
    body.textContent = note.content || "";
    text.appendChild(title);
    text.appendChild(body);
    
    // Add images if they exist
    if (note.images && note.images.length > 0) {
      const imagesContainer = document.createElement("div");
      imagesContainer.className = "mt-2 flex gap-2 flex-wrap";
      
      note.images.slice(0, 3).forEach((imageUrl, index) => {
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "relative group cursor-pointer";
        
        const img = document.createElement("img");
        img.src = imageUrl;
        img.className = "w-16 h-16 object-cover rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors";
        img.alt = `Image ${index + 1}`;
        
        // Add click to view larger
        img.onclick = () => showImageModal(imageUrl, note.images, index);
        
        imgWrapper.appendChild(img);
        imagesContainer.appendChild(imgWrapper);
      });
      
      // Show "+X more" if there are more than 3 images
      if (note.images.length > 3) {
        const moreText = document.createElement("div");
        moreText.className = "w-16 h-16 rounded-lg border border-slate-700 bg-slate-800/60 flex items-center justify-center text-xs text-slate-400";
        moreText.textContent = `+${note.images.length - 3}`;
        moreText.onclick = () => showImageModal(note.images[3], note.images, 3);
        imagesContainer.appendChild(moreText);
      }
      
      text.appendChild(imagesContainer);
    }

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
      
      // Clear any existing image selection and show existing images
      clearImageSelection();
      if (note.images && note.images.length > 0) {
        uploadedImageUrls = [...note.images];
        displayExistingImages(note.images);
      }
      
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

  if(newNoteInput.value.trim() === "" && selectedImages.length === 0) {
    showToast("Please enter a note or add an image", 1800, "error");
    return;
  }

  const titleValue = (newTitleInput.value || "").trim() || "Untitled";
  
  // Show loading state
  addNoteBtn.disabled = true;
  addNoteBtn.textContent = editState.id ? "Saving..." : "Adding...";
  showToast(editState.id ? "Saving changes..." : "Adding note...", undefined, "loading");

  try {
    let imageUrls = [...uploadedImageUrls]; // Start with existing images
    
    // Upload new images if any are selected
    if (selectedImages.length > 0) {
      const newImageUrls = await uploadImagesToStorage();
      if (newImageUrls.length === 0 && selectedImages.length > 0) {
        showToast("Failed to upload images", 2000, "error");
        return;
      }
      imageUrls = [...imageUrls, ...newImageUrls]; // Combine existing and new images
    }

    if (editState.id) {
      // Save edits
      await supabase
        .from("notes")
        .update({ 
          title: titleValue, 
          content: newNoteInput.value,
          images: imageUrls.length > 0 ? imageUrls : null
        })
        .eq("id", editState.id);
      editState.id = null;
      addNoteBtn.textContent = "Add Note";
      cancelEditBtn.classList.add("hidden");
      showToast("Saved changes", 1200, "success");
    } else {
      await supabase.from("notes").insert([
        { 
          title: titleValue, 
          content: newNoteInput.value, 
          user_id: user.id,
          images: imageUrls.length > 0 ? imageUrls : null
        },
      ]);
      showToast("Note added", 1200, "success");
    }
    
    // Clear form
    newNoteInput.value = "";
    newTitleInput.value = "";
    clearImageSelection();
    loadNotes(searchInput?.value || "");
    
  } catch (error) {
    console.error('Error saving note:', error);
    showToast("Failed to save note", 2000, "error");
  } finally {
    addNoteBtn.disabled = false;
    addNoteBtn.textContent = editState.id ? "Save Changes" : "Add Note";
    hideToast();
  }
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
  clearImageSelection();
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
