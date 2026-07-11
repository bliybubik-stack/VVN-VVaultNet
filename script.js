// VVN Messenger - Main Application

// Import configuration
const CONFIG = window.CONFIG || {
    BIN_ID: '6a5222dbda38895dfe4ef18e',
    MASTER_KEY: '$2a$10$xpnzNbyjOgRS6s..YVAMhOqwuj/FOPnU15M2J9uSwHBsRJAygi1Lu',
    OWNERS: ['vaultnet', 'vnnters'],
    DEVS: ['vaultnet', 'vnnters'],
    ADMINS: ['vaultnet'],
    MODS: ['vaultnet'],
    STAFF: ['vaultnet', 'vnnters'],
    DEV_PIN: '2356-23543-13451-78901-23456',
    SYNC_INTERVAL: 5000
};

// ---------- STATE ----------
let state = {
    currentUser: null,
    currentChatPartner: null,
    localCache: { users: [], chats: {}, messages: {} },
    isMobile: window.innerWidth < 768,
    syncInterval: null,
    settings: {
        e2ee: true,
        twofa: false,
        privacy: false,
        devMode: false
    }
};

// ---------- DOM REFS ----------
const DOM = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    loaderFill: document.getElementById('loaderFill'),
    authScreen: document.getElementById('authScreen'),
    messenger: document.getElementById('messenger'),
    authError: document.getElementById('authError'),
    regError: document.getElementById('regError'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    regUsername: document.getElementById('regUsername'),
    regDisplayName: document.getElementById('regDisplayName'),
    regPassword: document.getElementById('regPassword'),
    sidebarUsername: document.getElementById('sidebarUsername'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    chatList: document.getElementById('chatList'),
    chatArea: document.getElementById('chatArea'),
    chatPlaceholder: document.getElementById('chatPlaceholder'),
    chatActive: document.getElementById('chatActive'),
    chatHeader: document.getElementById('chatHeader'),
    chatPartnerName: document.getElementById('chatPartnerName'),
    chatPartnerStatus: document.getElementById('chatPartnerStatus'),
    chatMessages: document.getElementById('chatMessages'),
    chatInputBar: document.getElementById('chatInputBar'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    backBtn: document.getElementById('backBtn'),
    profileBtn: document.getElementById('profileBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    syncDot: document.getElementById('syncDot'),
    syncStatus: document.getElementById('syncStatus'),
    manualSyncBtn: document.getElementById('manualSyncBtn'),
    profileModal: document.getElementById('profileModal'),
    profileCard: document.getElementById('profileCard'),
    profileAvatar: document.getElementById('profileAvatar'),
    profileDisplayName: document.getElementById('profileDisplayName'),
    profileUsername: document.getElementById('profileUsername'),
    profileBio: document.getElementById('profileBio'),
    profileJoined: document.getElementById('profileJoined'),
    profileTags: document.getElementById('profileTags'),
    modalClose: document.getElementById('modalClose'),
    settingsModal: document.getElementById('settingsModal'),
    settingsClose: document.getElementById('settingsClose'),
    settingsAvatar: document.getElementById('settingsAvatar'),
    settingsDisplayName: document.getElementById('settingsDisplayName'),
    settingsUsername: document.getElementById('settingsUsername'),
    settingsPassword: document.getElementById('settingsPassword'),
    settingsBio: document.getElementById('settingsBio'),
    avatarUpload: document.getElementById('avatarUpload'),
    saveSettings: document.getElementById('saveSettings'),
    e2eeToggle: document.getElementById('e2eeToggle'),
    twofaToggle: document.getElementById('twofaToggle'),
    privacyToggle: document.getElementById('privacyToggle'),
    devToggle: document.getElementById('devToggle'),
    e2eeStatus: document.getElementById('e2eeStatus'),
    twofaStatus: document.getElementById('twofaStatus'),
    privacyStatus: document.getElementById('privacyStatus'),
    devStatus: document.getElementById('devStatus'),
    chatAvatar: document.getElementById('chatAvatar'),
    chatHeaderInfo: document.getElementById('chatHeaderInfo'),
    authTabs: document.querySelectorAll('.auth-tab'),
    settingsTabs: document.querySelectorAll('.settings-tab'),
    settingsPanels: {
        profile: document.getElementById('profileSettings'),
        security: document.getElementById('securitySettings')
    }
};

// ---------- UTILITY FUNCTIONS ----------
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function generateId() {
    return Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

function getUserTags(username) {
    const tags = [];
    if (CONFIG.OWNERS.includes(username)) tags.push({ label: 'OWNER', class: 'tag-owner' });
    if (CONFIG.DEVS.includes(username)) tags.push({ label: 'DEV', class: 'tag-dev' });
    if (CONFIG.ADMINS.includes(username)) tags.push({ label: 'ADMIN', class: 'tag-admin' });
    if (CONFIG.MODS.includes(username)) tags.push({ label: 'MOD', class: 'tag-mod' });
    if (CONFIG.STAFF.includes(username)) tags.push({ label: 'STAFF', class: 'tag-staff' });
    if (tags.length === 0) {
        // Check if user has been around for a while
        const user = getUserByUsername(username);
        if (user && user.created) {
            const age = Date.now() - user.created;
            if (age > 30 * 24 * 60 * 60 * 1000) { // 30 days
                tags.push({ label: 'MEMBER', class: 'tag-member' });
            } else {
                tags.push({ label: 'GUEST', class: 'tag-guest' });
            }
        } else {
            tags.push({ label: 'MEMBER', class: 'tag-member' });
        }
    }
    return tags;
}

function getUserByUsername(username) {
    return state.localCache.users.find(u => u.username === username);
}

function getChatKey(u1, u2) {
    return [u1, u2].sort().join('_');
}

// ---------- NOTIFICATIONS ----------
function sendNotification(username, message, time) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        new Notification('VVN - New Message', {
            body: `${username}: ${message} at ${time}`,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

// ---------- LOADING ----------
function updateLoading(progress) {
    const p = Math.min(progress, 100);
    DOM.loaderFill.style.width = p + '%';
    if (p >= 100) {
        setTimeout(() => DOM.loadingOverlay.classList.add('hidden'), 300);
    }
}

// ---------- STATUS BAR ----------
function setStatus(text, color) {
    DOM.syncStatus.textContent = text;
    DOM.syncDot.className = 'status-dot ' + color;
}

// ---------- JSONBin API ----------
async function fetchFromBin() {
    try {
        setStatus('Fetching...', 'yellow');
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
            headers: {
                'X-Master-Key': CONFIG.MASTER_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        if (!resp.ok) {
            console.error('❌ HTTP Error:', resp.status);
            setStatus('Error: ' + resp.status, 'red');
            return null;
        }
        const data = await resp.json();
        setStatus('Connected', 'green');
        return data;
    } catch (e) {
        console.error('❌ Fetch error:', e);
        setStatus('Error: ' + e.message, 'red');
        return null;
    }
}

async function updateBin(data) {
    try {
        setStatus('Saving...', 'yellow');
        const resp = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.MASTER_KEY,
                'X-Bin-Meta': 'false'
            },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            console.error('❌ Save error:', resp.status);
            setStatus('Save error: ' + resp.status, 'red');
            return false;
        }
        setStatus('Saved', 'green');
        return true;
    } catch (e) {
        console.error('❌ Save error:', e);
        setStatus('Error: ' + e.message, 'red');
        return false;
    }
}

// ---------- SYNC ----------
async function syncWithRemote() {
    console.log('🔄 Syncing...');
    setStatus('Syncing...', 'yellow');

    const remote = await fetchFromBin();
    if (remote) {
        const remoteUsers = remote.users || [];
        const remoteChats = remote.chats || {};
        const remoteMessages = remote.messages || {};

        // Check for new messages
        const localMessages = state.localCache.messages || {};
        let hasNewMessages = false;

        for (const [key, msgs] of Object.entries(remoteMessages)) {
            if (!localMessages[key]) {
                localMessages[key] = msgs;
                hasNewMessages = true;
            } else if (msgs.length > localMessages[key].length) {
                const newMsgs = msgs.slice(localMessages[key].length);
                for (const msg of newMsgs) {
                    if (msg.sender !== state.currentUser?.username) {
                        hasNewMessages = true;
                        const partner = key.split('_').find(u => u !== state.currentUser?.username);
                        if (partner && state.currentUser) {
                            sendNotification(partner, msg.text, formatTime(msg.timestamp));
                        }
                    }
                }
                localMessages[key] = msgs;
            }
        }

        // Merge users
        const localUsers = state.localCache.users || [];
        const mergedUsers = [...localUsers];
        for (const rUser of remoteUsers) {
            if (!mergedUsers.find(u => u.username === rUser.username)) {
                mergedUsers.push(rUser);
            }
        }

        state.localCache.users = mergedUsers;
        state.localCache.chats = { ...remoteChats, ...state.localCache.chats };
        state.localCache.messages = localMessages;

        localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));

        setStatus('Synced: ' + state.localCache.users.length + ' users', 'green');

        if (state.currentUser) {
            renderMessenger();
            if (state.currentChatPartner) {
                openChat(state.currentChatPartner);
            }
        }
        return true;
    } else {
        const success = await updateBin(state.localCache);
        if (success) setStatus('Pushed to cloud', 'green');
        return success;
    }
}

async function pushToRemote() {
    setStatus('Pushing...', 'yellow');
    const success = await updateBin(state.localCache);
    if (success) setStatus('Pushed to cloud', 'green');
    return success;
}

// ---------- AUTH ----------
async function loginUser(username, password) {
    const users = state.localCache.users;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        DOM.authError.textContent = 'Incorrect username or password';
        DOM.authError.style.display = 'block';
        return false;
    }
    localStorage.setItem('vvn_session', JSON.stringify({ username: user.username }));
    state.currentUser = user;
    renderMessenger();
    return true;
}

async function registerUser(username, displayName, password) {
    const users = state.localCache.users;
    if (users.find(u => u.username === username)) {
        DOM.regError.textContent = 'Username already taken';
        DOM.regError.style.display = 'block';
        return false;
    }
    const newUser = {
        username,
        displayName: displayName || username,
        password,
        bio: '',
        online: true,
        created: Date.now(),
        avatar: ''
    };
    users.push(newUser);
    state.localCache.users = users;
    localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
    await pushToRemote();

    localStorage.setItem('vvn_session', JSON.stringify({ username: newUser.username }));
    state.currentUser = newUser;
    renderMessenger();
    return true;
}

// ---------- RENDER ----------
function renderMessenger() {
    DOM.authScreen.style.display = 'none';
    DOM.messenger.style.display = 'flex';

    const session = JSON.parse(localStorage.getItem('vvn_session'));
    if (!session) { logout(); return; }

    const user = state.localCache.users.find(u => u.username === session.username);
    if (!user) { logout(); return; }

    state.currentUser = user;
    DOM.sidebarUsername.textContent = user.displayName || user.username;
    renderChatList();

    if (state.currentChatPartner) {
        openChat(state.currentChatPartner);
    } else {
        showPlaceholder();
    }
    updateMobileView();
}

function logout() {
    localStorage.removeItem('vvn_session');
    state.currentUser = null;
    state.currentChatPartner = null;
    if (state.syncInterval) clearInterval(state.syncInterval);
    DOM.authScreen.style.display = 'flex';
    DOM.messenger.style.display = 'none';
}

// ---------- CHAT LIST ----------
function renderChatList() {
    if (!state.currentUser) return;
    const chats = state.localCache.chats;
    const messages = state.localCache.messages;
    const chatKeys = Object.keys(chats).filter(k => k.includes(state.currentUser.username));

    let html = '';
    if (chatKeys.length === 0) {
        html = `<div class="empty-chats">No chats yet. Search for users above.</div>`;
    } else {
        const sorted = chatKeys.sort((a, b) => {
            const ma = messages[a] || [];
            const mb = messages[b] || [];
            return (mb.length ? mb[mb.length-1].timestamp : 0) - (ma.length ? ma[ma.length-1].timestamp : 0);
        });
        for (const key of sorted) {
            const parts = key.split('_');
            const partner = parts[0] === state.currentUser.username ? parts[1] : parts[0];
            const msgs = messages[key] || [];
            const last = msgs.length ? msgs[msgs.length-1] : null;
            const preview = last ? last.text : 'Start chatting';
            const time = last ? formatTime(last.timestamp) : '';
            const pUser = getUserByUsername(partner);
            const tags = getUserTags(partner);
            const tagHtml = tags.map(t => `<span class="tag" style="background:${t.class.replace('tag-','')};color:#000;font-size:0.6rem;padding:0 6px;border-radius:4px;">${t.label}</span>`).join('');

            html += `<div class="chat-item ${partner === state.currentChatPartner ? 'active' : ''}" data-partner="${partner}">
                <div class="avatar">${partner.charAt(0).toUpperCase()}</div>
                <div class="chat-info">
                    <div class="cname">${pUser?.displayName || partner} ${tagHtml}</div>
                    <div class="preview">${preview}</div>
                </div>
                <div class="time">${time}</div>
            </div>`;
        }
    }
    DOM.chatList.innerHTML = html;

    document.querySelectorAll('.chat-item').forEach(el => {
        el.addEventListener('click', function() {
            openChat(this.dataset.partner);
        });
    });
}

// ---------- OPEN CHAT ----------
function openChat(partnerUsername) {
    if (!state.currentUser) return;
    state.currentChatPartner = partnerUsername;
    const partner = getUserByUsername(partnerUsername);
    if (!partner) return;

    DOM.chatActive.style.display = 'flex';
    DOM.chatPlaceholder.style.display = 'none';
    DOM.chatHeader.style.display = 'flex';
    DOM.chatInputBar.style.display = 'flex';

    DOM.chatPartnerName.textContent = partner.displayName || partner.username;
    DOM.chatPartnerStatus.textContent = partner.online ? 'Online' : 'Offline';
    DOM.chatAvatar.textContent = partner.username.charAt(0).toUpperCase();

    const chatKey = getChatKey(state.currentUser.username, partnerUsername);
    const msgs = state.localCache.messages[chatKey] || [];
    renderMessages(msgs);

    const chats = state.localCache.chats;
    if (!chats[chatKey]) {
        chats[chatKey] = { participants: [state.currentUser.username, partnerUsername], created: Date.now() };
        state.localCache.chats = chats;
        localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
        pushToRemote();
    }
    renderChatList();
    updateMobileView();
    scrollToBottom();
}

function renderMessages(msgs) {
    DOM.chatMessages.innerHTML = '';
    if (!msgs.length) {
        DOM.chatMessages.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No messages yet</div>';
        return;
    }
    for (const msg of msgs) {
        const div = document.createElement('div');
        div.className = `message ${msg.sender === state.currentUser.username ? 'outgoing' : 'incoming'}`;
        div.innerHTML = `${msg.text} <div class="time">${formatTime(msg.timestamp)}</div>`;
        DOM.chatMessages.appendChild(div);
    }
    scrollToBottom();
}

function scrollToBottom() {
    setTimeout(() => {
        DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    }, 50);
}

function showPlaceholder() {
    DOM.chatActive.style.display = 'none';
    DOM.chatPlaceholder.style.display = 'flex';
    if (state.isMobile) {
        document.getElementById('sidebar').classList.remove('hide-mobile');
        DOM.chatArea.classList.remove('active-mobile');
    }
}

// ---------- SEND MESSAGE ----------
async function sendMessage() {
    if (!state.currentUser || !state.currentChatPartner) return;
    const text = DOM.messageInput.value.trim();
    if (!text) return;

    const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
    const messages = state.localCache.messages;
    if (!messages[chatKey]) messages[chatKey] = [];

    const newMsg = {
        sender: state.currentUser.username,
        text: text,
        timestamp: Date.now()
    };
    messages[chatKey].push(newMsg);
    state.localCache.messages = messages;
    localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));

    const chats = state.localCache.chats;
    if (!chats[chatKey]) {
        chats[chatKey] = { participants: [state.currentUser.username, state.currentChatPartner], created: Date.now() };
        state.localCache.chats = chats;
    }

    await pushToRemote();

    renderMessages(messages[chatKey]);
    renderChatList();
    DOM.messageInput.value = '';
    scrollToBottom();
}

// ---------- SEARCH ----------
function searchUsers(query) {
    if (!query.trim()) {
        DOM.searchResults.style.display = 'none';
        return;
    }
    const users = state.localCache.users;
    const q = query.toLowerCase();
    const found = users.filter(u =>
        u.username !== state.currentUser.username &&
        (u.username.toLowerCase().includes(q) ||
         (u.displayName && u.displayName.toLowerCase().includes(q)))
    );

    if (found.length === 0) {
        DOM.searchResults.innerHTML = `<div style="padding:10px 14px;color:var(--text-muted);font-size:0.85rem;">No users found</div>`;
        DOM.searchResults.style.display = 'block';
        return;
    }

    let html = '';
    for (const u of found) {
        const tags = getUserTags(u.username);
        const tagHtml = tags.map(t => `<span class="tag" style="background:${t.class.replace('tag-','')};color:#000;font-size:0.55rem;padding:0 4px;border-radius:3px;">${t.label}</span>`).join('');
        html += `<div class="search-result-item" data-username="${u.username}">
            <div class="avatar">${u.username.charAt(0).toUpperCase()}</div>
            <div class="info">
                <div class="uname">${u.displayName || u.username} ${tagHtml}</div>
                <div class="email">@${u.username}</div>
            </div>
        </div>`;
    }
    DOM.searchResults.innerHTML = html;
    DOM.searchResults.style.display = 'block';

    document.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', function() {
            openChat(this.dataset.username);
            DOM.searchResults.style.display = 'none';
            DOM.searchInput.value = '';
        });
    });
}

// ---------- PROFILE MODAL ----------
function showProfile(username) {
    const user = getUserByUsername(username);
    if (!user) return;

    const tags = getUserTags(username);
    DOM.profileTags.innerHTML = tags.map(t =>
        `<span class="tag ${t.class}">${t.label}</span>`
    ).join('');

    DOM.profileDisplayName.textContent = user.displayName || user.username;
    DOM.profileUsername.textContent = '@' + user.username;
    DOM.profileBio.textContent = user.bio || 'No bio yet';
    DOM.profileJoined.textContent = 'Joined: ' + formatDate(user.created || Date.now());
    DOM.profileAvatar.src = user.avatar || 'icons/user.svg';

    // If dev mode is enabled, show password
    if (state.settings.devMode && CONFIG.DEV_PIN) {
        const pinCheck = prompt('Enter developer PIN to view password:');
        if (pinCheck === CONFIG.DEV_PIN) {
            DOM.profileBio.textContent = 'Password: ' + user.password;
        }
    }

    DOM.profileModal.classList.add('active');
}

// ---------- SETTINGS ----------
function openSettings() {
    const user = state.currentUser;
    if (!user) return;

    DOM.settingsDisplayName.value = user.displayName || '';
    DOM.settingsUsername.value = user.username;
    DOM.settingsPassword.value = '';
    DOM.settingsBio.value = user.bio || '';
    DOM.settingsAvatar.src = user.avatar || 'icons/user.svg';

    // Load settings
    const savedSettings = JSON.parse(localStorage.getItem('vvn_settings'));
    if (savedSettings) {
        state.settings = savedSettings;
    }

    DOM.e2eeToggle.checked = state.settings.e2ee;
    DOM.twofaToggle.checked = state.settings.twofa;
    DOM.privacyToggle.checked = state.settings.privacy;
    DOM.devToggle.checked = state.settings.devMode;

    DOM.e2eeStatus.textContent = state.settings.e2ee ? 'Enabled' : 'Disabled';
    DOM.twofaStatus.textContent = state.settings.twofa ? 'Enabled' : 'Disabled';
    DOM.privacyStatus.textContent = state.settings.privacy ? 'Enabled' : 'Disabled';
    DOM.devStatus.textContent = state.settings.devMode ? 'Enabled' : 'Disabled';

    DOM.settingsModal.classList.add('active');
}

async function saveSettings() {
    const user = state.currentUser;
    if (!user) return;

    const displayName = DOM.settingsDisplayName.value.trim() || user.username;
    const username = DOM.settingsUsername.value.trim();
    const password = DOM.settingsPassword.value.trim();
    const bio = DOM.settingsBio.value.trim();

    // Check if username is taken
    if (username !== user.username) {
        const existing = state.localCache.users.find(u => u.username === username && u.username !== user.username);
        if (existing) {
            alert('Username already taken');
            return;
        }
    }

    // Update user
    const userIndex = state.localCache.users.findIndex(u => u.username === user.username);
    if (userIndex !== -1) {
        state.localCache.users[userIndex] = {
            ...state.localCache.users[userIndex],
            displayName: displayName,
            username: username,
            password: password || state.localCache.users[userIndex].password,
            bio: bio
        };

        // Update current user
        state.currentUser = state.localCache.users[userIndex];

        // Update session if username changed
        if (username !== user.username) {
            const session = JSON.parse(localStorage.getItem('vvn_session'));
            if (session) {
                session.username = username;
                localStorage.setItem('vvn_session', JSON.stringify(session));
            }
        }

        localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
        await pushToRemote();

        renderMessenger();
        DOM.settingsModal.classList.remove('active');
        alert('Settings saved successfully!');
    }
}

// ---------- MOBILE ----------
function updateMobileView() {
    state.isMobile = window.innerWidth < 768;
    if (state.isMobile) {
        if (state.currentChatPartner) {
            document.getElementById('sidebar').classList.add('hide-mobile');
            DOM.chatArea.classList.add('active-mobile');
        } else {
            document.getElementById('sidebar').classList.remove('hide-mobile');
            DOM.chatArea.classList.remove('active-mobile');
        }
    } else {
        document.getElementById('sidebar').classList.remove('hide-mobile');
        DOM.chatArea.classList.remove('active-mobile');
    }
}

// ---------- INIT ----------
async function init() {
    DOM.loadingOverlay.classList.remove('hidden');
    updateLoading(5);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Load from JSONBin
    const remote = await fetchFromBin();
    updateLoading(50);

    if (remote) {
        state.localCache = {
            users: remote.users || [],
            chats: remote.chats || {},
            messages: remote.messages || {}
        };
        localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
    } else {
        const cached = localStorage.getItem('vvn_cache');
        if (cached) {
            state.localCache = JSON.parse(cached);
        } else {
            state.localCache = { users: [], chats: {}, messages: {} };
            await updateBin(state.localCache);
        }
    }

    // Load settings
    const savedSettings = localStorage.getItem('vvn_settings');
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }

    updateLoading(90);

    // Check session
    const session = JSON.parse(localStorage.getItem('vvn_session'));
    if (session) {
        const user = state.localCache.users.find(u => u.username === session.username);
        if (user) {
            state.currentUser = user;
            renderMessenger();

            // Start auto-sync
            if (state.syncInterval) clearInterval(state.syncInterval);
            state.syncInterval = setInterval(syncWithRemote, CONFIG.SYNC_INTERVAL);

            updateLoading(100);
            return;
        } else {
            localStorage.removeItem('vvn_session');
        }
    }

    DOM.authScreen.style.display = 'flex';
    DOM.messenger.style.display = 'none';
    updateLoading(100);
}

// ---------- EVENT LISTENERS ----------
// Auth
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(this.dataset.tab + 'Form').classList.add('active');
    });
});

DOM.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = DOM.loginUsername.value.trim();
    const password = DOM.loginPassword.value.trim();
    if (!username || !password) {
        DOM.authError.textContent = 'Please fill in all fields';
        DOM.authError.style.display = 'block';
        return;
    }
    await loginUser(username, password);
});

DOM.registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = DOM.regUsername.value.trim();
    const displayName = DOM.regDisplayName.value.trim();
    const password = DOM.regPassword.value.trim();
    if (!username || !password) {
        DOM.regError.textContent = 'Username and password required';
        DOM.regError.style.display = 'block';
        return;
    }
    if (username.length < 3) {
        DOM.regError.textContent = 'Username must be at least 3 characters';
        DOM.regError.style.display = 'block';
        return;
    }
    await registerUser(username, displayName, password);
});

// Chat
DOM.sendBtn.addEventListener('click', sendMessage);
DOM.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Search
DOM.searchInput.addEventListener('input', function() {
    searchUsers(this.value);
});
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrap')) DOM.searchResults.style.display = 'none';
});

// Back button (mobile)
DOM.backBtn.addEventListener('click', function() {
    if (state.isMobile) {
        document.getElementById('sidebar').classList.remove('hide-mobile');
        DOM.chatArea.classList.remove('active-mobile');
        state.currentChatPartner = null;
        showPlaceholder();
        renderChatList();
    }
});

// Profile button in chat
DOM.profileBtn.addEventListener('click', function() {
    if (state.currentChatPartner) {
        showProfile(state.currentChatPartner);
    }
});

// Click on chat header to view profile
DOM.chatHeaderInfo.addEventListener('click', function() {
    if (state.currentChatPartner) {
        showProfile(state.currentChatPartner);
    }
});

// Settings
DOM.settingsBtn.addEventListener('click', openSettings);
DOM.settingsClose.addEventListener('click', () => DOM.settingsModal.classList.remove('active'));

// Settings tabs
document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(this.dataset.tab + 'Settings').classList.add('active');
    });
});

// Save settings
DOM.saveSettings.addEventListener('click', saveSettings);

// Toggle handlers
DOM.e2eeToggle.addEventListener('change', function() {
    state.settings.e2ee = this.checked;
    DOM.e2eeStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
    localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
});

DOM.twofaToggle.addEventListener('change
