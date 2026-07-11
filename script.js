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
            DOM.chatMessages.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:20px;">No messages yet</div>';
            return;
        }
        for (let i = 0; i < msgs.length; i++) {
            const msg = msgs[i];
            const msgId = `${msg.timestamp}-${i}`;
            const div = document.createElement('div');
            const isOutgoing = msg.sender === state.currentUser.username;
            const bubbleStyle = localStorage.getItem('vvn_bubble_style') || 'rounded';
            div.className = `message ${isOutgoing ? 'outgoing' : 'incoming'} bubble-${bubbleStyle}`;
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
            if (DOM.chatMessages) DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
        }, 50);
    }

    function showPlaceholder() {
        if (DOM.chatActive) DOM.chatActive.style.display = 'none';
        if (DOM.chatPlaceholder) DOM.chatPlaceholder.style.display = 'flex';
        if (state.deviceType === 'mobile') {
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

        messages[chatKey].push({
            sender: state.currentUser.username,
            text: text,
            timestamp: Date.now()
        });

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

    // ---------- FILE UPLOAD ----------
    let pendingFiles = [];

    function handleFileInput(e) {
        const files = e.target.files;
        if (!files.length) return;
        
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const data = ev.target.result;
                const fileType = file.type.startsWith('image/') ? 'image' : 'video';
                
                pendingFiles.push({
                    data: data,
                    type: fileType,
                    name: file.name
                });
                
                // Show preview
                const container = DOM.filePreviewContainer;
                const item = document.createElement('div');
                item.className = 'file-preview-item';
                const idx = pendingFiles.length - 1;
                item.innerHTML = `
                    ${fileType === 'image' ? `<img src="${data}" />` : `<video controls><source src="${data}" /></video>`}
                    <button class="remove-file" data-index="${idx}">×</button>
                `;
                container.appendChild(item);
                
                // Remove handler
                item.querySelector('.remove-file').addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    pendingFiles.splice(index, 1);
                    this.closest('.file-preview-item').remove();
                    if (pendingFiles.length === 0) {
                        DOM.fileClearBtn.style.display = 'none';
                    }
                });
                
                DOM.fileClearBtn.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    }

    async function sendFiles() {
        if (!pendingFiles.length || !state.currentUser || !state.currentChatPartner) return;
        
        const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
        const messages = state.localCache.messages;
        if (!messages[chatKey]) messages[chatKey] = [];
        
        const caption = DOM.fileCaption.value.trim();
        
        for (const file of pendingFiles) {
            messages[chatKey].push({
                sender: state.currentUser.username,
                timestamp: Date.now(),
                file: {
                    type: file.type,
                    data: file.data,
                    caption: caption
                }
            });
        }
        
        state.localCache.messages = messages;
        localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
        await pushToRemote();
        
        pendingFiles = [];
        DOM.filePreviewContainer.innerHTML = '';
        DOM.fileClearBtn.style.display = 'none';
        DOM.fileCaption.value = '';
        DOM.fileModal.classList.remove('active');
        
        renderMessages(messages[chatKey]);
        renderChatList();
        scrollToBottom();
    }

    // ---------- SELECTION ----------
    let selectionMode = false;
    let selectedMessages = new Set();

    function toggleSelectionMode() {
        selectionMode = !selectionMode;
        if (selectionMode) {
            DOM.selectBtn.classList.add('active');
            document.querySelectorAll('.message').forEach(msg => msg.classList.add('selectable'));
            DOM.selectionToolbar.classList.add('active');
        } else {
            clearSelection();
            DOM.selectBtn.classList.remove('active');
            document.querySelectorAll('.message').forEach(msg => msg.classList.remove('selectable'));
            DOM.selectionToolbar.classList.remove('active');
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
        DOM.selectedCount.textContent = selectedMessages.size + ' selected';
    }

    function clearSelection() {
        selectedMessages.clear();
        document.querySelectorAll('.message.selected').forEach(el => el.classList.remove('selected'));
        DOM.selectedCount.textContent = '0 selected';
        selectionMode = false;
        DOM.selectBtn.classList.remove('active');
        document.querySelectorAll('.message').forEach(msg => msg.classList.remove('selectable'));
        DOM.selectionToolbar.classList.remove('active');
    }

    function deleteSelectedMessages(forEveryone = false) {
        if (selectedMessages.size === 0) return;
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
        DOM.deleteModal.classList.remove('active');
        renderMessages(remaining);
        renderChatList();
    }

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
            const pinnedMessages = JSON.parse(localStorage.getItem('vvn_pinned') || '{}');
            if (!pinnedMessages[chatKey]) pinnedMessages[chatKey] = [];
            pinnedMessages[chatKey].push(msg);
            localStorage.setItem('vvn_pinned', JSON.stringify(pinnedMessages));
            
            DOM.pinnedDock.style.display = 'block';
            DOM.pinnedMessagePreview.textContent = `${msg.sender}: ${msg.text || '📎 File'}`;
        }
        clearSelection();
    }

    // ---------- DROPDOWN ----------
    function toggleDropdown() {
        DOM.dropdownMenu.classList.toggle('active');
    }

    function handleDropdownAction(action) {
        DOM.dropdownMenu.classList.remove('active');
        switch(action) {
            case 'userSettings':
                DOM.userSettingsModal.classList.add('active');
                break;
            case 'chatSettings':
                DOM.chatSettingsModal.classList.add('active');
                break;
            case 'themeSettings':
                DOM.settingsModal.classList.add('active');
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                document.querySelector('.settings-tab[data-tab="themes"]').classList.add('active');
                document.getElementById('themesSettings').classList.add('active');
                break;
            case 'blockUser':
                blockUser();
                break;
            case 'renameContact':
                renameContact();
                break;
            case 'deleteContact':
                deleteContact();
                break;
        }
    }

    // ---------- USER SETTINGS ----------
    function renameContact() {
        const newName = prompt('Enter new name for this contact:', 
            state.currentChatPartner);
        if (newName && newName.trim()) {
            const contactNames = JSON.parse(localStorage.getItem('vvn_contact_names') || '{}');
            contactNames[state.currentChatPartner] = newName.trim();
            localStorage.setItem('vvn_contact_names', JSON.stringify(contactNames));
            renderChatList();
            DOM.chatPartnerName.textContent = newName.trim();
        }
    }

    function deleteContact() {
        if (confirm(`Delete contact ${state.currentChatPartner}?`)) {
            const chatKey = getChatKey(state.currentUser.username, state.currentChatPartner);
            delete state.localCache.chats[chatKey];
            localStorage.setItem('vvn_cache', JSON.stringify(state.localCache));
            pushToRemote();
            state.currentChatPartner = null;
            showPlaceholder();
            renderChatList();
            DOM.userSettingsModal.classList.remove('active');
        }
    }

    function blockUser() {
        if (confirm(`Block ${state.currentChatPartner}?`)) {
            const blocked = JSON.parse(localStorage.getItem('vvn_blocked') || '[]');
            if (!blocked.includes(state.currentChatPartner)) {
                blocked.push(state.currentChatPartner);
                localStorage.setItem('vvn_blocked', JSON.stringify(blocked));
                DOM.blockUserBtn.style.display = 'none';
                DOM.unblockUserBtn.style.display = 'inline-flex';
            }
        }
    }

    function unblockUser() {
        const blocked = JSON.parse(localStorage.getItem('vvn_blocked') || '[]');
        const index = blocked.indexOf(state.currentChatPartner);
        if (index > -1) {
            blocked.splice(index, 1);
            localStorage.setItem('vvn_blocked', JSON.stringify(blocked));
            DOM.blockUserBtn.style.display = 'inline-flex';
            DOM.unblockUserBtn.style.display = 'none';
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

    // ---------- CHAT SETTINGS ----------
    function changeBubbleStyle(style) {
        localStorage.setItem('vvn_bubble_style', style);
        document.querySelectorAll('.message').forEach(msg => {
            msg.className = msg.className.replace(/bubble-\w+/g, '');
            msg.classList.add('bubble-' + style);
        });
        document.querySelectorAll('.bubble-style').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });
    }

    // ---------- THEME ----------
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.remove('light-theme');
            root.style.setProperty('--bg-primary', '#0a0a0a');
            root.style.setProperty('--bg-secondary', '#141414');
            root.style.setProperty('--bg-tertiary', '#1a1a1a');
            root.style.setProperty('--text-primary', '#f0f0f0');
            root.style.setProperty('--text-secondary', '#999');
            root.style.setProperty('--dark-purple', '#2d1b69');
        } else if (theme === 'light') {
            root.classList.add('light-theme');
            root.style.setProperty('--bg-primary', '#f5f5f5');
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--bg-tertiary', '#f0f0f0');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#666');
            root.style.setProperty('--dark-purple', '#4a2b8a');
        } else if (theme === 'midnight') {
            root.classList.remove('light-theme');
            root.style.setProperty('--bg-primary', '#0a0e1a');
            root.style.setProperty('--bg-secondary', '#0f1524');
            root.style.setProperty('--bg-tertiary', '#141c2e');
            root.style.setProperty('--text-primary', '#7b9ac9');
            root.style.setProperty('--text-secondary', '#5a7a9a');
            root.style.setProperty('--dark-purple', '#1a2a5a');
        } else if (theme === 'forest') {
            root.classList.remove('light-theme');
            root.style.setProperty('--bg-primary', '#0d1a0d');
            root.style.setProperty('--bg-secondary', '#122412');
            root.style.setProperty('--bg-tertiary', '#1a2e1a');
            root.style.setProperty('--text-primary', '#7bc97b');
            root.style.setProperty('--text-secondary', '#5a9a5a');
            root.style.setProperty('--dark-purple', '#1a4a1a');
        } else if (theme === 'ocean') {
            root.classList.remove('light-theme');
            root.style.setProperty('--bg-primary', '#0a0d1a');
            root.style.setProperty('--bg-secondary', '#0f1524');
            root.style.setProperty('--bg-tertiary', '#141c2e');
            root.style.setProperty('--text-primary', '#7b9ac9');
            root.style.setProperty('--text-secondary', '#5a7a9a');
            root.style.setProperty('--dark-purple', '#1a3a6a');
        }
        localStorage.setItem('vvn_theme', theme);
    }

    // ---------- SEARCH ----------
    function searchUsers(query) {
        if (!query.trim() || !DOM.searchResults) {
            DOM.searchResults.style.display = 'none';
            return;
        }
        const users = state.localCache.users;
        const q = query.toLowerCase();
        const blockedUsers = JSON.parse(localStorage.getItem('vvn_blocked') || '[]');
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
                DOM.searchInput.value = '';
            });
        });
    }

    // ---------- LOAD SAVED SETTINGS ----------
    function loadSavedSettings() {
        const theme = localStorage.getItem('vvn_theme');
        if (theme) applyTheme(theme);
        
        const device = localStorage.getItem('vvn_device');
        if (device) {
            state.deviceType = device;
            loadDeviceStyle(device);
        }
    }

    // ---------- INIT ----------
    async function init() {
        console.log('🚀 Initializing VVN...');
        
        // Device selector
        const savedDevice = localStorage.getItem('vvn_device');
        if (savedDevice) {
            DOM.deviceSelector.classList.add('hidden');
            state.deviceType = savedDevice;
            loadDeviceStyle(savedDevice);
        } else {
            DOM.deviceSelector.classList.remove('hidden');
        }

        DOM.confirmDeviceBtn.addEventListener('click', function() {
            const active = document.querySelector('.device-option.active');
            if (active) {
                const device = active.dataset.device;
                selectDevice(device);
                DOM.deviceSelector.classList.add('hidden');
                loadDeviceStyle(device);
                applyDeviceLayout();
                // Continue loading
                loadApp();
            }
        });

        DOM.deviceOptions.forEach(opt => {
            opt.addEventListener('click', function() {
                DOM.deviceOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // If device already selected, load app
        if (savedDevice) {
            await loadApp();
        }

        // Set up event listeners
        setupEventListeners();
    }

    async function loadApp() {
        if (DOM.loadingOverlay) DOM.loadingOverlay.classList.remove('hidden');
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
    function setupEventListeners() {
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

        // Send message
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

        // Back button
        DOM.backBtn.addEventListener('click', function() {
            if (state.deviceType === 'mobile') {
                document.getElementById('sidebar').classList.remove('hide-mobile');
                DOM.chatArea.classList.remove('active-mobile');
                state.currentChatPartner = null;
                showPlaceholder();
                renderChatList();
            }
        });

        // Profile button
        DOM.profileBtn.addEventListener('click', function() {
            if (state.currentChatPartner) {
                const user = getUserByUsername(state.currentChatPartner);
                if (user) showProfile(user);
            }
        });

        DOM.chatHeaderInfo.addEventListener('click', function() {
            if (state.currentChatPartner) {
                const user = getUserByUsername(state.currentChatPartner);
                if (user) showProfile(user);
            }
        });

        // Settings
        DOM.settingsBtn.addEventListener('click', function() {
            DOM.settingsModal.classList.add('active');
        });
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

        DOM.twofaToggle.addEventListener('change', function() {
            state.settings.twofa = this.checked;
            DOM.twofaStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
            localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
        });

        DOM.privacyToggle.addEventListener('change', function() {
            state.settings.privacy = this.checked;
            DOM.privacyStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
            localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
        });

        DOM.devToggle.addEventListener('change', function() {
            state.settings.devMode = this.checked;
            DOM.devStatus.textContent = this.checked ? 'Enabled' : 'Disabled';
            localStorage.setItem('vvn_settings', JSON.stringify(state.settings));
        });

        // Avatar upload
        DOM.avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    DOM.settingsAvatar.src = ev.target.result;
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

        // Modal close
        DOM.modalClose.addEventListener('click', () => DOM.profileModal.classList.remove('active'));
        DOM.profileModal.querySelector('.modal-overlay').addEventListener('click', () => DOM.profileModal.classList.remove('active'));

        // Manual sync
        DOM.manualSyncBtn.addEventListener('click', syncWithRemote);

        // Selection
        DOM.selectBtn.addEventListener('click', toggleSelectionMode);
        document.addEventListener('click', function(e) {
            const msgEl = e.target.closest('.message');
            if (msgEl && selectionMode) {
                const msgId = msgEl.dataset.msgId;
                if (msgId) toggleMessageSelection(msgId);
            }
        });

        // Selection toolbar
        DOM.deleteSelectedBtn.addEventListener('click', () => DOM.deleteModal.classList.add('active'));
        DOM.pinSelectedBtn.addEventListener('click', pinSelectedMessages);
        DOM.cancelSelectionBtn.addEventListener('click', clearSelection);

        // Delete modal
        DOM.deleteForMeBtn.addEventListener('click', () => deleteSelectedMessages(false));
        DOM.deleteForEveryoneBtn.addEventListener('click', () => deleteSelectedMessages(true));
        DOM.deleteModalClose.addEventListener('click', () => DOM.deleteModal.classList.remove('active'));

        // Pinned dock
        DOM.unpinBtn.addEventListener('click', function() {
            const chatKey = getChatKey(state.currentUser?.username, state.currentChatPartner);
            if (chatKey) {
                const pinnedMessages = JSON.parse(localStorage.getItem('vvn_pinned') || '{}');
                if (pinnedMessages[chatKey]) {
                    pinnedMessages[chatKey].pop();
                    if (pinnedMessages[chatKey].length === 0) {
                        delete pinnedMessages[chatKey];
                        DOM.pinnedDock.style.display = 'none';
                    } else {
                        DOM.pinnedMessagePreview.textContent = 
                            `${pinnedMessages[chatKey][pinnedMessages[chatKey].length-1].sender}: ${pinnedMessages[chatKey][pinnedMessages[chatKey].length-1].text || '📎 File'}`;
                    }
                    localStorage.setItem('vvn_pinned', JSON.stringify(pinnedMessages));
                }
            }
        });

        // User settings
        DOM.userSettingsBtn.addEventListener('click', () => DOM.userSettingsModal.classList.add('active'));
        DOM.userSettingsClose.addEventListener('click', () => DOM.userSettingsModal.classList.remove('active'));
        DOM.renameContactBtn.addEventListener('click', renameContact);
        DOM.deleteContactBtn.addEventListener('click', deleteContact);
        DOM.blockUserBtn.addEventListener('click', blockUser);
        DOM.unblockUserBtn.addEventListener('click', unblockUser);
        DOM.pinContactBtn.addEventListener('click', pinContact);

        // Chat settings
        DOM.chatSettingsBtn.addEventListener('click', () => DOM.chatSettingsModal.classList.add('active'));
        DOM.chatSettingsClose.addEventListener('click', () => DOM.chatSettingsModal.classList.remove('active'));
        document.querySelectorAll('.bubble-style').forEach(btn => {
            btn.addEventListener('click', function() {
                changeBubbleStyle(this.dataset.style);
            });
        });
        DOM.bgDefault.addEventListener('click', () => {
            DOM.chatMessages.style.background = '';
            DOM.chatMessages.style.backgroundImage = '';
            localStorage.removeItem('vvn_bg_image');
        });
        DOM.bgCustom.addEventListener('click', () => DOM.bgUpload.click());
        DOM.bgUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    DOM.chatMessages.style.backgroundImage = `url(${ev.target.result})`;
                    DOM.chatMessages.style.backgroundSize = 'cover';
                    DOM.chatMessages.style.backgroundPosition = 'center';
                    localStorage.setItem('vvn_bg_image', ev.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        DOM.createNoteBtn.addEventListener('click', function() {
            const note = prompt('Enter your note:');
            if (note && note.trim()) {
                const notes = JSON.parse(localStorage.getItem('vvn_notes') || '[]');
                notes.push({ id: Date.now(), text: note.trim(), created: Date.now() });
                localStorage.setItem('vvn_notes', JSON.stringify(notes));
                alert('Note saved!');
            }
        });

        // Theme cards
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', function() {
                const theme = this.dataset.theme;
                applyTheme(theme);
                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                if (theme === 'custom') {
                    document.getElementById('customThemeOptions').style.display = 'block';
                } else {
                    document.getElementById('customThemeOptions').style.display = 'none';
                }
            });
        });

        // Custom theme
        DOM.applyCustomTheme.addEventListener('click', function() {
            const primary = DOM.primaryColor.value;
            const secondary = DOM.secondaryColor.value;
            const text = DOM.textColor.value;
            const accent = DOM.accentColor.value;
            
            const root = document.documentElement;
            root.style.setProperty('--dark-purple', primary);
            root.style.setProperty('--bg-secondary', secondary);
            root.style.setProperty('--text-primary', text);
            root.style.setProperty('--accent', accent);
            
            localStorage.setItem('vvn_custom_theme', JSON.stringify({ primary, secondary, text, accent }));
            alert('Custom theme applied!');
        });

        // File attachment
        DOM.clipBtn.addEventListener('click', () => DOM.fileModal.classList.add('active'));
        DOM.fileModalClose.addEventListener('click', () => DOM.fileModal.classList.remove('active'));
        DOM.fileSelectBtn.addEventListener('click', () => DOM.fileInput.click());
        DOM.fileInput.addEventListener('change', handleFileInput);
        DOM.fileClearBtn.addEventListener('click', function() {
            pendingFiles = [];
            DOM.filePreviewContainer.innerHTML = '';
            this.style.display = 'none';
        });
        DOM.fileSendBtn.addEventListener('click', sendFiles);

        // Dropdown
        DOM.dropdownToggle.addEventListener('click', toggleDropdown);
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                DOM.dropdownMenu.classList.remove('active');
            }
        });
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                handleDropdownAction(this.dataset.action);
            });
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', function() {
                this.parentElement.classList.remove('active');
            });
        });

        // Resize
        window.addEventListener('resize', function() {
            const width = window.innerWidth;
            if (width < 768 && state.deviceType !== 'mobile') {
                // Suggest switching to mobile
            }
        });

        console.log('🚀 VVN Messenger started!');
        console.log('👤 Default owner: vaultnet');
        console.log('🔐 Password: admin123');
    }

    // ---------- SAVE SETTINGS ----------
    async function saveSettings() {
        const user = state.currentUser;
        if (!user) return;

        const displayName = DOM.settingsDisplayName.value.trim() || user.username;
        const username = DOM.settingsUsername.value.trim();
        const password = DOM.settingsPassword.value.trim();
        const bio = DOM.settingsBio.value.trim();

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
            DOM.settingsModal.classList.remove('active');
            alert('Settings saved successfully!');
        }
    }

    // ---------- SHOW PROFILE ----------
    function showProfile(user) {
        if (!user) return;

        const tags = getUserTags(user.username);
        DOM.profileTags.innerHTML = tags.map(t =>
            `<span class="tag ${t.class}">${t.label}</span>`
        ).join('');

        DOM.profileDisplayName.textContent = user.displayName || user.username;
        DOM.profileUsername.textContent = '@' + user.username;
        DOM.profileBio.textContent = user.bio || 'No bio yet';
        DOM.profileJoined.textContent = 'Joined: ' + formatDate(user.created || Date.now());
        DOM.profileAge.textContent = 'Age: ' + getAge(user.created || Date.now());
        DOM.profileAvatar.src = user.avatar || 'icons/user.png';
        DOM.profileUserID.textContent = 'ID: ' + user.username + '-' + (user.created || '').toString().slice(-6);

        if (state.settings.devMode && CONFIG.DEV_PIN) {
            const pinCheck = prompt('Enter developer PIN to view password:');
            if (pinCheck === CONFIG.DEV_PIN) {
                DOM.profilePassword.style.display = 'block';
                DOM.profilePassword.textContent = 'Password: ' + user.password;
            }
        } else {
            DOM.profilePassword.style.display = 'none';
        }

        DOM.profileModal.classList.add('active');
    }

    // Start app
    init();
})();
