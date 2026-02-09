// ===== API Configuration =====
const API_URL = '/api';

// ===== State =====
let currentUser = null;
let authToken = localStorage.getItem('token');
let currentFilter = 'all';
let allPodcasts = [];

// ===== DOM Elements =====
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const authModal = document.getElementById('authModal');
const podcastModal = document.getElementById('podcastModal');
const toast = document.getElementById('toast');

// Auth Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const navAuth = document.getElementById('nav-auth');
const navUser = document.getElementById('nav-user');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkAuth();
});

// ===== Event Listeners =====
function initEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // Hero buttons
    document.getElementById('heroGetStarted').addEventListener('click', () => {
        if (authToken) {
            navigateTo('dashboard');
        } else {
            showAuthModal('register');
        }
    });

    document.getElementById('heroLearnMore').addEventListener('click', () => {
        document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
    });

    // Auth buttons
    loginBtn.addEventListener('click', () => showAuthModal('login'));
    registerBtn.addEventListener('click', () => showAuthModal('register'));
    logoutBtn.addEventListener('click', logout);

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', () => hideModal(authModal));
    document.getElementById('closePodcastModal').addEventListener('click', () => hideModal(podcastModal));
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Close modals on overlay click
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) hideModal(authModal);
    });
    podcastModal.addEventListener('click', (e) => {
        if (e.target === podcastModal) hideModal(podcastModal);
    });

    // Forms
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('podcastFormElement').addEventListener('submit', handleSavePodcast);
    document.getElementById('profileFormElement').addEventListener('submit', handleUpdateProfile);

    // Search
    document.getElementById('searchBtn').addEventListener('click', searchPodcasts);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPodcasts();
    });

    // Library filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadLibrary();
        });
    });

    // Go to discover from empty library
    document.getElementById('goToDiscover').addEventListener('click', () => navigateTo('discover'));
}

// ===== Navigation =====
function navigateTo(page) {
    // Check auth for protected pages
    const protectedPages = ['discover', 'library', 'dashboard', 'profile'];
    if (protectedPages.includes(page) && !authToken) {
        showAuthModal('login');
        showToast('Please login to access this page', 'error');
        return;
    }

    // If logged in and going to home, redirect to dashboard
    if (page === 'home' && authToken) {
        page = 'dashboard';
    }

    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    document.getElementById(`page-${page}`).classList.add('active');
    const activeNavLink = document.querySelector(`[data-page="${page}"]`);
    if (activeNavLink) activeNavLink.classList.add('active');

    // Load page data
    if (page === 'library') {
        loadLibrary();
    } else if (page === 'dashboard') {
        loadDashboard();
    } else if (page === 'profile') {
        loadProfile();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Auth =====
function checkAuth() {
    if (authToken) {
        fetchProfile();
    }
}

async function fetchProfile() {
    try {
        const res = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = data.data;
            updateUIForAuth();
            // Auto-navigate to dashboard if logged in
            navigateTo('dashboard');
        } else {
            logout();
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
    }
}

function updateUIForAuth() {
    if (currentUser) {
        // Hide auth buttons, show user info
        navAuth.classList.add('hidden');
        navUser.classList.remove('hidden');
        document.getElementById('userName').textContent = currentUser.username;
        document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();

        // Show/hide nav links for logged in users
        document.getElementById('navDashboard').classList.remove('hidden');
        document.getElementById('navProfile').classList.remove('hidden');

        // Update dashboard username
        const dashboardUsername = document.getElementById('dashboardUsername');
        if (dashboardUsername) {
            dashboardUsername.textContent = currentUser.username;
        }

        // Update current date
        const currentDate = document.getElementById('currentDate');
        if (currentDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDate.textContent = new Date().toLocaleDateString('en-US', options);
        }
    } else {
        navAuth.classList.remove('hidden');
        navUser.classList.add('hidden');
        document.getElementById('navDashboard').classList.add('hidden');
        document.getElementById('navProfile').classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            authToken = data.data.token;
            localStorage.setItem('token', authToken);
            currentUser = data.data;
            updateUIForAuth();
            hideModal(authModal);
            showToast(`Welcome back, ${currentUser.username}! 👋`, 'success');
            navigateTo('dashboard');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            authToken = data.data.token;
            localStorage.setItem('token', authToken);
            currentUser = data.data;
            updateUIForAuth();
            hideModal(authModal);
            showToast(`Welcome, ${currentUser.username}! 🎉`, 'success');
            navigateTo('dashboard');
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    allPodcasts = [];
    localStorage.removeItem('token');
    updateUIForAuth();
    navigateTo('home');
    // Make sure home page is actually shown
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-home').classList.add('active');
    showToast('Logged out successfully', 'success');
}

// ===== Dashboard =====
async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/podcasts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();

        if (res.ok) {
            allPodcasts = data.data;

            // Update stats
            document.getElementById('totalPodcasts').textContent = allPodcasts.length;
            document.getElementById('listeningCount').textContent = allPodcasts.filter(p => p.status === 'listening').length;
            document.getElementById('completedCount').textContent = allPodcasts.filter(p => p.status === 'completed').length;
            document.getElementById('wishlistCount').textContent = allPodcasts.filter(p => p.status === 'wishlist').length;

            // Update recent podcasts (last 4)
            const recentContainer = document.getElementById('recentPodcasts');
            const recent = allPodcasts.slice(-4).reverse();

            if (recent.length > 0) {
                recentContainer.innerHTML = recent.map(podcast => `
          <div class="recent-item">
            <div class="recent-img">
              ${podcast.imageUrl ? `<img src="${podcast.imageUrl}" alt="${podcast.title}">` : '🎙️'}
            </div>
            <div class="recent-info">
              <h4>${escapeHtml(podcast.title)}</h4>
              <p>${escapeHtml(podcast.author)}</p>
            </div>
          </div>
        `).join('');
            } else {
                recentContainer.innerHTML = `<p class="text-muted">No podcasts yet. Start by discovering some!</p>`;
            }
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// ===== Profile =====
function loadProfile() {
    if (currentUser) {
        document.getElementById('profileUsername').value = currentUser.username;
        document.getElementById('profileEmail').value = currentUser.email;
        document.getElementById('profileAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
        const createdDate = new Date(currentUser.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('profileCreatedAt').value = createdDate;
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();

    const username = document.getElementById('profileUsername').value;
    const email = document.getElementById('profileEmail').value;

    try {
        const res = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ username, email })
        });

        const data = await res.json();

        if (res.ok) {
            currentUser = data.data;
            updateUIForAuth();
            showToast('Profile updated successfully! ✨', 'success');
        } else {
            showToast(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showToast('Connection error. Please try again.', 'error');
    }
}

// ===== Modals =====
function showAuthModal(type) {
    authModal.classList.add('active');
    if (type === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function hideModal(modal) {
    modal.classList.remove('active');
}

function showPodcastModal(podcast = null) {
    document.getElementById('podcastId').value = podcast?._id || '';
    document.getElementById('podcastTitle').value = podcast?.title || '';
    document.getElementById('podcastAuthor').value = podcast?.author || '';
    document.getElementById('podcastDescription').value = podcast?.description || '';
    document.getElementById('podcastImageUrl').value = podcast?.imageUrl || '';
    document.getElementById('podcastRating').value = podcast?.rating || '';
    document.getElementById('podcastStatus').value = podcast?.status || 'wishlist';
    document.getElementById('podcastListenUrl').value = podcast?.listenUrl || '';

    document.getElementById('podcastModalTitle').textContent = podcast?._id ? 'Edit Podcast' : 'Add Podcast';
    document.getElementById('savePodcastBtn').textContent = podcast?._id ? 'Update Podcast' : 'Save Podcast';

    podcastModal.classList.add('active');
}

// ===== Search (iTunes) =====
async function searchPodcasts() {
    const term = document.getElementById('searchInput').value.trim();
    if (!term) {
        showToast('Please enter a search term', 'error');
        return;
    }

    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div> Searching...</div>';

    try {
        const res = await fetch(`${API_URL}/podcasts/search/itunes?term=${encodeURIComponent(term)}&limit=12`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();

        if (res.ok && data.data.length > 0) {
            resultsContainer.innerHTML = data.data.map(podcast => `
        <div class="podcast-card">
          <div class="podcast-card-image">
            ${podcast.imageUrl ? `<img src="${podcast.imageUrl}" alt="${podcast.title}">` : '🎙️'}
          </div>
          <div class="podcast-card-content">
            <h3 class="podcast-card-title">${escapeHtml(podcast.title)}</h3>
            <p class="podcast-card-author">${escapeHtml(podcast.author)}</p>
            <div class="podcast-card-actions">
              <button class="btn btn-primary" onclick="saveFromItunes(${JSON.stringify(podcast).replace(/"/g, '&quot;')})">
                + Save
              </button>
              ${podcast.listenUrl ? `<a href="${podcast.listenUrl}" target="_blank" class="btn btn-glass">🎧 Listen</a>` : ''}
            </div>
          </div>
        </div>
      `).join('');
        } else {
            resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No podcasts found</h3>
          <p>Try a different search term</p>
        </div>
      `;
        }
    } catch (error) {
        resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Search failed</h3>
        <p>Please try again later</p>
      </div>
    `;
    }
}

// Save podcast from iTunes search
function saveFromItunes(podcast) {
    showPodcastModal({
        title: podcast.title,
        author: podcast.author,
        description: podcast.description || '',
        imageUrl: podcast.imageUrl || '',
        listenUrl: podcast.listenUrl || ''
    });
}

// ===== Library =====
async function loadLibrary() {
    const libraryGrid = document.getElementById('libraryGrid');
    libraryGrid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading...</div>';

    try {
        const res = await fetch(`${API_URL}/podcasts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();

        if (res.ok) {
            let podcasts = data.data;
            allPodcasts = podcasts;

            // Apply filter
            if (currentFilter !== 'all') {
                podcasts = podcasts.filter(p => p.status === currentFilter);
            }

            if (podcasts.length > 0) {
                libraryGrid.innerHTML = podcasts.map(podcast => `
          <div class="podcast-card" data-id="${podcast._id}">
            <div class="podcast-card-image">
              ${podcast.imageUrl ? `<img src="${podcast.imageUrl}" alt="${podcast.title}">` : '🎙️'}
            </div>
            <div class="podcast-card-content">
              <h3 class="podcast-card-title">${escapeHtml(podcast.title)}</h3>
              <p class="podcast-card-author">${escapeHtml(podcast.author)}</p>
              <div class="podcast-card-meta">
                <span class="podcast-rating">${podcast.rating ? '⭐'.repeat(podcast.rating) : 'No rating'}</span>
                <span class="podcast-status status-${podcast.status}">${capitalizeFirst(podcast.status)}</span>
              </div>
              ${podcast.listenUrl ? `<a href="${podcast.listenUrl}" target="_blank" class="btn btn-listen">🎧 Listen on Apple Podcasts</a>` : ''}
              <div class="podcast-card-actions">
                <button class="btn btn-glass btn-sm" onclick="editPodcast('${podcast._id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePodcast('${podcast._id}')">Delete</button>
              </div>
            </div>
          </div>
        `).join('');
            } else {
                libraryGrid.innerHTML = `
          <div class="empty-state" id="libraryEmpty">
            <div class="empty-icon">📚</div>
            <h3>${currentFilter === 'all' ? 'Your library is empty' : `No ${currentFilter} podcasts`}</h3>
            <p>Discover and save podcasts to build your collection</p>
            <button class="btn btn-primary" onclick="navigateTo('discover')">Explore Podcasts</button>
          </div>
        `;
            }
        }
    } catch (error) {
        libraryGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Failed to load library</h3>
        <p>Please try again later</p>
      </div>
    `;
    }
}

async function editPodcast(id) {
    try {
        const res = await fetch(`${API_URL}/podcasts/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        if (res.ok) {
            showPodcastModal(data.data);
        }
    } catch (error) {
        showToast('Failed to load podcast', 'error');
    }
}

async function deletePodcast(id) {
    if (!confirm('Are you sure you want to delete this podcast?')) return;

    try {
        const res = await fetch(`${API_URL}/podcasts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            showToast('Podcast deleted', 'success');
            loadLibrary();
            loadDashboard(); // Update stats
        } else {
            showToast('Failed to delete podcast', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
}

async function handleSavePodcast(e) {
    e.preventDefault();

    const id = document.getElementById('podcastId').value;
    const podcastData = {
        title: document.getElementById('podcastTitle').value,
        author: document.getElementById('podcastAuthor').value,
        description: document.getElementById('podcastDescription').value,
        imageUrl: document.getElementById('podcastImageUrl').value,
        rating: document.getElementById('podcastRating').value || null,
        status: document.getElementById('podcastStatus').value,
        listenUrl: document.getElementById('podcastListenUrl').value
    };

    try {
        const url = id ? `${API_URL}/podcasts/${id}` : `${API_URL}/podcasts`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(podcastData)
        });

        const data = await res.json();

        if (res.ok) {
            hideModal(podcastModal);
            showToast(id ? 'Podcast updated!' : 'Podcast saved!', 'success');
            loadLibrary();
            loadDashboard(); // Update stats
            navigateTo('library');
        } else {
            showToast(data.message || 'Failed to save podcast', 'error');
        }
    } catch (error) {
        showToast('Connection error', 'error');
    }
}

// ===== Utility Functions =====
function showToast(message, type = 'success') {
    toast.querySelector('.toast-message').textContent = message;
    toast.className = `toast active ${type}`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions globally available
window.saveFromItunes = saveFromItunes;
window.editPodcast = editPodcast;
window.deletePodcast = deletePodcast;
window.navigateTo = navigateTo;
window.showPodcastModal = showPodcastModal;
