// script.js - Complete functionality for The Advanced Learning Collective

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = null;
let uploadedFiles = [];
let currentFilter = 'all';
let learningFiles = [];
let currentLearningFilter = 'all';
let pathwaysFiles = [];
let currentPathwaysFilter = 'all';

// ============================================
// 1. AUTHENTICATION SYSTEM
// ============================================

function switchAccessTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const createForm = document.getElementById('createForm');
    const loginTab = document.getElementById('loginTab');
    const createTab = document.getElementById('createTab');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        createForm.style.display = 'none';
        loginTab.classList.add('active');
        createTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        createForm.style.display = 'block';
        loginTab.classList.remove('active');
        createTab.classList.add('active');
    }
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    const accounts = getAccounts();
    const found = accounts.find(acc => 
        (acc.username === username || acc.email === username) && acc.password === password
    );
    
    if (found) {
        currentUser = found;
        localStorage.setItem('currentUser', JSON.stringify(found));
        showNotification(`✅ Welcome back, ${found.username}!`, 'success');
        
        if (found.accountType === 'admin') {
            setTimeout(() => window.location.href = 'resources.html', 1500);
        } else {
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    } else {
        showNotification('❌ Invalid username or password', 'error');
    }
}

function handleCreateAccount() {
    const username = document.getElementById('createUsername').value.trim();
    const email = document.getElementById('createEmail').value.trim();
    const password = document.getElementById('createPassword').value.trim();
    const confirm = document.getElementById('createConfirm').value.trim();
    const accountType = document.querySelector('input[name="accountType"]:checked');
    
    if (!username || !email || !password || !confirm) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!accountType) {
        showNotification('Please select an account type', 'error');
        return;
    }
    
    const accounts = getAccounts();
    if (accounts.find(acc => acc.username === username)) {
        showNotification('Username already exists', 'error');
        return;
    }
    if (accounts.find(acc => acc.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    const newAccount = {
        username: username,
        email: email,
        password: password,
        accountType: accountType.value,
        created: new Date().toISOString()
    };
    
    accounts.push(newAccount);
    saveAccounts(accounts);
    saveAllAccountsToFile(accounts);
    
    showNotification(`✅ Account created successfully as ${accountType.value}!`, 'success');
    
    document.getElementById('createUsername').value = '';
    document.getElementById('createEmail').value = '';
    document.getElementById('createPassword').value = '';
    document.getElementById('createConfirm').value = '';
    
    setTimeout(() => {
        switchAccessTab('login');
        showNotification('Please login with your new account', 'info');
    }, 1500);
}

function getAccounts() {
    const data = localStorage.getItem('alcAccounts');
    if (data) {
        return JSON.parse(data);
    }
    return loadAccountsFromFile();
}

function saveAccounts(accounts) {
    localStorage.setItem('alcAccounts', JSON.stringify(accounts));
}

function loadAccountsFromFile() {
    const fileData = localStorage.getItem('accountsFileData');
    if (fileData) {
        try {
            const lines = fileData.split('\n');
            const accounts = [];
            let currentAccount = {};
            
            for (let line of lines) {
                line = line.trim();
                if (line === '================================') {
                    if (currentAccount.username) {
                        accounts.push(currentAccount);
                        currentAccount = {};
                    }
                    continue;
                }
                if (line.includes(':')) {
                    const [key, value] = line.split(':').map(s => s.trim());
                    if (key === 'Username') currentAccount.username = value;
                    else if (key === 'Email') currentAccount.email = value;
                    else if (key === 'Password') currentAccount.password = value;
                    else if (key === 'Account Type') currentAccount.accountType = value;
                    else if (key === 'Created') currentAccount.created = value;
                }
            }
            
            if (currentAccount.username) {
                accounts.push(currentAccount);
            }
            
            if (accounts.length > 0) {
                localStorage.setItem('alcAccounts', JSON.stringify(accounts));
                return accounts;
            }
        } catch (e) {
            console.log('Error parsing accounts file:', e);
        }
    }
    return [];
}

function saveAllAccountsToFile(accounts) {
    let fileContent = '';
    accounts.forEach(account => {
        fileContent += `================================\n`;
        fileContent += `NEW ACCOUNT CREATED\n`;
        fileContent += `================================\n`;
        fileContent += `Username: ${account.username}\n`;
        fileContent += `Email: ${account.email}\n`;
        fileContent += `Password: ${account.password}\n`;
        fileContent += `Account Type: ${account.accountType}\n`;
        fileContent += `Created: ${account.created}\n`;
        fileContent += `================================\n\n`;
    });
    
    localStorage.setItem('accountsFileData', fileContent);
    console.log('Accounts saved to accounts/accounts.txt');
    console.log('Total accounts:', accounts.length);
}

// ============================================
// 2. FILE MANAGEMENT SYSTEM (Resources)
// ============================================

function showUploadModal() {
    if (!currentUser || currentUser.accountType !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }
    document.getElementById('uploadModal').style.display = 'flex';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const fileType = document.getElementById('fileType').value;
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const fileData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: file.name,
            type: fileType,
            size: file.size,
            mimeType: file.type,
            data: e.target.result,
            uploadedBy: currentUser.username,
            uploadedAt: new Date().toISOString()
        };
        
        const files = getFiles();
        files.push(fileData);
        saveFiles(files);
        
        closeUploadModal();
        showNotification(`✅ "${file.name}" uploaded successfully!`, 'success');
        loadFileList(currentFilter);
        
        document.getElementById('fileInput').value = '';
    };
    
    reader.readAsDataURL(file);
}

function getFiles() {
    const data = localStorage.getItem('alcFiles');
    return data ? JSON.parse(data) : [];
}

function saveFiles(files) {
    localStorage.setItem('alcFiles', JSON.stringify(files));
}

function deleteFile(fileId) {
    if (!currentUser || currentUser.accountType !== 'admin') {
        showNotification('Admin access required to delete files', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    let files = getFiles();
    files = files.filter(f => f.id !== fileId);
    saveFiles(files);
    showNotification('File deleted successfully', 'success');
    loadFileList(currentFilter);
}

function filterFiles(category) {
    currentFilter = category;
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim() === category || (category === 'all' && tab.textContent.trim() === 'All Resources')) {
            tab.classList.add('active');
        }
    });
    
    loadFileList(category);
    
    const defaultGrid = document.getElementById('defaultResourceGrid');
    if (defaultGrid) {
        const files = getFiles();
        const filteredFiles = category === 'all' ? files : files.filter(f => f.type === category);
        if (filteredFiles.length === 0 && files.length === 0) {
            defaultGrid.style.display = 'grid';
        } else {
            defaultGrid.style.display = 'none';
        }
    }
}

function loadFileList(category = 'all') {
    const fileList = document.getElementById('fileList');
    const noFiles = document.getElementById('noFiles');
    const defaultGrid = document.getElementById('defaultResourceGrid');
    
    if (!fileList) return;
    
    const files = getFiles();
    const filteredFiles = category === 'all' ? files : files.filter(f => f.type === category);
    
    if (filteredFiles.length === 0) {
        if (noFiles) {
            noFiles.style.display = 'block';
            noFiles.textContent = category === 'all' ? 'No files uploaded yet. Upload a file to get started!' : `No files in "${category}" category yet.`;
        }
        fileList.innerHTML = '';
        if (defaultGrid && files.length === 0) {
            defaultGrid.style.display = 'grid';
        } else if (defaultGrid) {
            defaultGrid.style.display = 'none';
        }
        return;
    }
    
    if (noFiles) noFiles.style.display = 'none';
    if (defaultGrid) defaultGrid.style.display = 'none';
    
    fileList.innerHTML = filteredFiles.map(file => `
        <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #eef2f6; transition: 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                <div style="font-size: 2rem; color: var(--primary-accent);">
                    <i class="${getFileIcon(file.mimeType)}"></i>
                </div>
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px;">${escapeHtml(file.name)}</h4>
                    <span class="resource-tag">${escapeHtml(file.type)}</span>
                    <span style="font-size: 0.7rem; color: var(--text-soft); margin-left: 8px;">${formatFileSize(file.size)}</span>
                </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="viewFile('${file.id}')" style="padding: 6px 16px; background: var(--primary-light); color: var(--primary-accent); border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    <i class="fas fa-eye"></i> View
                </button>
                <button onclick="downloadFile('${file.id}')" style="padding: 6px 16px; background: var(--primary-light); color: var(--primary-accent); border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    <i class="fas fa-download"></i> Download
                </button>
                ${currentUser && currentUser.accountType === 'admin' ? `
                    <button onclick="deleteFile('${file.id}')" style="padding: 6px 16px; background: #fee; color: #dc3545; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-soft); margin-top: 8px;">
                Uploaded by ${escapeHtml(file.uploadedBy)} on ${new Date(file.uploadedAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

function viewFile(fileId) {
    const files = getFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const win = window.open('', '_blank');
    if (file.mimeType && file.mimeType.includes('image')) {
        win.document.write(`<img src="${file.data}" style="max-width: 100%; margin: 20px auto; display: block;">`);
    } else if (file.mimeType && file.mimeType.includes('pdf')) {
        win.document.write(`<embed src="${file.data}" width="100%" height="100%" type="application/pdf">`);
    } else {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('File downloaded', 'success');
    }
}

function downloadFile(fileId) {
    const files = getFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Downloading...', 'success');
}

function getFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('doc')) return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'fa-file-excel';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('text')) return 'fa-file-alt';
    return 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 2B. LEARNING FILE MANAGEMENT SYSTEM
// ============================================

function showLearningUploadModal() {
    if (!currentUser || currentUser.accountType !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }
    document.getElementById('learningUploadModal').style.display = 'flex';
}

function closeLearningUploadModal() {
    document.getElementById('learningUploadModal').style.display = 'none';
}

function uploadLearningFile() {
    const fileInput = document.getElementById('learningFileInput');
    const fileType = document.getElementById('learningFileType').value;
    const title = document.getElementById('learningFileTitle').value.trim();
    const description = document.getElementById('learningFileDesc').value.trim();
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const fileData = {
            id: 'learn_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: file.name,
            title: title,
            description: description || 'No description provided',
            type: fileType,
            size: file.size,
            mimeType: file.type,
            data: e.target.result,
            uploadedBy: currentUser.username,
            uploadedAt: new Date().toISOString()
        };
        
        const files = getLearningFiles();
        files.push(fileData);
        saveLearningFiles(files);
        
        closeLearningUploadModal();
        showNotification(`✅ "${title}" uploaded successfully!`, 'success');
        loadLearningFileList(currentLearningFilter);
        
        document.getElementById('learningFileInput').value = '';
        document.getElementById('learningFileTitle').value = '';
        document.getElementById('learningFileDesc').value = '';
    };
    
    reader.readAsDataURL(file);
}

function getLearningFiles() {
    const data = localStorage.getItem('alcLearningFiles');
    return data ? JSON.parse(data) : [];
}

function saveLearningFiles(files) {
    localStorage.setItem('alcLearningFiles', JSON.stringify(files));
}

function deleteLearningFile(fileId) {
    if (!currentUser || currentUser.accountType !== 'admin') {
        showNotification('Admin access required to delete files', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this learning resource?')) return;
    
    let files = getLearningFiles();
    files = files.filter(f => f.id !== fileId);
    saveLearningFiles(files);
    showNotification('Learning resource deleted successfully', 'success');
    loadLearningFileList(currentLearningFilter);
}

function filterLearningFiles(category) {
    currentLearningFilter = category;
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim() === category || (category === 'all' && tab.textContent.trim() === 'All Resources')) {
            tab.classList.add('active');
        }
    });
    
    loadLearningFileList(category);
    
    const defaultGrid = document.getElementById('defaultLearningGrid');
    if (defaultGrid) {
        const files = getLearningFiles();
        const filteredFiles = category === 'all' ? files : files.filter(f => f.type === category);
        if (filteredFiles.length === 0 && files.length === 0) {
            defaultGrid.style.display = 'grid';
        } else {
            defaultGrid.style.display = 'none';
        }
    }
}

function loadLearningFileList(category = 'all') {
    const fileList = document.getElementById('learningFileList');
    const noFiles = document.getElementById('learningNoFiles');
    const defaultGrid = document.getElementById('defaultLearningGrid');
    
    if (!fileList) return;
    
    const files = getLearningFiles();
    const filteredFiles = category === 'all' ? files : files.filter(f => f.type === category);
    
    if (filteredFiles.length === 0) {
        if (noFiles) {
            noFiles.style.display = 'block';
            noFiles.textContent = category === 'all' ? 'No learning resources uploaded yet. Upload a resource to get started!' : `No resources in "${category}" category yet.`;
        }
        fileList.innerHTML = '';
        if (defaultGrid && files.length === 0) {
            defaultGrid.style.display = 'grid';
        } else if (defaultGrid) {
            defaultGrid.style.display = 'none';
        }
        return;
    }
    
    if (noFiles) noFiles.style.display = 'none';
    if (defaultGrid) defaultGrid.style.display = 'none';
    
    fileList.innerHTML = filteredFiles.map(file => `
        <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #eef2f6; transition: 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                <div style="font-size: 2rem; color: var(--primary-accent);">
                    <i class="${getLearningFileIcon(file.mimeType)}"></i>
                </div>
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px;">${escapeHtml(file.title)}</h4>
                    <span class="resource-tag">${escapeHtml(file.type)}</span>
                    <span style="font-size: 0.7rem; color: var(--text-soft); margin-left: 8px;">${formatFileSize(file.size)}</span>
                </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-soft); margin-bottom: 12px;">${escapeHtml(file.description)}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${isVideoFile(file.mimeType) ? `
                    <button onclick="playVideo('${file.id}')" style="padding: 6px 16px; background: var(--primary-accent); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-play"></i> Watch
                    </button>
                ` : `
                    <button onclick="viewLearningFile('${file.id}')" style="padding: 6px 16px; background: var(--primary-light); color: var(--primary-accent); border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-eye"></i> View
                    </button>
                `}
                <button onclick="downloadLearningFile('${file.id}')" style="padding: 6px 16px; background: var(--primary-light); color: var(--primary-accent); border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    <i class="fas fa-download"></i> Download
                </button>
                ${currentUser && currentUser.accountType === 'admin' ? `
                    <button onclick="deleteLearningFile('${file.id}')" style="padding: 6px 16px; background: #fee; color: #dc3545; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-soft); margin-top: 8px;">
                Uploaded by ${escapeHtml(file.uploadedBy)} on ${new Date(file.uploadedAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

function isVideoFile(mimeType) {
    if (!mimeType) return false;
    return mimeType.includes('video') || 
           mimeType.includes('mp4') || 
           mimeType.includes('webm') || 
           mimeType.includes('ogg') ||
           mimeType.includes('mov') ||
           mimeType.includes('avi');
}

function getLearningFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    if (isVideoFile(mimeType)) return 'fa-video';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('doc')) return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'fa-file-excel';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('text')) return 'fa-file-alt';
    return 'fa-file';
}

function playVideo(fileId) {
    const files = getLearningFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const modal = document.getElementById('videoPlayerModal');
    const video = document.getElementById('videoPlayer');
    const source = document.getElementById('videoSource');
    const title = document.getElementById('videoTitle');
    const desc = document.getElementById('videoDesc');
    
    source.src = file.data;
    source.type = file.mimeType || 'video/mp4';
    video.load();
    
    title.textContent = file.title;
    desc.textContent = file.description;
    
    modal.style.display = 'flex';
    video.play();
}

function closeVideoPlayer() {
    const modal = document.getElementById('videoPlayerModal');
    const video = document.getElementById('videoPlayer');
    video.pause();
    modal.style.display = 'none';
}

function viewLearningFile(fileId) {
    const files = getLearningFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const win = window.open('', '_blank');
    if (file.mimeType && file.mimeType.includes('image')) {
        win.document.write(`<img src="${file.data}" style="max-width: 100%; margin: 20px auto; display: block;">`);
    } else if (file.mimeType && file.mimeType.includes('pdf')) {
        win.document.write(`<embed src="${file.data}" width="100%" height="100%" type="application/pdf">`);
    } else {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('File downloaded', 'success');
    }
}

function downloadLearningFile(fileId) {
    const files = getLearningFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Downloading...', 'success');
}

// ============================================
// 2C. PATHWAYS FILE MANAGEMENT SYSTEM
// ============================================

function showPathwaysUploadModal() {
    if (!currentUser || currentUser.accountType !== 'admin') {
        showNotification('Admin access required', 'error');
        return;
    }
    document.getElementById('pathwaysUploadModal').style.display = 'flex';
}

function closePathwaysUploadModal() {
    document.getElementById('pathwaysUploadModal').style.display = 'none';
}

function uploadPathwaysFile() {
    const fileInput = document.getElementById('pathwaysFileInput');
    const fileType = document.getElementById('pathwaysFileType').value;
    const title = document.getElementById('pathwaysFileTitle').value.trim();
    const description = document.getElementById('pathwaysFileDesc').value.trim();
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showNotification('Please select a file to upload', 'error');
        return;
    }
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const fileData = {
            id: 'path_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: file.name,
            title: title,
            description: description || 'No description provided',
            type: fileType,
            size: file.size,
            mimeType: file.type,
            data: e.target.result,
            uploadedBy: currentUser.username,
            uploadedAt: new Date().toISOString()
        };
        
        const files = getPathwaysFiles();
        files.push(fileData);
        savePathwaysFiles(files);
        
        closePathwaysUploadModal();
        showNotification(`✅ "${title}" uploaded successfully!`, 'success');
        loadPathwaysFileList(currentPathwaysFilter);
        
        document.getElementById('pathwaysFileInput').value = '';
        document.getElementById('pathwaysFileTitle').value = '';
        document.getElementById('pathwaysFileDesc').value = '';
    };
    
    reader.readAsDataURL(file);
}

function getPathwaysFiles() {
    const data = localStorage.getItem('alcPathwaysFiles');
    return data ? JSON.parse(data) : [];
}

function savePathwaysFiles(files) {
    localStorage.setItem('alcPathwaysFiles', JSON.stringify(files));
}

function deletePathwaysFile(fileId) {
    if (!currentUser || currentUser.accountType !== 'admin') {
        showNotification('Admin access required to delete files', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this pathway resource?')) return;
    
    let files = getPathwaysFiles();
    files = files.filter(f => f.id !== fileId);
    savePathwaysFiles(files);
    showNotification('Pathway resource deleted successfully', 'success');
    loadPathwaysFileList(currentPathwaysFilter);
}

function filterPathwaysFiles(category) {
    currentPathwaysFilter = category;
    
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim() === category || (category === 'all' && tab.textContent.trim() === 'All Pathways')) {
            tab.classList.add('active');
        }
    });
    
    loadPathwaysFileList(category);
    
    const defaultGrid = document.getElementById('defaultPathwaysGrid');
    if (defaultGrid) {
        const files = getPathwaysFiles();
        const filteredFiles = category === 'all' ? files : files.filter(f => f.type === category);
        if (filteredFiles.length === 0 && files.length === 0) {
            defaultGrid.style.display = 'grid';
        } else {
            defaultGrid.style.display = 'none';
        }
    }
}

function loadPathwaysFileList(category = 'all') {
    const fileList = document.getElementById('pathwaysFileList');
    const noFiles = document.getElementById('pathwaysNoFiles');
    const defaultGrid = document.getElementById('defaultPathwaysGrid');
    
    if (!fileList) return;
    
    const files = getPathwaysFiles();
    const filteredFiles = category === 'all' ? files : files.filter(f => f.type === category);
    
    if (filteredFiles.length === 0) {
        if (noFiles) {
            noFiles.style.display = 'block';
            noFiles.textContent = category === 'all' ? 'No pathway resources uploaded yet. Upload a resource to get started!' : `No resources in "${category}" category yet.`;
        }
        fileList.innerHTML = '';
        if (defaultGrid && files.length === 0) {
            defaultGrid.style.display = 'grid';
        } else if (defaultGrid) {
            defaultGrid.style.display = 'none';
        }
        return;
    }
    
    if (noFiles) noFiles.style.display = 'none';
    if (defaultGrid) defaultGrid.style.display = 'none';
    
    fileList.innerHTML = filteredFiles.map(file => `
        <div style="background: white; border-radius: 16px; padding: 20px; border: 1px solid #eef2f6; transition: 0.2s;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                <div style="font-size: 2rem; color: var(--primary-accent);">
                    <i class="${getPathwaysFileIcon(file.mimeType)}"></i>
                </div>
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px;">${escapeHtml(file.title)}</h4>
                    <span class="resource-tag">${escapeHtml(file.type)}</span>
                    <span style="font-size: 0.7rem; color: var(--text-soft); margin-left: 8px;">${formatFileSize(file.size)}</span>
                </div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-soft); margin-bottom: 12px;">${escapeHtml(file.description)}</p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="viewPathwaysFile('${file.id}')" style="padding: 6px 16px; background: var(--primary-light); color: var(--primary-accent); border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    <i class="fas fa-eye"></i> View
                </button>
                <button onclick="downloadPathwaysFile('${file.id}')" style="padding: 6px 16px; background: var(--primary-light); color: var(--primary-accent); border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    <i class="fas fa-download"></i> Download
                </button>
                ${currentUser && currentUser.accountType === 'admin' ? `
                    <button onclick="deletePathwaysFile('${file.id}')" style="padding: 6px 16px; background: #fee; color: #dc3545; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-soft); margin-top: 8px;">
                Uploaded by ${escapeHtml(file.uploadedBy)} on ${new Date(file.uploadedAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

function getPathwaysFileIcon(mimeType) {
    if (!mimeType) return 'fa-file';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('doc')) return 'fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'fa-file-excel';
    if (mimeType.includes('image')) return 'fa-file-image';
    if (mimeType.includes('text')) return 'fa-file-alt';
    return 'fa-file';
}

function viewPathwaysFile(fileId) {
    const files = getPathwaysFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const win = window.open('', '_blank');
    if (file.mimeType && file.mimeType.includes('image')) {
        win.document.write(`<img src="${file.data}" style="max-width: 100%; margin: 20px auto; display: block;">`);
    } else if (file.mimeType && file.mimeType.includes('pdf')) {
        win.document.write(`<embed src="${file.data}" width="100%" height="100%" type="application/pdf">`);
    } else {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('File downloaded', 'success');
    }
}

function downloadPathwaysFile(fileId) {
    const files = getPathwaysFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) {
        showNotification('File not found', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Downloading...', 'success');
}

// ============================================
// 3. USER INTERFACE UPDATES
// ============================================

function checkAuth() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
        currentUser = JSON.parse(stored);
        updateUIForLoggedInUser();
        return true;
    }
    return false;
}

function updateUIForLoggedInUser() {
    const greetingElements = document.querySelectorAll('#userGreeting');
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    
    greetingElements.forEach(el => {
        el.style.display = 'inline';
        el.textContent = `👋 ${currentUser.username}`;
    });
    
    logoutButtons.forEach(el => {
        el.style.display = 'inline-block';
    });
    
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome, ${currentUser.username}! • ${currentUser.accountType === 'admin' ? '🔑 Admin' : '👤 Standard'} User`;
    }
    
    if (currentUser && currentUser.accountType === 'admin') {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) adminControls.style.display = 'block';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'info');
    
    const greetingElements = document.querySelectorAll('#userGreeting');
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    greetingElements.forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    logoutButtons.forEach(el => {
        el.style.display = 'none';
    });
    
    const adminControls = document.getElementById('adminControls');
    if (adminControls) adminControls.style.display = 'none';
    
    setTimeout(() => window.location.href = 'index.html', 1000);
}

// ============================================
// 4. SEARCH FUNCTIONALITY
// ============================================

function performSearch(query) {
    if (!query) {
        showNotification('Please enter a search term', 'info');
        return;
    }
    
    const results = searchAllResources(query);
    if (results.length > 0) {
        showNotification(`Found ${results.length} results for "${query}"`, 'success');
    } else {
        showNotification(`No results found for "${query}"`, 'info');
    }
}

// ============================================
// 4B. GLOBAL SEARCH WITH AUTOCOMPLETE
// ============================================

function performGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('Please enter a search term', 'info');
        return;
    }
    
    const results = searchAllResources(query);
    displaySearchResults(results, query);
}

function searchAllResources(query) {
    const searchTerm = query.toLowerCase().trim();
    const allResults = [];
    
    // Search Resources
    const resources = getFiles();
    resources.forEach(file => {
        const match = file.name.toLowerCase().includes(searchTerm) || 
                     file.type.toLowerCase().includes(searchTerm);
        if (match) {
            allResults.push({
                title: file.name,
                description: file.type,
                type: 'Resource',
                page: 'resources.html',
                icon: getFileIcon(file.mimeType),
                id: file.id,
                category: 'resource'
            });
        }
    });
    
    // Search Learning Resources
    const learning = getLearningFiles();
    learning.forEach(file => {
        const match = file.title.toLowerCase().includes(searchTerm) || 
                     file.description.toLowerCase().includes(searchTerm) ||
                     file.name.toLowerCase().includes(searchTerm);
        if (match) {
            allResults.push({
                title: file.title,
                description: file.description,
                type: 'Learning',
                page: 'learn.html',
                icon: getLearningFileIcon(file.mimeType),
                id: file.id,
                category: 'learning'
            });
        }
    });
    
    // Search Pathways Resources
    const pathways = getPathwaysFiles();
    pathways.forEach(file => {
        const match = file.title.toLowerCase().includes(searchTerm) || 
                     file.description.toLowerCase().includes(searchTerm) ||
                     file.name.toLowerCase().includes(searchTerm);
        if (match) {
            allResults.push({
                title: file.title,
                description: file.description,
                type: 'Pathway',
                page: 'paths.html',
                icon: getPathwaysFileIcon(file.mimeType),
                id: file.id,
                category: 'pathway'
            });
        }
    });
    
    // Add static content matches
    const staticContent = [
        { title: 'Depth & Complexity Framework', description: 'Complete guide with icons and lesson plans', type: 'Resource', page: 'resources.html', icon: 'fa-layer-group' },
        { title: 'Gifted Program Monitoring Toolkit', description: 'Compliance checklists and reporting templates', type: 'Resource', page: 'resources.html', icon: 'fa-toolbox' },
        { title: 'Differentiation Strategies', description: '50+ strategies for advanced learners', type: 'Resource', page: 'resources.html', icon: 'fa-chalkboard-teacher' },
        { title: 'PBL Unit Planner', description: 'Templates for project-based learning design', type: 'Resource', page: 'resources.html', icon: 'fa-project-diagram' },
        { title: 'Family Engagement Guide', description: 'Workshop plans and communication tools', type: 'Resource', page: 'resources.html', icon: 'fa-users' },
        { title: 'Leadership Briefs Collection', description: 'One-page summaries for administrators', type: 'Resource', page: 'resources.html', icon: 'fa-file-alt' },
        { title: 'On-Demand Modules', description: 'Self-paced learning for differentiation and depth & complexity', type: 'Learning', page: 'learn.html', icon: 'fa-video' },
        { title: 'Live Workshop Recordings', description: 'Access past session videos and materials', type: 'Learning', page: 'learn.html', icon: 'fa-video' },
        { title: 'Book Study Resources', description: 'Guides for professional book discussions', type: 'Learning', page: 'learn.html', icon: 'fa-book' },
        { title: 'Micro-Learning Videos', description: 'Short strategy demonstrations', type: 'Learning', page: 'learn.html', icon: 'fa-video' },
        { title: 'Implementation Guides', description: 'Step-by-step for applying learning in classrooms', type: 'Learning', page: 'learn.html', icon: 'fa-book' },
        { title: 'Certification Pathways', description: 'Track professional growth and completion', type: 'Learning', page: 'learn.html', icon: 'fa-certificate' }
    ];
    
    staticContent.forEach(content => {
        const match = content.title.toLowerCase().includes(searchTerm) || 
                     content.description.toLowerCase().includes(searchTerm);
        if (match) {
            allResults.push({
                title: content.title,
                description: content.description,
                type: content.type,
                page: content.page,
                icon: content.icon,
                id: null,
                category: 'static'
            });
        }
    });
    
    return allResults;
}

function displaySearchResults(results, query) {
    const dropdown = document.getElementById('searchDropdown');
    const resultsList = document.getElementById('searchResultsList');
    
    if (!dropdown || !resultsList) return;
    
    if (results.length === 0) {
        resultsList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-soft);">
                <i class="fas fa-search" style="font-size: 1.5rem; display: block; margin-bottom: 8px;"></i>
                No results found for "<strong>${escapeHtml(query)}</strong>"
            </div>
        `;
        dropdown.style.display = 'block';
        return;
    }
    
    // Group results by type
    const groupedResults = {
        'Resource': [],
        'Learning': [],
        'Pathway': []
    };
    
    results.forEach(result => {
        if (groupedResults[result.type]) {
            groupedResults[result.type].push(result);
        }
    });
    
    let html = '';
    
    // Add results grouped by type
    Object.keys(groupedResults).forEach(type => {
        if (groupedResults[type].length > 0) {
            html += `
                <div style="padding: 8px 16px; background: var(--gray-light); font-weight: 600; font-size: 0.75rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px;">
                    ${type}s
                </div>
            `;
            
            groupedResults[type].forEach(result => {
                html += `
                    <div class="search-result-item" onclick="navigateToResult('${result.page}', '${result.id || ''}', '${result.category}')" 
                         style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; border-bottom: 1px solid var(--gray-light); transition: 0.2s;">
                        <div style="font-size: 1.5rem; color: var(--primary-accent); width: 40px; text-align: center;">
                            <i class="fas ${result.icon}"></i>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: var(--text-dark);">${highlightText(result.title, query)}</div>
                            <div style="font-size: 0.85rem; color: var(--text-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${highlightText(result.description, query)}
                            </div>
                        </div>
                        <div style="font-size: 0.7rem; color: var(--text-soft); background: var(--gray-light); padding: 4px 12px; border-radius: 12px; white-space: nowrap;">
                            ${result.type}
                        </div>
                    </div>
                `;
            });
        }
    });
    
    resultsList.innerHTML = html;
    dropdown.style.display = 'block';
}

function highlightText(text, query) {
    if (!text) return '';
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span style="background: var(--gold-accent); padding: 0 4px; border-radius: 4px; font-weight: 600;">$1</span>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function navigateToResult(page, id, category) {
    // Close dropdown
    const dropdown = document.getElementById('searchDropdown');
    const searchInput = document.getElementById('globalSearch');
    if (dropdown) dropdown.style.display = 'none';
    if (searchInput) searchInput.value = '';
    
    if (id && category) {
        // Navigate to the specific page and scroll to the item
        window.location.href = page;
        // Store the ID to highlight after page load
        sessionStorage.setItem('highlightItem', id);
        sessionStorage.setItem('highlightCategory', category);
    } else {
        window.location.href = page;
    }
}

// Function to highlight items on page load
function highlightSearchResult() {
    const highlightId = sessionStorage.getItem('highlightItem');
    const highlightCategory = sessionStorage.getItem('highlightCategory');
    
    if (highlightId && highlightCategory) {
        // Clear the session storage
        sessionStorage.removeItem('highlightItem');
        sessionStorage.removeItem('highlightCategory');
        
        // Wait for the page to fully load
        setTimeout(() => {
            let items;
            if (highlightCategory === 'resource') {
                items = document.querySelectorAll('#fileList > div');
            } else if (highlightCategory === 'learning') {
                items = document.querySelectorAll('#learningFileList > div');
            } else if (highlightCategory === 'pathway') {
                items = document.querySelectorAll('#pathwaysFileList > div');
            }
            
            if (items && items.length > 0) {
                items.forEach(item => {
                    // Check if the item contains the ID
                    if (item.innerHTML.includes(highlightId)) {
                        item.style.border = '3px solid var(--gold-accent)';
                        item.style.boxShadow = '0 0 20px rgba(230, 177, 46, 0.3)';
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        showNotification('🔍 Found your search result!', 'success');
                    }
                });
            } else {
                // If items not found, show a notification
                showNotification('🔍 Search result found! Check the page for highlighted items.', 'success');
            }
        }, 500);
    }
}

// ============================================
// 4C. SEARCH DROPDOWN EVENTS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Original DOMContentLoaded code - search buttons
    const searchButtons = document.querySelectorAll('.search-box button');
    const searchInputs = document.querySelectorAll('.search-box input');
    
    searchButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const input = searchInputs[index];
            if (input && input.value.trim() !== '') {
                performSearch(input.value.trim());
            } else {
                showNotification('Please enter a search term', 'info');
            }
        });
    });
    
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const button = this.parentElement.querySelector('button');
                if (button) button.click();
            }
        });
    });
    
    // Global search with autocomplete
    const searchInput = document.getElementById('globalSearch');
    const searchDropdown = document.getElementById('searchDropdown');
    
    if (searchInput && searchDropdown) {
        // Show dropdown on input
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length >= 2) {
                const results = searchAllResources(query);
                displaySearchResults(results, query);
            } else if (query.length === 0) {
                searchDropdown.style.display = 'none';
            } else {
                // Show "type more" message for short queries
                const resultsList = document.getElementById('searchResultsList');
                if (resultsList) {
                    resultsList.innerHTML = `
                        <div style="padding: 20px; text-align: center; color: var(--text-soft);">
                            <i class="fas fa-keyboard" style="font-size: 1.5rem; display: block; margin-bottom: 8px;"></i>
                            Type at least 2 characters to search
                        </div>
                    `;
                }
                searchDropdown.style.display = 'block';
            }
        });
        
        // Close dropdown on escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchDropdown.style.display = 'none';
                this.blur();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-box')) {
                searchDropdown.style.display = 'none';
            }
        });
        
        // Handle enter key for search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performGlobalSearch();
                searchDropdown.style.display = 'none';
            }
        });
    }
    
    // Check auth on page load
    checkAuth();
    
    // Load files on respective pages
    if (window.location.pathname.includes('resources.html')) {
        loadFileList('all');
    }
    
    if (window.location.pathname.includes('learn.html')) {
        loadLearningFileList('all');
        if (currentUser && currentUser.accountType === 'admin') {
            const adminControls = document.getElementById('adminControls');
            if (adminControls) adminControls.style.display = 'block';
        }
    }
    
    if (window.location.pathname.includes('paths.html')) {
        loadPathwaysFileList('all');
        if (currentUser && currentUser.accountType === 'admin') {
            const adminControls = document.getElementById('adminControls');
            if (adminControls) adminControls.style.display = 'block';
        }
    }
    
    // Check for search highlight on page load
    highlightSearchResult();
});

// ============================================
// 5. NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-popup');
    if (existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    
    let bgColor = '#2c7da0';
    let icon = 'fa-info-circle';
    
    switch(type) {
        case 'success':
            bgColor = '#28a745';
            icon = 'fa-check-circle';
            break;
        case 'error':
            bgColor = '#dc3545';
            icon = 'fa-exclamation-circle';
            break;
        case 'search':
            bgColor = '#0f2b3d';
            icon = 'fa-search';
            break;
        default:
            bgColor = '#2c7da0';
            icon = 'fa-info-circle';
    }
    
    popup.innerHTML = `
        <div style="background: ${bgColor}; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 12px; max-width: 500px; position: fixed; bottom: 30px; right: 30px; z-index: 9999; animation: slideUp 0.3s ease;">
            <i class="fas ${icon}" style="font-size: 1.4rem;"></i>
            <span style="flex: 1; font-size: 0.95rem;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; opacity: 0.7;">&times;</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentElement) popup.remove();
    }, 5000);
}

// ============================================
// 6. SLIDESHOW FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initSlideshow();
});

function initSlideshow() {
    const slidesContainer = document.getElementById('slideshowSlides');
    const dotsContainer = document.getElementById('slideDots');
    const prevBtn = document.getElementById('slidePrev');
    const nextBtn = document.getElementById('slideNext');
    
    if (!slidesContainer) return;
    
    const images = [
        { src: 'slidepics/slide1.jpg', alt: 'Gifted students collaborating on a project', title: 'Collaborative Learning', desc: 'Advanced learners working together to solve complex problems' },
        { src: 'slidepics/slide2.jpg', alt: 'Teacher guiding gifted students', title: 'Expert Instruction', desc: 'Differentiated teaching strategies for gifted learners' },
        { src: 'slidepics/slide3.jpg', alt: 'Students engaged in STEM activities', title: 'STEM Excellence', desc: 'Hands-on learning experiences for advanced students' },
        { src: 'slidepics/slide4.jpg', alt: 'Family engagement workshop', title: 'Family Partnership', desc: 'Building strong connections between home and school' },
        { src: 'slidepics/slide5.jpg', alt: 'Professional development session', title: 'Professional Growth', desc: 'Continuous learning for gifted education professionals' }
    ];
    
    let currentSlide = 0;
    let slideInterval;
    const intervalDuration = 5000;
    
    function buildSlides() {
        slidesContainer.innerHTML = '';
        
        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            
            const img = new Image();
            img.src = image.src;
            
            img.onload = function() {
                slide.innerHTML = `
                    <img src="${image.src}" alt="${image.alt}" loading="lazy">
                    <div class="slide-overlay">
                        <h3>${image.title}</h3>
                        <p>${image.desc}</p>
                    </div>
                `;
            };
            
            img.onerror = function() {
                slide.innerHTML = `
                    <div class="slide-placeholder">
                        <i class="fas fa-image"></i>
                        <p style="font-size: 1.2rem; font-weight: 600; margin-bottom: 8px;">${image.title}</p>
                        <p style="font-size: 0.85rem; opacity: 0.6;">${image.desc}</p>
                        <p style="font-size: 0.75rem; opacity: 0.4; margin-top: 12px;">📁 Add image: ${image.src}</p>
                    </div>
                `;
            };
            
            slidesContainer.appendChild(slide);
        });
        
        buildDots();
        updateSlides();
    }
    
    function buildDots() {
        dotsContainer.innerHTML = '';
        images.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `slide-dot ${index === 0 ? 'active' : ''}`;
            dot.dataset.index = index;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });
    }
    
    function updateSlides() {
        const slides = slidesContainer.querySelectorAll('.slide');
        const dots = dotsContainer.querySelectorAll('.slide-dot');
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    function goToSlide(index) {
        if (index < 0) {
            currentSlide = images.length - 1;
        } else if (index >= images.length) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        updateSlides();
        resetInterval();
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    function resetInterval() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalDuration);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') { prevSlide(); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { nextSlide(); e.preventDefault(); }
    });
    
    const slideshowWrapper = document.querySelector('.slideshow-wrapper');
    if (slideshowWrapper) {
        slideshowWrapper.addEventListener('mouseenter', () => {
            if (slideInterval) clearInterval(slideInterval);
        });
        slideshowWrapper.addEventListener('mouseleave', resetInterval);
    }
    
    buildSlides();
    resetInterval();
}

// ============================================
// 7. NAVIGATION LINK ACTIVE STATE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a, .footer a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.style.color = 'var(--primary-accent)';
            link.style.fontWeight = '700';
        }
    });
});

// ============================================
// 8. KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearch') || document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.focus();
            showNotification('🔍 Search activated. Type your query.', 'info');
        }
    }
    
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification-popup');
        notifications.forEach(n => n.remove());
        closeUploadModal();
        closeLearningUploadModal();
        closePathwaysUploadModal();
        closeVideoPlayer();
        
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
});

// ============================================
// 9. CONSOLE WELCOME
// ============================================

console.log('%c 🧠 The Advanced Learning Collective ', 'background: #0f2b3d; color: #e6b12e; font-size: 18px; font-weight: bold; padding: 12px 20px; border-radius: 8px;');
console.log('%c Advancing Minds, Advancing Practice ', 'color: #2c7da0; font-size: 14px; font-style: italic;');
console.log('%c 📚 Professional Learning & Resource Network ', 'color: #1a2c3e; font-size: 13px;');
console.log('%c 🔍 Use Ctrl+Shift+S to quickly search', 'color: #6c757d; font-size: 12px;');
console.log('%c 📁 Accounts saved to accounts/accounts.txt', 'color: #6c757d; font-size: 12px;');
console.log('%c 📁 Files are stored in localStorage for demo purposes', 'color: #6c757d; font-size: 12px;');

// ============================================
// 10. ADDITIONAL STYLES (injected dynamically)
// ============================================

const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .category-tab {
        padding: 8px 20px;
        background: var(--gray-light);
        border: 2px solid transparent;
        border-radius: 20px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 0.9rem;
        transition: 0.2s;
        color: var(--text-soft);
    }
    .category-tab:hover {
        border-color: var(--primary-accent);
        color: var(--primary-accent);
    }
    .category-tab.active {
        background: var(--primary-accent);
        color: white;
        border-color: var(--primary-accent);
    }
`;
document.head.appendChild(additionalStyles);
