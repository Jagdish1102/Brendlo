// ------- config -------
// API_BASE_URL comes from config.js (loaded before this file). Update it
// there once you have a deployed backend, and every endpoint below updates.
const API = {
  ADMIN_ME: `${API_BASE_URL}/api/admin/me`,
  BLOGS: `${API_BASE_URL}/api/blogs`,
  UPLOAD: `${API_BASE_URL}/api/files/upload`,
};

function getToken() {
  return (
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
  );
}
function authHeaders(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  const t = getToken();
  if (t) h["Authorization"] = "Bearer " + t;
  return h;
}
function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }
function setText(el, txt) { el.textContent = txt; }

const state = {
  profile: { fullName: "", email: "" },
  blogs: [],
  editingId: null,
  // thumbnail temp
  thumbFile: null, thumbPreviewUrl: null, savedThumbUrl: null,
};

// ------- elements -------
const el = {};
document.addEventListener("DOMContentLoaded", () => {
  // sidebar/header
  el.profileInitial = document.getElementById("profileInitial");
  el.profileFullNameText = document.getElementById("profileFullNameText");
  el.profileEmailText = document.getElementById("profileEmailText");
  el.headerName = document.getElementById("headerName");

  // nav
  el.navBlogs = document.getElementById("navBlogs");
  el.navAddBlog = document.getElementById("navAddBlog");

  // messages
  el.errorBox = document.getElementById("errorBox");
  el.successBox = document.getElementById("successBox");

  // views
  el.viewBlogs = document.getElementById("viewBlogs");
  el.viewAddEdit = document.getElementById("viewAddEdit");
  el.addEditTitle = document.getElementById("addEditTitle");

  // blogs list
  el.noBlogs = document.getElementById("noBlogs");
  el.blogsList = document.getElementById("blogsList");
  el.addBlogTopBtn = document.getElementById("addBlogTopBtn");

  // blog form fields
  el.blogForm = document.getElementById("blogForm");
  el.titleInput = document.getElementById("titleInput");
  el.authorInput = document.getElementById("authorInput");
  el.timeToReadInput = document.getElementById("timeToReadInput");
  el.pubDateInput = document.getElementById("pubDateInput");
  el.shortDescInput = document.getElementById("shortDescInput");
  el.contentInput = document.getElementById("contentInput");
  el.approvalSelect = document.getElementById("approvalSelect");
  el.publishSelect = document.getElementById("publishSelect");
  el.metaTitleInput = document.getElementById("metaTitleInput");
  el.metaKeywordsInput = document.getElementById("metaKeywordsInput");
  el.metaDescriptionInput = document.getElementById("metaDescriptionInput");
  el.indexingSelect = document.getElementById("indexingSelect");
  el.linkFollowingSelect = document.getElementById("linkFollowingSelect");
  el.ogTitleInput = document.getElementById("ogTitleInput");
  el.ogDescriptionInput = document.getElementById("ogDescriptionInput");
  el.cancelEditBtn = document.getElementById("cancelEditBtn");

  // thumbnail ui
  el.thumbFile = document.getElementById("thumbFile");
  el.thumbName = document.getElementById("thumbName");
  el.uploadThumbBtn = document.getElementById("uploadThumbBtn");
  el.clearThumbBtn = document.getElementById("clearThumbBtn");
  el.thumbPreview = document.getElementById("thumbPreview");
  el.savedThumbUrl = document.getElementById("savedThumbUrl");

  // profile modal
  el.profileModal = document.getElementById("profileModal");
  el.openProfileBtn = document.getElementById("openProfileBtn");
  el.openProfileBtn2 = document.getElementById("openProfileBtn2");
  el.closeProfileBtn = document.getElementById("closeProfileBtn");
  el.cancelProfileBtn = document.getElementById("cancelProfileBtn");
  el.saveProfileBtn = document.getElementById("saveProfileBtn");
  el.profileInitialBig = document.getElementById("profileInitialBig");
  el.profileEmailBig = document.getElementById("profileEmailBig");
  el.pfFullName = document.getElementById("pfFullName");
  el.pfEmail = document.getElementById("pfEmail");
  el.pfNewPassword = document.getElementById("pfNewPassword");
  el.pfNewPasswordConfirm = document.getElementById("pfNewPasswordConfirm");
  el.pfMismatch = document.getElementById("pfMismatch");
  document.getElementById("yearFooter").textContent = new Date().getFullYear();

  // buttons
  el.logoutBtn = document.getElementById("logoutBtn");

  // events
  el.openProfileBtn.addEventListener("click", openProfile);
  el.openProfileBtn2.addEventListener("click", openProfile);
  el.closeProfileBtn.addEventListener("click", closeProfile);
  el.cancelProfileBtn.addEventListener("click", closeProfile);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeProfile(); });

  el.navBlogs.addEventListener("click", () => setView("blogs"));
  el.navAddBlog.addEventListener("click", startCreate);
  el.addBlogTopBtn.addEventListener("click", startCreate);
  el.cancelEditBtn.addEventListener("click", () => setView("blogs"));
  el.blogForm.addEventListener("submit", submitBlog);

  el.thumbFile.addEventListener("change", onThumbSelected);
  el.uploadThumbBtn.addEventListener("click", uploadThumb);
  el.clearThumbBtn.addEventListener("click", clearThumb);

  el.saveProfileBtn.addEventListener("click", (e) => { e.preventDefault(); saveProfile(); });
  el.logoutBtn.addEventListener("click", logout);

  // initial data
  fetchProfile();
  loadBlogs();
});

// ------- helpers ui -------
function setError(msg) {
  const b = el.errorBox;
  if (!msg) return hide(b);
  b.textContent = msg;
  show(b);
}
function setSuccess(msg) {
  const b = el.successBox;
  if (!msg) return hide(b);
  b.textContent = msg;
  show(b);
  setTimeout(() => hide(b), 2500);
}

function initialFromName(name) {
  return (name?.trim()?.[0] || "A").toUpperCase();
}
function fmtDate(dstr) {
  try { return new Date(dstr).toLocaleDateString(); } catch { return ""; }
}

// ------- profile -------
async function fetchProfile() {
  const token = getToken();
  if (!token) {
    // no router; redirect to login page in your static site:
    window.location.href = "login.html";
    return;
  }
  try {
    const res = await fetch(API.ADMIN_ME, { headers: authHeaders(false) });
    if (res.status === 401) { window.location.href = "login.html"; return; }
    const data = await res.json();
    state.profile = data || { fullName: "", email: "" };
    renderProfile();
  } catch (e) {
    setError("Failed to load profile");
  }
}

function renderProfile() {
  const { fullName, email } = state.profile;
  setText(el.profileFullNameText, fullName || "Admin");
  setText(el.profileEmailText, email || "—");
  setText(el.headerName, fullName || "Admin");
  setText(el.profileInitial, initialFromName(fullName));
}

function openProfile() {
  const { fullName, email } = state.profile;
  setText(el.profileInitialBig, initialFromName(fullName));
  setText(el.profileEmailBig, email || "—");
  el.pfFullName.value = fullName || "";
  el.pfEmail.value = email || "";
  el.pfNewPassword.value = "";
  el.pfNewPasswordConfirm.value = "";
  hide(el.pfMismatch);
  el.profileModal.classList.remove("hidden");
}
function closeProfile() {
  el.profileModal.classList.add("hidden");
}

async function saveProfile() {
  setError("");
  const fullName = el.pfFullName.value.trim();
  const email = el.pfEmail.value.trim();
  const newPw = el.pfNewPassword.value;
  const newPw2 = el.pfNewPasswordConfirm.value;

  if (!fullName) return setError("Full name is required.");
  if (!email) return setError("Email is required.");
  if (newPw || newPw2) {
    if (newPw.length < 8) return setError("New password must be at least 8 characters.");
    if (newPw !== newPw2) { show(el.pfMismatch); return; }
  }
  hide(el.pfMismatch);

  const body = { fullName, email };
  if (newPw) body.newPassword = newPw;

  try {
    const res = await fetch(API.ADMIN_ME, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    state.profile = data || { fullName, email };
    renderProfile();
    setSuccess(newPw ? "Name, email & password updated successfully!" : "Profile updated successfully!");
    closeProfile();
  } catch (e) {
    setError(e?.message || "Update failed");
  }
}

// ------- blogs -------
async function loadBlogs() {
  try {
    const res = await fetch(API.BLOGS);
    const data = await res.json();
    state.blogs = Array.isArray(data) ? data : [];
    renderBlogs();
  } catch (e) {
    // silent
  }
}

function renderBlogs() {
  const list = el.blogsList;
  list.innerHTML = "";
  if (!state.blogs.length) {
    show(el.noBlogs);
    return;
  }
  hide(el.noBlogs);

  state.blogs.forEach((b) => {
    const li = document.createElement("li");
    li.className = "p-6 hover:bg-gray-50 transition";
    li.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold truncate">${escapeHtml(b.title || "")}</h3>
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              b.publishStatus === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-700"
            }">${b.publishStatus}</span>
          </div>
          <p class="text-xs text-gray-500 truncate">
            by ${escapeHtml(b.authorName || "")} • ${Number(b.timeToReadMinutes) || 0} min read
            ${b.publicationDate ? " • " + fmtDate(b.publicationDate) : ""}
          </p>
          <p class="text-sm text-gray-600 mt-1 line-clamp-2">${escapeHtml(b.shortDescription || "")}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button class="px-3 py-1.5 text-xs rounded-lg border hover:bg-gray-50 cursor-pointer" data-action="edit">Edit</button>
          <button class="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer" data-action="delete">Delete</button>
        </div>
      </div>
    `;
    li.querySelector('[data-action="edit"]').addEventListener("click", () => startEdit(b));
    li.querySelector('[data-action="delete"]').addEventListener("click", () => confirmDelete(b));
    list.appendChild(li);
  });
}

function setView(view) {
  if (view === "blogs") {
    show(el.viewBlogs); hide(el.viewAddEdit);
    el.navBlogs.classList.add("bg-sky-100","font-semibold");
    el.navAddBlog.classList.remove("bg-sky-100","font-semibold");
  } else {
    hide(el.viewBlogs); show(el.viewAddEdit);
    el.navAddBlog.classList.add("bg-sky-100","font-semibold");
    el.navBlogs.classList.remove("bg-sky-100","font-semibold");
  }
}

function startCreate() {
  state.editingId = null;
  el.addEditTitle.textContent = "Add New Blog";
  fillBlogForm(blankBlog());
  resetThumbState();
  setView("add");
}

function startEdit(b) {
  state.editingId = b.id;
  el.addEditTitle.textContent = "Edit Blog";
  fillBlogForm({
    ...b,
    publicationDate: b.publicationDate ? String(b.publicationDate).slice(0,10) : "",
  });
  // thumb state
  resetThumbState();
  if (b.thumbnailUrl) {
    state.savedThumbUrl = b.thumbnailUrl;
    el.savedThumbUrl.textContent = "Saved URL: " + b.thumbnailUrl;
    show(el.savedThumbUrl);
    show(el.clearThumbBtn);
  }
  setView("add");
}

function blankBlog() {
  return {
    title: "", authorName: "", timeToReadMinutes: "", publicationDate: "",
    shortDescription: "", content: "", approvalStatus: "PENDING", publishStatus: "UNPUBLISHED",
    metaTitle: "", metaKeywords: "", metaDescription: "", ogTitle: "", ogDescription: "",
    indexing: "INDEX", linkFollowing: "FOLLOW", structuredData: "", thumbnailUrl: null
  };
}

function fillBlogForm(b) {
  el.titleInput.value = b.title || "";
  el.authorInput.value = b.authorName || "";
  el.timeToReadInput.value = b.timeToReadMinutes || "";
  el.pubDateInput.value = b.publicationDate || "";
  el.shortDescInput.value = b.shortDescription || "";
  el.contentInput.value = b.content || "";
  el.approvalSelect.value = b.approvalStatus || "PENDING";
  el.publishSelect.value = b.publishStatus || "UNPUBLISHED";
  el.metaTitleInput.value = b.metaTitle || "";
  el.metaKeywordsInput.value = b.metaKeywords || "";
  el.metaDescriptionInput.value = b.metaDescription || "";
  el.indexingSelect.value = b.indexing || "INDEX";
  el.linkFollowingSelect.value = b.linkFollowing || "FOLLOW";
  el.ogTitleInput.value = b.ogTitle || "";
  el.ogDescriptionInput.value = b.ogDescription || "";
}

function readBlogForm() {
  return {
    title: el.titleInput.value.trim(),
    authorName: el.authorInput.value.trim(),
    timeToReadMinutes: Number(el.timeToReadInput.value) || null,
    publicationDate: el.pubDateInput.value || null,
    shortDescription: el.shortDescInput.value.trim(),
    content: el.contentInput.value.trim(),
    approvalStatus: el.approvalSelect.value,
    publishStatus: el.publishSelect.value,
    metaTitle: el.metaTitleInput.value.trim(),
    metaKeywords: el.metaKeywordsInput.value.trim(),
    metaDescription: el.metaDescriptionInput.value.trim(),
    ogTitle: el.ogTitleInput.value.trim(),
    ogDescription: el.ogDescriptionInput.value.trim(),
    indexing: el.indexingSelect.value,
    linkFollowing: el.linkFollowingSelect.value,
    structuredData: "", // keep empty like component
    thumbnailUrl: state.savedThumbUrl || null,
  };
}

async function submitBlog(e) {
  if (e?.preventDefault) e.preventDefault();
  setError(""); setSuccess("");

  const payload = readBlogForm();
  if (!payload.title || !payload.authorName || !payload.content) {
    setError("Title, Author, and Content are required.");
    return;
  }
  if (state.thumbFile && !state.savedThumbUrl) {
    setError('Please click "Upload" to upload the selected thumbnail first.');
    return;
  }
  const method = state.editingId == null ? "POST" : "PUT";
  const url = state.editingId == null ? API.BLOGS : `${API.BLOGS}/${state.editingId}`;

  try {
    const res = await fetch(url, { method, headers: authHeaders(true), body: JSON.stringify(payload) });
    if (!res.ok) throw await safeJson(res);
    const saved = await res.json();
    if (state.editingId == null) {
      state.blogs = [saved, ...state.blogs];
      setSuccess(`Blog “${saved.title}” created!`);
    } else {
      state.blogs = state.blogs.map((x) => (x.id === saved.id ? saved : x));
      setSuccess(`Blog “${saved.title}” updated!`);
    }
    state.editingId = null;
    resetThumbState();
    fillBlogForm(blankBlog());
    renderBlogs();
    setView("blogs");
  } catch (err) {
    if (err?.status === 401) setError("Unauthorized. Please login again.");
    else if (err?.status === 403) setError("Forbidden. Admin role required.");
    else setError(err?.message || "Save failed.");
  }
}

async function confirmDelete(b) {
  if (!confirm(`Delete “${b.title}”?`)) return;
  try {
    const res = await fetch(`${API.BLOGS}/${b.id}`, { method: "DELETE", headers: authHeaders(false) });
    if (!res.ok) throw await safeJson(res);
    state.blogs = state.blogs.filter((x) => x.id !== b.id);
    setSuccess("Blog deleted.");
    renderBlogs();
    if (state.editingId === b.id) {
      state.editingId = null;
      resetThumbState();
      fillBlogForm(blankBlog());
    }
  } catch (err) {
    if (err?.status === 401) setError("Unauthorized. Please login again.");
    else if (err?.status === 403) setError("Forbidden. Admin role required.");
    else setError(err?.message || "Delete failed.");
  }
}

// ------- thumbnail -------
function onThumbSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image file.");
    return;
  }
  state.thumbFile = file;
  el.thumbName.textContent = file.name;
  if (state.thumbPreviewUrl) URL.revokeObjectURL(state.thumbPreviewUrl);
  state.thumbPreviewUrl = URL.createObjectURL(file);
  el.thumbPreview.src = state.thumbPreviewUrl;
  show(el.thumbPreview);
  show(el.uploadThumbBtn);
  el.uploadThumbBtn.disabled = false;
  show(el.clearThumbBtn);
  state.savedThumbUrl = null;
  hide(el.savedThumbUrl);
}

async function uploadThumb() {
  if (!state.thumbFile) return;
  try {
    el.uploadThumbBtn.disabled = true;
    el.uploadThumbBtn.textContent = "Uploading…";

    const form = new FormData();
    form.append("file", state.thumbFile);
    const headers = authHeaders(false); // no JSON
    const res = await fetch(API.UPLOAD, { method: "POST", headers, body: form });
    const data = await res.json();
    if (!res.ok || !data?.url) throw new Error(data?.message || "Thumbnail upload failed.");

    state.savedThumbUrl = data.url;
    el.savedThumbUrl.textContent = "Saved URL: " + data.url;
    show(el.savedThumbUrl);
    setSuccess("Thumbnail uploaded!");
  } catch (err) {
    setError(err?.message || "Thumbnail upload failed.");
  } finally {
    el.uploadThumbBtn.disabled = false;
    el.uploadThumbBtn.textContent = "Upload";
  }
}

function clearThumb() {
  if (state.thumbPreviewUrl) URL.revokeObjectURL(state.thumbPreviewUrl);
  state.thumbFile = null;
  state.thumbPreviewUrl = null;
  state.savedThumbUrl = null;
  el.thumbFile.value = "";
  el.thumbName.textContent = "No file chosen";
  hide(el.thumbPreview);
  hide(el.savedThumbUrl);
  hide(el.clearThumbBtn);
  el.uploadThumbBtn.disabled = true;
}

function resetThumbState() { clearThumb(); }

// ------- auth -------
function logout() {
  localStorage.removeItem("auth_token");
  sessionStorage.removeItem("auth_token");
  localStorage.removeItem("rememberEmail");
  window.location.href = "login.html";
}

// ------- misc -------
function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
async function safeJson(res) {
  try { return await res.json(); } catch { return { status: res.status }; }
}
