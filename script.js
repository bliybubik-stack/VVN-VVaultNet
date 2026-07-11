// VVN Messenger - Main Application
(function() {
    'use strict';

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

    // ---------- STATE ----------
    let state = {
        currentUser: null,
        currentChatPartner: null,
        localCache: { users: [], chats: {}, messages: {} },
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
        deviceType: 'mobile',
        syncInterval: null,
        settings: {
            e2ee: true,
            twofa: false,
            privacy: false,
            devMode: false,
            autoLock: 'never',
            sessionTimeout: 'never',
            messageHistory: 'forever',
            theme: 'dark'
        },
        loadingComplete: false
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
        e2eeStatus: document.getElementById('e2eeStatus'),
        twofaStatus: document.getElementById('twofaStatus'),
        privacyStatus: document.getElementById('privacyStatus'),
        devStatus: document.getElementById('devStatus'),
        chatAvatar: document.getElementById('chatAvatar'),
        chatHeaderInfo: document.getElementById('chatHeaderInfo'),
        selectBtn: document.getElementById('selectBtn'),
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
        autoLockTimer: document.getElementById('autoLockTimer'),
        sessionTimeout: document.getElementById('sessionTimeout'),
        messageHistory: document.getElementById('messageHistory'),
        primaryColor: document.getElementById('primaryColor'),
        secondaryColor: document.getElementById('secondaryColor'),
        textColor: document.getElementById('textColor'),
        accentColor: document.getElementById('accentColor'),
        applyCustomTheme: document.getElementById('applyCustomTheme'),
        clipBtn: document.getElementById('clipBtn'),
        fileModal: document.getElementById('fileModal'),
        fileModalClose: document.getElementById('fileModalClose'),
        fileSelectBtn: document.getElementById('fileSelectBtn'),
        fileInput: document.getElementById('fileInput'),
        filePreviewContainer: document.getElementById('filePreviewContainer'),
        fileClearBtn: document.getElementById('fileClearBtn'),
        fileCaption: document.getElementById('fileCaption'),
        fileSendBtn: document.getElementById('fileSendBtn'),
        dropdownToggle: document.getElementById('dropdownToggle'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        deviceSelector: document.getElementById('deviceSelector'),
        confirmDeviceBtn: document.getElementById('confirmDeviceBtn'),
        deviceOptions: document.querySelectorAll('.device-option')
    };

    // ---------- UTILITY ----------
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

    function getUserByUsername(username) {
        return state.localCache.users.find(u => u.username === username);
    }

    function getChatKey(u1, u2) {
        return [u1, u2].sort().join('_');
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

    // ---------- DEVICE SELECTOR ----------
    function selectDevice(device) {
        state.deviceType = device;
        document.querySelectorAll('.device-option').forEach(el => {
            el.classList.toggle('active', el.dataset.device === device);
        });
        localStorage.setItem('vvn_device', device);
    }

    function loadDeviceStyle(device) {
        const link = document.getElementById('deviceStyle');
        if (device === 'mobile') link.href = 'style-mobile.css';
        else if (device === 'tablet') link.href = 'style-tablet.css';
        else link.href = 'style-desktop.css';
    }

    function applyDeviceLayout() {
        const device = state.deviceType || localStorage.getItem('vvn_device') || 'mobile';
        loadDeviceStyle(device);
        document.querySelectorAll('.device-option').forEach(el => {
            el.classList.toggle('active', el.dataset.device === device);
        });
        // Update classes
        document.body.className = device + '-device';
        // Update sidebar/chat area for mobile
        if (device === 'mobile' && state.currentChatPartner) {
            document.getElementById('sidebar').classList.add('hide-mobile');
            DOM.chatArea.classList.add('active-mobile');
        } else if (device === 'mobile') {
            document.getElementById('sidebar').classList.remove('hide-mobile');
            DOM.chatArea.classList.remove('active-mobile');
        }
    }

    // ---------- LOADING ----------
    function updateLoading(progress) {
        const p = Math.min(progress, 100);
        if (DOM.loaderFill) DOM.loaderFill.style.width = p + '%';
        if (p >= 100 && !state.loadingComplete) {
            state.loadingComplete = true;
            setTimeout(() => {
                if (DOM.loadingOverlay) DOM.loadingOverlay.classList.add('hidden');
            }, 300);
        }
    }

    function setStatus(text, color) {
        if (DOM.syncStatus) DOM.syncStatus.textContent = text;
        if (DOM.syncDot) DOM.syncDot.className = 'status-dot ' + color;
    }

    // ---------- JSONBin ----------
    async function fetchFromBin() {
        try {
            setStatus('Fetching...', 'yellow');
            const resp = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
                headers: { 'X-Master-Key': CONFIG.MASTER_KEY, 'X-Bin-Meta': 'false' }
            });
            if (!resp.ok) { setStatus('Using cache', 'yellow'); return null; }
            const data = await resp.json();
            setStatus('Connected', 'green');
            return data;
        } catch (e) {
            setStatus('Offline', 'yellow');
            return null;
        }
    }

    async function updateBin(data) {
        try {
            setStatus('Saving...', 'yellow');
            const resp = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': CONFIG.MASTER_KEY, 'X-Bin-Meta': 'false' },
                body: JSON.stringify(data)
            });
            if (!resp.ok) { setStatus('Save failed', 'red'); return false; }
            setStatus('Saved', 'green');
            return true;
        } catch (e) { setStatus('Offline', 'yellow'); return false; }
    }

    // ---------- SYNC ----------
    async function syncWithRemote() {
        setStatus('Syncing...', 'yellow');
        const remote = await fetchFromBin();
        if (remote) {
            const remoteUsers = remote.users || [];
            const remoteChats = remote.chats || {};
            const remoteMessages = remote.messages || {};
            const localMessages = state.localCache.messages || {};
            
            for (const [key, msgs] of Object.entries(remoteMessages)) {
                if (!localMessages[key]) {
                    localMessages[key] = msgs;
                } else if (msgs.length > localMessages[key].length) {
                    const newMsgs = msgs.slice(localMessages[key].length);
                    for (const msg of newMsgs) {
                        if (msg.sender !== state.currentUser?.username) {
                            const partner = key.split('_').find(u => u !== state.currentUser?.username);
                            if (partner && state.currentUser) {
                                // Send notification (browser)
                                if ('Notification' in window && Notification.permission === 'granted') {
                                    new Notification('VVN - New Message', {
                                        body: `${partner}: ${msg.text || '📎 File'}`,
                                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>'
                                    });
                                }
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
                if (state.currentChatPartner) openChat(state.currentChatPartner);
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
        if (DOM.sidebarUsername) DOM.sidebarUsername.textContent = user.displayName || user.username;
        renderChatList();

        if (state.currentChatPartner) {
            openChat(state.currentChatPartner);
        } else {
            showPlaceholder();
        }
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

        const blockedUsers = JSON.parse(localStorage.getItem('vvn_blocked') || '[]');
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
                const displayName = pUser?.displayName || partner;

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
        
        const blockedUsers = JSON.parse(localStorage.getItem('vvn_blocked') || '[]');
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

        const displayName = partner.displayName || partnerUsername;
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
        
        // Show pinned messages
        const pinnedMessages = JSON.parse(localStorage.getItem('vvn_pinned') || '{}');
        const pinned = pinnedMessages[chatKey] || [];
        if (pinned.length > 0) {
            DOM.pinnedDock.style.display = 'block';
            DOM.pinnedMessagePreview.textContent = `${pinned[pinned.length-1].sender}: ${pinned[pinned.length-1].text || '📎 File'}`;
        } else {
            DOM.pinnedDock.style.display = 'none';
        }
        
        // Apply device-specific layout
        if (state.deviceType === 'mobile') {
            document.getElementById('sidebar').classList.add('hide-mobile');
            DOM.chatArea.classList.add('active-mobile');
        }
        
        renderChatList();
        scrollToBottom();
        clearSelection();
    }

    function renderMessages(msgs) {
        if (!DOM.chatMessages) return;
        DOM.chatMessages.innerHTML = '';
        if (!msgs.length) {
            DOM.chatMessages.innerHTML = '<div style="color:var(--text-muted);
