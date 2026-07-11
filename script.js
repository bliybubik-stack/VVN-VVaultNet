// VVN Messenger - Main Application

(function() {
    'use strict';

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
            devMode: false,
            lastSeen: true,
            readReceipts: true,
            typingIndicators: true
        },
        loadingComplete: false,
        currentTheme: 'dark'
    };

    // Get CONFIG from window
    const CONFIG = window.CONFIG || {
        BIN_ID: '6a5222dbda38895dfe4ef18e',
        MASTER_KEY: '$2a$10$xpnzNbyjOgRS6s..YVAMhOqwuj/FOPnU15M2J9uSwHBsRJAygi1Lu',
        OWNERS: ['vaultnet', 'vvnters'],
        DEVS: ['vaultnet', 'vvnters'],
        ADMINS: ['vaultnet'],
        MODS: ['vaultnet'],
        STAFF: ['vaultnet', 'vvnters'],
        DEV_PIN: '2356-23543-13451-78901-23456',
        SYNC_INTERVAL: 5000
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
        profileAvatar: document.getElementById('profileAvatar'),
        profileDisplayName: document.getElementById('profileDisplayName'),
        profileUsername: document.getElementById('profileUsername'),
        profileBio: document.getElementById('profileBio'),
        profileJoined: document.getElementById('profileJoined'),
        profileAge: document.getElementById('profileAge'),
        profileTags: document.getElementById('profileTags'),
        profilePassword: document.getElementById('profilePassword'),
        profileUserID: document.getElementById('profileUserID'),
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
        lastSeenToggle: document.getElementById('lastSeenToggle'),
        readReceiptsToggle: document.getElementById('readReceiptsToggle'),
        typingIndicatorsToggle: document.getElementById('typingIndicatorsToggle'),
        e2eeStatus: document.getElementById('e2eeStatus'),
        twofaStatus: document.getElementById('twofaStatus'),
        privacyStatus: document.getElementById('privacyStatus'),
        devStatus: document.getElementById('devStatus'),
        lastSeenStatus: document.getElementById('lastSeenStatus'),
        readReceiptsStatus: document.getElementById('readReceiptsStatus'),
        typingIndicatorsStatus: document.getElementById('typingIndicatorsStatus'),
        chatAvatar: document.getElementById('chatAvatar'),
        chatHeaderInfo: document.getElementById('chatHeaderInfo'),
        selectBtn: document.getElementById('selectBtn'),
        userSettingsBtn: document.getElementById('userSettingsBtn'),
        chatSettingsBtn: document.getElementById('chatSettingsBtn'),
        selectionToolbar: document.getElementById('selectionToolbar'),
        selectedCount: document.getElementById('selectedCount'),
        deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
        pinSelectedBtn: document.getElementById('pinSelectedBtn'),
        cancelSelectionBtn: document.getElementById('cancelSelectionBtn'),
        pinnedDock: document.getElementById('pinnedDock'),
        pinnedMessagePreview: document.getElementById('pinnedMessagePreview'),
        unpinBtn: document.getElementById('unpinBtn'),
        deleteModal: document.getElementById('deleteModal'),
        deleteModalClose: document.getElementById('deleteModalClose'),
        deleteForMeBtn: document.getElementById('deleteForMeBtn'),
        deleteForEveryoneBtn: document.getElementById('deleteForEveryoneBtn'),
        userSettingsModal: document.getElementById('userSettingsModal'),
        userSettingsClose: document.getElementById('userSettingsClose'),
        renameContactBtn: document.getElementById('renameContactBtn'),
        deleteContactBtn: document.getElementById('deleteContactBtn'),
        blockUserBtn: document.getElementById('blockUserBtn'),
        unblockUserBtn: document.getElementById('unblockUserBtn'),
        pinContactBtn: document.getElementById('pinContactBtn'),
        chatSettingsModal: document.getElementById('chatSettingsModal'),
        chatSettingsClose: document.getElementById('chatSettingsClose'),
        bgDefault: document.getElementById('bgDefault'),
        bgCustom: document.getElementById('bgCustom'),
        bgUpload: document.getElementById('bgUpload'),
        createNoteBtn: document.getElementById('createNoteBtn'),
        clipBtn: document.getElementById('clipBtn'),
        fileModal: document.getElementById('fileModal'),
        fileModalClose: document.getElementById('fileModalClose'),
        fileSelectBtn: document.getElementById('fileSelectBtn'),
        fileInput: document.getElementById('fileInput'),
        filePreviewImage: document.getElementById('filePreviewImage'),
        filePreviewVideo: document.getElementById('filePreviewVideo'),
        fileCaption: document.getElementById('fileCaption'),
        fileSendBtn: document.getElementById('fileSendBtn'),
        themeModal: document.getElementById('themeModal'),
        themeModalClose: document.getElementById('themeModalClose'),
        themeBtn: document.getElementById('themeBtn'),
        primaryColor: document.getElementById('primaryColor'),
        secondaryColor: document.getElementById('secondaryColor'),
        textColor: document.getElementById('textColor'),
        applyCustomTheme: document.getElementById('applyCustomTheme')
    };

    // ---------- NEW STATE VARIABLES ----------
    let selectionMode = false;
    let selectedMessages = new Set();
    let pinnedMessages = {};
    let contactCustomNames = {};
    let blockedUsers = [];
    let chatSettings = {
        bubbleStyle: 'rounded',
        background: 'default',
        bgImage: null
    };
    let pendingFile = null;
    let pendingFileType = null;

    // ---------- THEME CONFIGURATIONS ----------
    const THEMES = {
        dark: {
            name: 'Dark',
            desc: 'Classic dark theme for night use',
            vars: {
                '--bg-primary': '#0a0a0a',
                '--bg-secondary': '#141414',
                '--bg-tertiary': '#1a1a1a',
                '--bg-card': '#1e1e1e',
                '--text-primary': '#f0f0f0',
                '--text-secondary': '#999',
                '--dark-purple': '#2d1b69',
                '--message-outgoing': '#2d1b69',
                '--message-incoming': '#1a1a1a'
            }
        },
        light: {
            name: 'Light',
            desc: 'Clean light theme for daytime use',
            vars: {
                '--bg-primary': '#f5f5f5',
                '--bg-secondary': '#ffffff',
                '--bg-tertiary': '#f0f0f0',
                '--bg-card': '#ffffff',
                '--text-primary': '#1a1a1a',
                '--text-secondary': '#666',
                '--dark-purple': '#4a2b8a',
                '--message-outgoing': '#4a2b8a',
                '--message-incoming': '#e8e8e8'
            }
        },
        ocean: {
            name: 'Ocean',
            desc: 'Deep blue ocean vibes',
            vars: {
                '--bg-primary': '#0a1628',
                '--bg-secondary': '#0f1f3a',
                '--bg-tertiary': '#142a4a',
                '--bg-card': '#1a3555',
                '--text-primary': '#d0e8ff',
                '--text-secondary': '#8ab4d6',
                '--dark-purple': '#1a4a6b',
                '--message-outgoing': '#1a4a6b',
                '--message-incoming': '#0f2a45'
            }
        },
        forest: {
            name: 'Forest',
            desc: 'Natural green forest theme',
            vars: {
                '--bg-primary': '#0a1a0a',
                '--bg-secondary': '#0f2a0f',
                '--bg-tertiary': '#143a14',
                '--bg-card': '#1a4a1a',
                '--text-primary': '#d0ffd0',
                '--text-secondary': '#8ab48a',
                '--dark-purple': '#1a4a2a',
                '--message-outgoing': '#1a4a2a',
                '--message-incoming': '#0f2a15'
            }
        },
        sunset: {
            name: 'Sunset',
            desc: 'Warm sunset colors',
            vars: {
                '--bg-primary': '#1a0a1a',
                '--bg-secondary': '#2a102a',
                '--bg-tertiary': '#3a1a3a',
                '--bg-card': '#4a2a4a',
                '--text-primary': '#ffd0d0',
                '--text-secondary': '#d68a8a',
                '--dark-purple': '#6b2a4a',
                '--message-outgoing': '#6b2a4a',
                '--message-incoming': '#3a1a2a'
            }
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

    function getAge(ts) {
        const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
        if (days < 1) return 'Today';
        if (days === 1) return '1 day';
        return days + ' days';
    }

    function getUserTags(username) {
        const tags = [];
        if (CONFIG.OWNERS && CONFIG.OWNERS.includes(username)) tags.push({ label: 'OWNER', class: 'tag-owner' });
        if (CONFIG.DEVS && CONFIG.DEVS.includes(username)) tags.push({ label: 'DEV', class: 'tag-dev' });
        if (CONFIG.ADMINS && CONFIG.ADMINS.includes(username)) tags.push({ label: 'ADMIN', class: 'tag-admin' });
        if (CONFIG.MODS && CONFIG.MODS.includes(username)) tags.push({ label: 'MOD', class: 'tag-mod' });
        if (CONFIG.STAFF && CONFIG.STAFF.includes(username)) tags.push({ label: 'STAFF', class: 'tag-staff' });
        if (tags.length === 0) {
            const user = getUserByUsername(username);
            if (user && user.created) {
                const age = Date.now() - user.created;
                if (age > 30 * 24 * 60 * 60 * 1000) {
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

    function getDisplayName(username) {
        if (contactCustomNames[username]) return contactCustomNames[username];
        const user = getUserByUsername(username);
        return user ? user.displayName || username : username;
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
        if (DOM.loaderFill) {
            DOM.loaderFill.style.width = p + '%';
        }
        if (p >= 100 && !state.loadingComplete) {
            state.loadingComplete = true;
            setTimeout(() => {
                if (DOM.loadingOverlay) {
                    DOM.loadingOverlay.classList.add('hidden');
                }
            }, 300);
        }
    }

    // ---------- STATUS BAR ----------
    function setStatus(text, color) {
        if (DOM.syncStatus) {
            DOM.syncStatus.textContent = text;
        }
        if (DOM.syncDot) {
            DOM.syncDot.className = 'status-dot ' + color;
        }
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
                console.warn('HTTP Error:', resp.status);
                setStatus('Using cache', 'yellow');
                return null;
            }
            const data = await resp.json();
            setStatus('Connected', 'green');
            return data;
        } catch (e) {
            console.warn('Fetch error, using cache:', e.message);
            setStatus('Offline mode', 'yellow');
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
                console.warn('Save error:', resp.status);
                setStatus('Save failed', 'red');
                return false;
            }
            setStatus('Saved', 'green');
            return true;
        } catch (e) {
            console.warn('Save error:', e.message);
            setStatus('Offline', 'yellow');
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
                                sendNotification(partner, msg.text || '📎 File', formatTime(msg.timestamp));
                            }
                        }
                    }
                    localMessages[key] = msgs;
                }
            }

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
            setStatus('Offline mode', 'yellow');
            return true;
        }
    }

    async function pushToRemote() {
        setStatus('Pushing...', 'yellow');
        const success = await updateBin(state.localCache);
        if (success) setStatus('Pushed to cloud', 'green');
        return success;
    }

    // ---------- THEME FUNCTIONS ----------
    function applyTheme(themeName) {
        state.currentTheme = themeName;
        const theme = THEMES[themeName];
        if (!theme) return;

        const root = document.documentElement;
        for (const [key, value] of Object.entries(theme.vars)) {
            root.style.setProperty(key, value);
        }

        // Update theme options UI
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        localStorage.setItem('vvn_theme', themeName);
        
        // Update preview in settings if visible
        if (DOM.settingsModal && DOM.settingsModal.classList.contains('active')) {
            updateThemePreview(themeName);
        }
    }

    function updateThemePreview(themeName) {
        const previews = document.querySelectorAll('.theme-preview');
        previews.forEach(el => {
            el.className = 'theme-preview';
            if (el.dataset.theme === themeName) {
                el.classList.add(themeName);
            }
        });
    }

    function applyCustomTheme() {
        const primary = document.getElementById('primaryColor')?.value || '#2d1b69';
        const secondary = document.getElementById('secondaryColor')?.value || '#141414';
        const text = document.getElementById('textColor')?.value || '#f0f0f0';
        
        const root = document.documentElement;
        root.style.setProperty('--dark-purple', primary);
        root.style.setProperty('--bg-secondary', secondary);
        root.style.setProperty('--text-primary', text);
        root.style.setProperty('--message-outgoing', primary);
        
        localStorage.setItem('vvn_custom_theme', JSON.stringify({ primary, secondary, text }));
        state.currentTheme = 'custom';
    }

    // ---------- AUTH ----------
    async function loginUser(username, password) {
        const users = state.localCache.users;
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            if (DOM.authError) {
                DOM.authError.textContent = 'Incorrect username or password';
                DOM.authError.style.display = 'block';
            }
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
            if (DOM.regError) {
                DOM.regError.textContent = 'Username already taken';
                DOM.regError.style.display = 'block';
            }
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
        if (DOM.authScreen) DOM.authScreen.style.display = 'none';
        if (DOM.messenger) DOM.messenger.style.display = 'flex';

        const session = JSON.parse(localStorage.getItem('vvn_session'));
        if (!session) { logout(); return; }

        const user = state.localCache.users.find(u => u.username === session.username);
        if (!user) { logout(); return; }

        state.currentUser = user;
        if (DOM.sidebarUsername) {
            DOM.sidebarUsername.textContent = user.displayName || user.username;
        }
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
        if (DOM.authScreen) DOM.authScreen.style.display = 'flex';
        if (DOM.messenger) DOM.messenger.style.display = 'none';
    }

    // ---------- CHAT LIST ----------
    function renderChatList() {
        if (!state.currentUser || !DOM.chatList) return;
        const chats = state.localCache.chats;
        const messages = state.localCache.messages;
        let chatKeys = Object.keys(chats).filter(k => k.includes(state.currentUser.username));

        blockedUsers = JSON.parse(localStorage.getItem('vvn_blocked') || '[]');
        chatKeys = chatKeys.filter(k => {
            const parts = k.split('_');
            const partner = parts[0] === state.currentUser.username ? parts[1] : parts[0];
            return !blockedUsers.includes(partner);
        });

        const pinnedContacts = JSON.parse(localStorage.getItem('vvn_pinned_contacts') || '[]');

        let html = '';
        if (chatKeys.length === 0) {
            html = `<div class="empty-chats">No chats yet. Search for users above.</div>`;
        } else {
            const sorted = chatKeys.sort((a, b) => {
                const partsA = a.split('_');
                const partsB = b.split('_');
                const partnerA = partsA[0] === state.currentUser.username ? partsA[1] : partsA[0];
                const partnerB = partsB[0] === state.currentUser.username ? partsB[1] : partsB[0];
                const isPinnedA = pinnedContacts.includes(partnerA);
                const isPinnedB = pinnedContacts.includes(partnerB);
                
                if (isPinnedA && !isPinnedB) return -1;
                if (!isPinnedA && isPinnedB) return 1;
                
                const ma = messages[a] || [];
                const mb = messages[b] || [];
                return (mb.length ? mb[mb.length-1].timestamp : 0) - (ma.length ? ma[ma.length-1].timestamp : 0);
            });
            
            for (const key of sorted) {
                const parts = key.split('_');
                const partner = parts[0] === state.currentUser.username ? parts[1] : parts[0];
                const msgs = messages[key] || [];
                const last = msgs.length ? msgs[msgs.length-1] : null;
                const preview = last ? (last.text || '📎 File') : 'Start chatting';
                const time = last ? formatTime(last.timestamp) : '';
                const pUser = getUserByUsername(partner);
                const tags = getUserTags(partner);
                const tagHtml = tags.map(t => `<span class="tag">${t.label}</span>`).join('');
                const isPinned = pinnedContacts.includes(partner);
                const displayName = getDisplayName(partner);

                html += `<div class="chat-item ${partner === state.currentChatPartner ? 'active' : ''}" data-partner="${partner}">
                    <div class="avatar">${partner.charAt(0).toUpperCase()}</div>
                    <div class="chat-info">
                        <div class="cname">${displayName} ${tagHtml} ${isPinned ? '📌' : ''}</div>
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
        
        if (blockedUsers.includes(partnerUsername)) {
            alert('This user is blocked. Unblock them to chat.');
            return;
        }
        
        state.currentChatPartner = partnerUsername;
        const partner = getUserByUsername(partnerUsername);
        if (!partner) return;

        if (DOM.chatActive) DOM.chatActive.style.display = 'flex';
        if (DOM.chatPlaceholder) DOM.chatPlaceholder.style.display = 'none';
        if (DOM.chatHeader) DOM.chatHeader.style.display = 'flex';
        if (DOM.chatInputBar) DOM.chatInputBar.style.display = 'flex';

        const displayName = getDisplayName(partnerUsername);
        if (DOM.chatPartnerName) DOM.chatPartnerName.textContent = displayName;
        if (DOM.chatPartnerStatus) DOM.chatPartnerStatus.textContent = partner.online ? 'Online' : 'Offline';
        if (DOM.chatAvatar) DOM.chatAvatar.textContent = partner.username.charAt(0).toUpperCase();

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
        
        const pinned = pinnedMessages[chatKey] || [];
        if (pinned.length > 0) {
            showPinnedDock(chatKey);
        } else {
            DOM.pinnedDock.style.display = 'none';
        }
        
        if (DOM.blockUserBtn && DOM.unblockUserBtn) {
            if (blockedUsers.includes(partnerUsername)) {
                DOM.blockUserBtn.style.display = 'none';
                DOM.unblockUserBtn.style.display = 'inline-flex';
            } else {
                DOM.blockUserBtn.style.display = 'inline-flex';
                DOM.unblockUserBtn.style.display = 'none';
            }
        }
        
        applyChatBackground();
        renderChatList();
        updateMobileView();
        scrollToBottom();
        clearSelection();
    }

    function renderMessages(msgs) {
        if (!DOM.chatMessages) return;
        DOM.chatMessages.innerHTML = '';
        if (!msgs.length) {
            DOM.chatMessages.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No messages yet</div>';
            return;
        }
        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
            const msgId = `${msg.timestamp}-${i}`;
            const div = document.createElement('div');
            const isOutgoing = msg.sender === state.currentUser.username;
            div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'} bubble-${chatSettings.bubbleStyle}`;
            div.dataset.msgId = msgId;
            
            let content = '';
            if (msg.file) {
                content += `<div class="file-content">`;
                if (msg.file.type === 'image') {
                    content += `<img src="${msg.file.data}" alt="Image" />`;
                } else if (msg.file.type === 'video') {
                    content += `<video controls><source src="${msg.file.data}" /></video>`;
                }
                content += `</div>`;
                if (msg.file.caption) {
                    content += `<div class="file-caption">${msg.file.caption}</div>`;
                }
            } else {
                content = msg.text || '';
            }
            
            div.innerHTML = `
                <div class="selection-circle"></div>
                ${content}
                <div class="time">${formatTime(msg.timestamp)}</div>
            `;
            DOM.chatMessages.appendChild(div);
        }
        scrollToBottom();
    }

    function scrollToBottom() {
        setTimeout(() => {
            if (DOM.chatMessages) {
                DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
            }
        }, 50);
    }

    function showPlaceholder() {
        if (DOM.chatActive) DOM.chatActive.style.display = 'none';
        if (DOM.chatPlaceholder) DOM.chatPlaceholder.style.display = 'flex';
        if (state.isMobile) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('hide-mobile');
            if (DOM.chatArea) DOM.chatArea.classList.remove('active-mobile');
        }
    }

    // ---------- SEND MESSAGE ----------
    async function sendMessage() {
        if (!state.currentUser || !state.currentChatPartner) return;
        if (!DOM.messageInput) return;
        const text = DOM.messageInput.value.trim();
        if (!text && !pendingFile) return;

        const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
        const messages = state.localCache.messages;
        if (!messages[chatKey]) messages[chatKey] = [];

        const newMsg = {
            sender: state.currentUser.username,
            timestamp: Date.now()
        };

        if (pendingFile) {
            newMsg.file = {
                type: pendingFileType,
                data: pendingFile,
                caption: DOM.fileCaption ? DOM.fileCaption.value.trim() : ''
            };
            pendingFile = null;
            pendingFileType = null;
            DOM.fileModal.classList.remove('active');
            if (DOM.fileCaption) DOM.fileCaption.value = '';
            if (DOM.filePreviewImage) DOM.filePreviewImage.src = 'icons/image-placeholder.png';
            if (DOM.filePreviewVideo) DOM.filePreviewVideo.style.display = 'none';
        } else {
            newMsg.text = text;
        }

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
        if (DOM.messageInput) DOM.messageInput.value = '';
        scrollToBottom();
    }

    // ---------- SEARCH ----------
    function searchUsers(query) {
        if (!query.trim() || !DOM.searchResults) {
            DOM.searchResults.style.display = 'none';
            return;
        }
        const users = state.localCache.users;
        const q = query.toLowerCase();
        const found = users.filter(u =>
            u.username !== state.currentUser.username &&
            !blockedUsers.includes(u.username) &&
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
            const tagHtml = tags.map(t => `<span class="tag" style="font-size:0.55rem;padding:0 4px;border-radius:3px;">${t.label}</span>`).join('');
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
                if (DOM.searchInput) DOM.searchInput.value = '';
            });
        });
    }

    // ---------- PROFILE MODAL ----------
    function showProfile(username) {
        const user = getUserByUsername(username);
        if (!user) return;

        const tags = getUserTags(username);
        if (DOM.profileTags) {
            DOM.profileTags.innerHTML = tags.map(t =>
                `<span class="tag ${t.class}">${t.label}</span>`
            ).join('');
        }

        if (DOM.profileDisplayName) DOM.profileDisplayName.textContent = user.displayName || user.username;
        if (DOM.profileUsername) DOM.profileUsername.textContent = '@' + user.username;
        if (DOM.profileBio) DOM.profileBio.textContent = user.bio || 'No bio yet';
        if (DOM.profileJoined) DOM.profileJoined.textContent = 'Joined: ' + formatDate(user.created || Date.now());
        if (DOM.profileAge) DOM.profileAge.textContent = 'Age: ' + getAge(user.created || Date.now());
        if (DOM.profileAvatar) DOM.profileAvatar.src = user.avatar || 'icons/user.png';
        if (DOM.profileUserID) DOM.profileUserID.textContent = 'ID: ' + user.username + '-' + (user.created || '').toString().slice(-6);

        if (state.settings.devMode && CONFIG.DEV_PIN) {
            const pinCheck = prompt('Enter developer PIN to view password:');
            if (pinCheck === CONFIG.DEV_PIN && DOM.profilePassword) {
                DOM.profilePassword.style.display = 'block';
                DOM.profilePassword.textContent = 'Password: ' + user.password;
            }
        } else if (DOM.profilePassword) {
            DOM.profilePassword.style.display = 'none';
        }

        if (DOM.profileModal) DOM.profileModal.classList.add('active');
    }

    // ---------- SETTINGS ----------
    function openSettings() {
        const user = state.currentUser;
        if (!user) return;

        if (DOM.settingsDisplayName) DOM.settingsDisplayName.value = user.displayName || '';
        if (DOM.settingsUsername) DOM.settingsUsername.value = user.username;
        if (DOM.settingsPassword) DOM.settingsPassword.value = '';
        if (DOM.settingsBio) DOM.settingsBio.value = user.bio || '';
        if (DOM.settingsAvatar) DOM.settingsAvatar.src = user.avatar || 'icons/user.png';

        const savedSettings = localStorage.getItem('vvn_settings');
        if (savedSettings) {
            state.settings = JSON.parse(savedSettings);
        }

        if (DOM.e2eeToggle) DOM.e2eeToggle.checked = state.settings.e2ee;
        if (DOM.twofaToggle) DOM.twofaToggle.checked = state.settings.twofa;
        if (DOM.privacyToggle) DOM.privacyToggle.checked = state.settings.privacy;
        if (DOM.devToggle) DOM.devToggle.checked = state.settings.devMode;
        if (DOM.lastSeenToggle) DOM.lastSeenToggle.checked = state.settings.lastSeen !== undefined ? state.settings.lastSeen : true;
        if (DOM.readReceiptsToggle) DOM.readReceiptsToggle.checked = state.settings.readReceipts !== undefined ? state.settings.readReceipts : true;
        if (DOM.typingIndicatorsToggle) DOM.typingIndicatorsToggle.checked = state.settings.typingIndicators !== undefined ? state.settings.typingIndicators : true;

        if (DOM.e2eeStatus) DOM.e2eeStatus.textContent = state.settings.e2ee ? 'Enabled' : 'Disabled';
        if (DOM.twofaStatus) DOM.twofaStatus.textContent = state.settings.twofa ? 'Enabled' : 'Disabled';
        if (DOM.privacyStatus) DOM.privacyStatus.textContent = state.settings.privacy ? 'Enabled' : 'Disabled';
        if (DOM.devStatus) DOM.devStatus.textContent = state.settings.devMode ? 'Enabled' : 'Disabled';
        if (DOM.lastSeenStatus) DOM.lastSeenStatus.textContent = state.settings.lastSeen !== undefined ? (state.settings.lastSeen ? 'Enabled' : 'Disabled') : 'Enabled';
        if (DOM.readReceiptsStatus) DOM.readReceiptsStatus.textContent = state.settings.readReceipts !== undefined ? (state.settings.readReceipts ? 'Enabled' : 'Disabled') : 'Enabled';
        if (DOM.typingIndicatorsStatus) DOM.typingIndicatorsStatus.textContent = state.settings.typingIndicators !== undefined ? (state.settings.typingIndicators ? 'Enabled' : 'Disabled') : 'Enabled';

        // Update theme preview
        updateThemePreview(state.currentTheme);

        if (DOM.settingsModal) DOM.settingsModal.classList.add('active');
    }

    async function saveSettings() {
        const user = state.currentUser;
        if (!user) return;

        const displayName = DOM.settingsDisplayName ? DOM.settingsDisplayName.value.trim() || user.username : user.username;
        const username = DOM.settingsUsername ? DOM.settingsUsername.value.trim() : user.username;
        const password = DOM.settingsPassword ? DOM.settingsPassword.value.trim() : '';
        const bio = DOM.settingsBio ? DOM.settingsBio.value.trim() : '';

        if (username !== user.username) {
            const existing = state.localCache.users.find(u => u.username === username && u.username !== user.username);
            if (existing) {
                alert('Username already taken');
                return;
            }
        }

        const userIndex = state.localCache.users.findIndex(u => u.username === user.username);
        if (userIndex !== -1) {
            state.localCache.users[userIndex] = {
                ...state.localCache.users[userIndex],
                displayName: displayName,
                username: username,
                password: password || state.localCache.users[userIndex].password,
                bio: bio
            };

            state.currentUser = state.localCache.users[userIndex];

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
            if (DOM.settingsModal) DOM.settingsModal.classList.remove('active');
            alert('Settings saved successfully!');
        }
    }

    // ---------- SELECTION FUNCTIONS ----------
    function toggleSelectionMode() {
        selectionMode = !selectionMode;
        if (selectionMode) {
            if (DOM.selectBtn) DOM.selectBtn.classList.add('active');
            document.querySelectorAll('.message').forEach(msg => {
                msg.classList.add('selectable');
            });
            if (DOM.selectionToolbar) DOM.selectionToolbar.classList.add('active');
        } else {
            clearSelection();
            if (DOM.selectBtn) DOM.selectBtn.classList.remove('active');
            document.querySelectorAll('.message').forEach(msg => {
                msg.classList.remove('selectable');
            });
            if (DOM.selectionToolbar) DOM.selectionToolbar.classList.remove('active');
        }
    }

    function toggleMessageSelection(messageId) {
        if (!selectionMode) return;
        const msgElement = document.querySelector(`[data-msg-id="${messageId}"]`);
        if (!msgElement) return;
        
        if (selectedMessages.has(messageId)) {
            selectedMessages.delete(messageId);
            msgElement.classList.remove('selected');
        } else {
            selectedMessages.add(messageId);
            msgElement.classList.add('selected');
        }
        updateSelectedCount();
    }

    function clearSelection() {
        selectedMessages.clear();
        document.querySelectorAll('.message.selected').forEach(el => {
            el.classList.remove('selected');
        });
        updateSelectedCount();
        selectionMode = false;
        if (DOM.selectBtn) DOM.selectBtn.classList.remove('active');
        document.querySelectorAll('.message').forEach(msg => {
            msg.classList.remove('selectable');
        });
        if (DOM.selectionToolbar) DOM.selectionToolbar.classList.remove('active');
    }

    function updateSelectedCount() {
        if (DOM.selectedCount) {
            DOM.selectedCount.textContent = selectedMessages.size + ' selected';
        }
    }

    // ---------- DELETE FUNCTIONS ----------
    function showDeleteModal() {
        if (selectedMessages.size === 0) return;
        if (DOM.deleteModal) DOM.deleteModal.classList.add('active');
    }

    function deleteMessages(forEveryone = false) {
        const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
        const messages = state.localCache.messages[chatKey] || [];
        
        const remaining = messages.filter((msg, index) => {
            const msgId = `${msg.timestamp}-${index}`;
            return !selectedMessages.has(msgId);
        });
        
        state.localCache.messages[chatKey] = remaining;
        localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
        pushToRemote();
        
        clearSelection();
        if (DOM.deleteModal) DOM.deleteModal.classList.remove('active');
        renderMessages(remaining);
        renderChatList();
    }

    // ---------- PIN FUNCTIONS ----------
    function pinSelectedMessages() {
        if (selectedMessages.size === 0) return;
        const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
        const messages = state.localCache.messages[chatKey] || [];
        
        const firstSelected = Array.from(selectedMessages)[0];
        const parts = firstSelected.split('-');
        const timestamp = parseInt(parts[0]);
        const index = parseInt(parts[1]);
        
        const msg = messages.find((m, i) => m.timestamp === timestamp && i === index);
        if (msg) {
            if (!pinnedMessages[chatKey]) pinnedMessages[chatKey] = [];
            pinnedMessages[chatKey].push(msg);
            showPinnedDock(chatKey);
            localStorage.setItem('vvn_pinned', JSON.stringify(pinnedMessages));
        }
        clearSelection();
    }

    function showPinnedDock(chatKey) {
        const pinned = pinnedMessages[chatKey] || [];
        if (pinned.length === 0 || !DOM.pinnedDock) {
            DOM.pinnedDock.style.display = 'none';
            return;
        }
        DOM.pinnedDock.style.display = 'block';
        const lastPinned = pinned[pinned.length - 1];
        if (DOM.pinnedMessagePreview) {
            DOM.pinnedMessagePreview.textContent = 
                `${getDisplayName(lastPinned.sender)}: ${lastPinned.text || '📎 File'}`;
        }
    }

    function unpinMessage(chatKey) {
        if (pinnedMessages[chatKey]) {
            pinnedMessages[chatKey].pop();
            if (pinnedMessages[chatKey].length === 0) {
                delete pinnedMessages[chatKey];
                if (DOM.pinnedDock) DOM.pinnedDock.style.display = 'none';
            } else {
                showPinnedDock(chatKey);
            }
            localStorage.setItem('vvn_pinned', JSON.stringify(pinnedMessages));
        }
    }

    function scrollToPinnedMessage() {
        document.querySelectorAll('.message').forEach(el => {
            el.classList.remove('highlight');
        });
        const firstMsg = document.querySelector('.message');
        if (firstMsg) {
            firstMsg.classList.add('highlight');
            firstMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                firstMsg.classList.remove('highlight');
            }, 2000);
        }
    }

    // ---------- USER SETTINGS FUNCTIONS ----------
    function openUserSettings() {
        if (DOM.userSettingsModal) DOM.userSettingsModal.classList.add('active');
    }

    function renameContact() {
        const newName = prompt('Enter new name for this contact:', 
            contactCustomNames[state.currentChatPartner] || state.currentChatPartner);
        if (newName && newName.trim()) {
            contactCustomNames[state.currentChatPartner] = newName.trim();
            localStorage.setItem('vvn_contact_names', JSON.stringify(contactCustomNames));
            renderChatList();
            if (DOM.chatPartnerName) {
                DOM.chatPartnerName.textContent = newName.trim();
            }
        }
    }

    function deleteContact() {
        if (confirm(`Delete contact ${state.currentChatPartner}? This will remove the chat from your list.`)) {
            const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
            delete state.localCache.chats[chatKey];
            localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
            pushToRemote();
            state.currentChatPartner = null;
            showPlaceholder();
            renderChatList();
            if (DOM.userSettingsModal) DOM.userSettingsModal.classList.remove('active');
        }
    }

    function blockUser() {
        if (confirm(`Block ${state.currentChatPartner}? You won't receive messages from them.`)) {
            if (!blockedUsers.includes(state.currentChatPartner)) {
                blockedUsers.push(state.currentChatPartner);
                localStorage.setItem('vvn_blocked', JSON.stringify(blockedUsers));
                if (DOM.blockUserBtn) DOM.blockUserBtn.style.display = 'none';
                if (DOM.unblockUserBtn) DOM.unblockUserBtn.style.display = 'inline-flex';
            }
        }
    }

    function unblockUser() {
        const index = blockedUsers.indexOf(state.currentChatPartner);
        if (index > -1) {
            blockedUsers.splice(index, 1);
            localStorage.setItem('vvn_blocked', JSON.stringify(blockedUsers));
            if (DOM.blockUserBtn) DOM.blockUserBtn.style.display = 'inline-flex';
            if (DOM.unblockUserBtn) DOM.unblockUserBtn.style.display = 'none';
        }
    }

    function pinContact() {
        const pinnedContacts = JSON.parse(localStorage.getItem('vvn_pinned_contacts') || '[]');
        if (!pinnedContacts.includes(state.currentChatPartner)) {
            pinnedContacts.unshift(state.currentChatPartner);
            localStorage.setItem('vvn_pinned_contacts', JSON.stringify(pinnedContacts));
            renderChatList();
        }
    }

    // ---------- CHAT SETTINGS FUNCTIONS ----------
    function openChatSettings() {
        if (DOM.chatSettingsModal) DOM.chatSettingsModal.classList.add('active');
    }

    function changeBubbleStyle(style) {
        chatSettings.bubbleStyle = style;
        localStorage.setItem('vvn_chat_settings', JSON.stringify(chatSettings));
        document.querySelectorAll('.message').forEach(msg => {
            msg.className = msg.className.replace(/bubble-\w+/g, '');
            msg.classList.add('bubble-' + style);
        });
        document.querySelectorAll('.bubble-style').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.style === style) btn.classList.add('active');
        });
    }

    function changeChatBackground(type) {
        if (type === 'custom') {
            if (DOM.bgUpload) DOM.bgUpload.click();
        } else {
            chatSettings.background = type;
            chatSettings.bgImage = null;
            if (DOM.chatMessages) {
                DOM.chatMessages.style.background = '';
                DOM.chatMessages.style.backgroundImage = '';
            }
            localStorage.setItem('vvn_chat_settings', JSON.stringify(chatSettings));
        }
    }

    function handleBackgroundUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                chatSettings.background = 'custom';
                chatSettings.bgImage = ev.target.result;
                if (DOM.chatMessages) {
                    DOM.chatMessages.style.backgroundImage = `url(${ev.target.result})`;
                    DOM.chatMessages.style.backgroundSize = 'cover';
                    DOM.chatMessages.style.backgroundPosition = 'center';
                }
                localStorage.setItem('vvn_chat_settings', JSON.stringify(chatSettings));
            };
            reader.readAsDataURL(file);
        }
    }

    function applyChatBackground() {
        if (chatSettings.background === 'custom' && chatSettings.bgImage && DOM.chatMessages) {
            DOM.chatMessages.style.backgroundImage = `url(${chatSettings.bgImage})`;
            DOM.chatMessages.style.backgroundSize = 'cover';
            DOM.chatMessages.style.backgroundPosition = 'center';
        } else if (DOM.chatMessages) {
            DOM.chatMessages.style.background = '';
            DOM.chatMessages.style.backgroundImage = '';
        }
    }

    function createNote() {
        const note = prompt('Enter your note:');
        if (note && note.trim()) {
            const notes = JSON.parse(localStorage.getItem('vvn_notes') || '[]');
            notes.push({
                id: Date.now(),
                text: note.trim(),
                created: Date.now()
            });
            localStorage.setItem('vvn_notes', JSON.stringify(notes));
            alert('Note saved!');
        }
    }

    // ---------- FILE ATTACHMENT ----------
    function openFileModal() {
        if (DOM.fileModal) DOM.fileModal.classList.add('active');
        if (DOM.filePreviewImage) DOM.filePreviewImage.src = 'icons/image-placeholder.png';
        if (DOM.filePreviewVideo) DOM.filePreviewVideo.style.display = 'none';
        if (DOM.fileCaption) DOM.fileCaption.value = '';
        pendingFile = null;
        pendingFileType = null;
    }

    function handleFileSelect() {
        if (DOM.fileInput) DOM.fileInput.click();
    }

    function handleFileInput(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(ev) {
            const data = ev.target.result;
            if (file.type.startsWith('image/')) {
                pendingFileType = 'image';
                if (DOM.filePreviewImage) {
                    DOM.filePreviewImage.src = data;
                    DOM.filePreviewImage.style.display = 'block';
                }
                if (DOM.filePreviewVideo) DOM.filePreviewVideo.style.display = 'none';
            } else if (file.type.startsWith('video/')) {
                pendingFileType = 'video';
                if (DOM.filePreviewVideo) {
                    DOM.filePreviewVideo.src = data;
                    DOM.filePreviewVideo.style.display = 'block';
                }
                if (DOM.filePreviewImage) DOM.filePreviewImage.style.display = 'none';
            }
            pendingFile = data;
        };
        reader.readAsDataURL(file);
    }

    // ---------- LOAD SAVED SETTINGS ----------
    function loadSavedSettings() {
        const names = localStorage.getItem('vvn_contact_names');
        if (names) contactCustomNames = JSON.parse(names);
        
        const pinned = localStorage.getItem('vvn_pinned');
        if (pinned) pinnedMessages = JSON.parse(pinned);
        
        const settings = localStorage.getItem('vvn_chat_settings');
        if (settings) chatSettings = JSON.parse(settings);
        
        const blocked = localStorage.getItem('vvn_blocked');
        if (blocked) blockedUsers = JSON.parse(blocked);
        
        const theme = localStorage.getItem('vvn_theme');
        if (theme && THEMES[theme]) {
            state.currentTheme = theme;
            applyTheme(theme);
        } else {
            state.currentTheme = 'dark';
            applyTheme('dark');
        }
        
        const customTheme = localStorage.getItem('vvn_custom_theme');
        if (customTheme) {
            const ct = JSON.parse(customTheme);
            if (document.getElementById('primaryColor')) {
                document.getElementById('primaryColor').value = ct.primary;
            }
            if (document.getElementById('secondaryColor')) {
                document.getElementById('secondaryColor').value = ct.secondary;
            }
            if (document.getElementById('textColor')) {
                document.getElementById('textColor').value = ct.text;
            }
        }
    }

    // ---------- MOBILE ----------
    function updateMobileView() {
        state.isMobile = window.innerWidth < 768;
        const sidebar = document.getElementById('sidebar');
        if (state.isMobile) {
            if (state.currentChatPartner) {
                if (sidebar) sidebar.classList.add('hide-mobile');
                if (DOM.chatArea) DOM.chatArea.classList.add('active-mobile');
            } else {
                if (sidebar) sidebar.classList.remove('hide-mobile');
                if (DOM.chatArea) DOM.chatArea.classList.remove('active-mobile');
            }
        } else {
            if (sidebar) sidebar.classList.remove('hide-mobile');
            if (DOM.chatArea) DOM.chatArea.classList.remove('active-mobile');
        }
    }

    // ---------- INIT ----------
    async function init() {
        console.log('🚀 Initializing VVN...');
        
        if (DOM.loadingOverlay) {
            DOM.loadingOverlay.classList.remove('hidden');
        }
        updateLoading(5);

        loadSavedSettings();

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const cached = localStorage.getItem('vvn_cache');
        if (cached) {
            try {
                state.localCache = JSON.parse(cached);
                console.log('📦 Loaded from cache:', state.localCache.users.length, 'users');
                updateLoading(40);
            } catch (e) {
                console.warn('Cache parse error, using defaults');
                state.localCache = { users: [], chats: {}, messages: {} };
            }
        } else {
            state.localCache = { users: [], chats: {}, messages: {} };
            if (!state.localCache.users.find(u => u.username === 'vaultnet')) {
                state.localCache.users.push({
                    username: 'vaultnet',
                    displayName: 'VaultNet',
                    password: 'admin123',
                    bio: 'Creator of VVN',
                    online: true,
                    created: Date.now(),
                    avatar: ''
                });
            }
            localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
        }

        updateLoading(50);

        try {
            const remote = await fetchFromBin();
            if (remote) {
                state.localCache = {
                    users: remote.users || [],
                    chats: remote.chats || {},
                    messages: remote.messages || {}
                };
                if (!state.localCache.users.find(u => u.username === 'vaultnet')) {
                    state.localCache.users.push({
                        username: 'vaultnet',
                        displayName: 'VaultNet',
                        password: 'admin123',
                        bio: 'Creator of VVN',
                        online: true,
                        created: Date.now(),
                        avatar: ''
                    });
                }
                localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
                console.log('✅ Loaded from JSONBin:', state.localCache.users.length, 'users');
            }
        } catch (e) {
            console.warn('Background sync failed, using cache');
        }

        updateLoading(80);

        const savedSettings = localStorage.getItem('vvn_settings');
        if (savedSettings) {
            try {
                state.settings = JSON.parse(savedSettings);
            } catch (e) {
                state.settings = { e2ee: true, twofa: false, privacy: false, devMode: false, lastSeen: true, readReceipts: true, typingIndicators: true };
            }
        }

        updateLoading(90);

        const session = JSON.parse(localStorage.getItem('vvn_session'));
        if (session) {
            const user = state.localCache.users.find(u => u.username === session.username);
            if (user) {
                state.currentUser = user;
                renderMessenger();

                if (state.syncInterval) clearInterval(state.syncInterval);
                state.syncInterval = setInterval(syncWithRemote, CONFIG.SYNC_INTERVAL);

                updateLoading(100);
                return;
            } else {
                localStorage.removeItem('vvn_session');
            }
        }

        if (DOM.authScreen) DOM.authScreen.style.display = 'flex';
        if (DOM.messenger) DOM.messenger.style.display = 'none';
        updateLoading(100);
    }

    // ---------- EVENT LISTENERS ----------
    document.addEventListener('DOMContentLoaded', function() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                const form = document.getElementById(this.dataset.tab + 'Form');
                if (form) form.classList.add('active');
            });
        });

        // Login
        if (DOM.loginForm) {
            DOM.loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = DOM.loginUsername ? DOM.loginUsername.value.trim() : '';
                const password = DOM.loginPassword ? DOM.loginPassword.value.trim() : '';
                if (!username || !password) {
                    if (DOM.authError) {
                        DOM.authError.textContent = 'Please fill in all fields';
                        DOM.authError.style.display = 'block';
                    }
                    return;
                }
                await loginUser(username, password);
            });
        }

        // Register
        if (DOM.registerForm) {
            DOM.registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = DOM.regUsername ? DOM.regUsername.value.trim() : '';
                const displayName = DOM.regDisplayName ? DOM.regDisplayName.value.trim() : '';
                const password = DOM.regPassword ? DOM.regPassword.value.trim() : '';
                if (!username || !password) {
                    if (DOM.regError) {
                        DOM.regError.textContent = 'Username and password required';
                        DOM.regError.style.display = 'block';
                    }
                    return;
                }
                if (username.length < 3) {
                    if (DOM.regError) {
                        DOM.regError.textContent = 'Username must be at least 3 characters';
                        DOM.regError.style.display = 'block';
                    }
                    return;
                }
                await registerUser(username, displayName, password);
            });
        }

        // Send message
        if (DOM.sendBtn) {
            DOM.sendBtn.addEventListener('click', sendMessage);
        }
        if (DOM.messageInput) {
            DOM.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }

        // Search
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', function() {
                searchUsers(this.value);
            });
        }
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-wrap') && DOM.searchResults) {
                DOM.searchResults.style.display = 'none';
            }
        });

        // Back button
        if (DOM.backBtn) {
            DOM.backBtn.addEventListener('click', function() {
                if (state.isMobile) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar) sidebar.classList.remove('hide-mobile');
                    if (DOM.chatArea) DOM.chatArea.classList.remove('active-mobile');
                    state.currentChatPartner = null;
                    showPlaceholder();
                    renderChatList();
                }
            });
        }

        // Profile button
        if (DOM.profileBtn) {
            DOM.profileBtn.addEventListener('click', function() {
                if (state.currentChatPartner) {
                    showProfile(state.currentChatPartner);
                }
            });
        }

        // Chat header click
        if (DOM.chatHeaderInfo) {
            DOM.chatHeaderInfo.addEventListener('click', function() {
                if (state.currentChatPartner) {
                    showProfile(state.currentChatPartner);
                }
            });
        }

        // Settings
        if (DOM.settingsBtn) {
            DOM.settingsBtn.addEventListener('click', openSettings);
        }
        if (DOM.settingsClose) {
            DOM.settingsClose.addEventListener('click', () => {
                if (DOM.settingsModal) DOM.settingsModal.classList.remove('active');
            });
        }

        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(this.dataset.tab + 'Settings');
                if (panel) panel.classList.add('active');
            });
        });

        // Save settings
        if (DOM.saveSettings) {
            DOM.saveSettings.addEventListener('click', saveSettings);
        }

        // Toggle handlers
        if (DOM.e2eeToggle) {
            DOM.e2eeToggle.addEventListener('change', function() {
                state.settings.e2ee = this.checked;
                if (DOM.e2eeStatus) DOM.e2eeStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        if (DOM.twofaToggle) {
            DOM.twofaToggle.addEventListener('change', function() {
                state.settings.twofa = this.checked;
                if (DOM.twofaStatus) DOM.twofaStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        if (DOM.privacyToggle) {
            DOM.privacyToggle.addEventListener('change', function() {
                state.settings.privacy = this.checked;
                if (DOM.privacyStatus) DOM.privacyStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        if (DOM.devToggle) {
            DOM.devToggle.addEventListener('change', function() {
                state.settings.devMode = this.checked;
                if (DOM.devStatus) DOM.devStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        if (DOM.lastSeenToggle) {
            DOM.lastSeenToggle.addEventListener('change', function() {
                state.settings.lastSeen = this.checked;
                if (DOM.lastSeenStatus) DOM.lastSeenStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        if (DOM.readReceiptsToggle) {
            DOM.readReceiptsToggle.addEventListener('change', function() {
                state.settings.readReceipts = this.checked;
                if (DOM.readReceiptsStatus) DOM.readReceiptsStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        if (DOM.typingIndicatorsToggle) {
            DOM.typingIndicatorsToggle.addEventListener('change', function() {
                state.settings.typingIndicators = this.checked;
                if (DOM.typingIndicatorsStatus) DOM.typingIndicatorsStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
                localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
            });
        }

        // Avatar upload
        if (DOM.avatarUpload) {
            DOM.avatarUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        if (DOM.settingsAvatar) DOM.settingsAvatar.src = ev.target.result;
                        const user = state.currentUser;
                        if (user) {
                            user.avatar = ev.target.result;
                            const userIndex = state.localCache.users.findIndex(u => u.username === user.username);
                            if (userIndex !== -1) {
                                state.localCache.users[userIndex] = user;
                                localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
                            }
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Modal close
        if (DOM.modalClose) {
            DOM.modalClose.addEventListener('click', () => {
                if (DOM.profileModal) DOM.profileModal.classList.remove('active');
            });
        }
        if (DOM.profileModal) {
            const overlay = DOM.profileModal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => DOM.profileModal.classList.remove('active'));
            }
        }

        // Manual sync
        if (DOM.manualSyncBtn) {
            DOM.manualSyncBtn.addEventListener('click', syncWithRemote);
        }

        // Selection
        if (DOM.selectBtn) {
            DOM.selectBtn.addEventListener('click', toggleSelectionMode);
        }

        document.addEventListener('click', function(e) {
            const msgEl = e.target.closest('.message');
            if (msgEl && selectionMode) {
                const msgId = msgEl.dataset.msgId;
                if (msgId) toggleMessageSelection(msgId);
            }
        });

        if (DOM.deleteSelectedBtn) {
            DOM.deleteSelectedBtn.addEventListener('click', showDeleteModal);
        }
        if (DOM.pinSelectedBtn) {
            DOM.pinSelectedBtn.addEventListener('click', pinSelectedMessages);
        }
        if (DOM.cancelSelectionBtn) {
            DOM.cancelSelectionBtn.addEventListener('click', clearSelection);
        }

        if (DOM.deleteForMeBtn) {
            DOM.deleteForMeBtn.addEventListener('click', () => deleteMessages(false));
        }
        if (DOM.deleteForEveryoneBtn) {
            DOM.deleteForEveryoneBtn.addEventListener('click', () => deleteMessages(true));
        }
        if (DOM.deleteModalClose) {
            DOM.deleteModalClose.addEventListener('click', () => DOM.deleteModal.classList.remove('active'));
        }

        if (DOM.unpinBtn) {
            DOM.unpinBtn.addEventListener('click', () => {
                const chatKey = getChatKey(state.currentUser?.username, state.currentChatPartner);
                if (chatKey) unpinMessage(chatKey);
            });
        }
        if (DOM.pinnedMessagePreview) {
            DOM.pinnedMessagePreview.addEventListener('click', scrollToPinnedMessage);
        }

        if (DOM.userSettingsBtn) {
            DOM.userSettingsBtn.addEventListener('click', openUserSettings);
        }
        if (DOM.userSettingsClose) {
            DOM.userSettingsClose.addEventListener('click', () => DOM.userSettingsModal.classList.remove('active'));
        }
        if (DOM.renameContactBtn) {
            DOM.renameContactBtn.addEventListener('click', renameContact);
        }
        if (DOM.deleteContactBtn) {
            DOM.deleteContactBtn.addEventListener('click', deleteContact);
        }
        if (DOM.blockUserBtn) {
            DOM.blockUserBtn.addEventListener('click', blockUser);
        }
        if (DOM.unblockUserBtn) {
            DOM.unblockUserBtn.addEventListener('click', unblockUser);
        }
        if (DOM.pinContactBtn) {
            DOM.pinContactBtn.addEventListener('click', pinContact);
        }

        if (DOM.chatSettingsBtn) {
            DOM.chatSettingsBtn.addEventListener('click', openChatSettings);
        }
        if (DOM.chatSettingsClose) {
            DOM.chatSettingsClose.addEventListener('click', () => DOM.chatSettingsModal.classList.remove('active'));
        }
        document.querySelectorAll('.bubble-style').forEach(btn => {
            btn.addEventListener('click', function() {
                changeBubbleStyle(this.dataset.style);
            });
        });
        if (DOM.bgDefault) {
            DOM.bgDefault.addEventListener('click', () => changeChatBackground('default'));
        }
        if (DOM.bgCustom) {
            DOM.bgCustom.addEventListener('click', () => changeChatBackground('custom'));
        }
        if (DOM.bgUpload) {
            DOM.bgUpload.addEventListener('change', handleBackgroundUpload);
        }
        if (DOM.createNoteBtn) {
            DOM.createNoteBtn.addEventListener('click', createNote);
        }

        // Theme settings (now in main settings)
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', function() {
                const themeName = this.dataset.theme;
                if (themeName === 'custom') {
                    document.getElementById('customThemeOptions').style.display = 'block';
                    return;
                }
                document.getElementById('customThemeOptions').style.display = 'none';
                applyTheme(themeName);
            });
        });

        if (DOM.applyCustomTheme) {
            DOM.applyCustomTheme.addEventListener('click', applyCustomTheme);
        }

        // File attachment
        if (DOM.clipBtn) {
            DOM.clipBtn.addEventListener('click', openFileModal);
        }
        if (DOM.fileModalClose) {
            DOM.fileModalClose.addEventListener('click', () => DOM.fileModal.classList.remove('active'));
        }
        if (DOM.fileSelectBtn) {
            DOM.fileSelectBtn.addEventListener('click', handleFileSelect);
        }
        if (DOM.fileInput) {
            DOM.fileInput.addEventListener('change', handleFileInput);
        }
        if (DOM.fileSendBtn) {
            DOM.fileSendBtn.addEventListener('click', sendMessage);
        }

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', function() {
                this.parentElement.classList.remove('active');
            });
        });

        // Resize
        window.addEventListener('resize', updateMobileView);

        // Start app
        init();

        console.log('🚀 VVN Messenger started!');
        console.log('👤 Default owner: vaultnet');
        console.log('🔐 Password: admin123');
        console.log('🔑 Developer PIN:', CONFIG.DEV_PIN);
        console.log('📱 Messages sync every', CONFIG.SYNC_INTERVAL/1000, 'seconds');
        console.log('🎨 Themes available:', Object.keys(THEMES).join(', '));
    });
})();
