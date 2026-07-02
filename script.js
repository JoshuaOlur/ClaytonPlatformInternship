// script.js - Complete functionality for The Advanced Learning Collective

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = null;
let uploadedFiles = [];
let currentFilter = 'all';

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
    // Try to load from localStorage first
    const data = localStorage.getItem('alcAccounts');
    if (data) {
        return JSON.parse(data);
    }
    // If no accounts in localStorage, try to load from accounts.txt
    return loadAccountsFromFile();
}

function saveAccounts(accounts) {
    localStorage.setItem('alcAccounts', JSON.stringify(accounts));
}

function loadAccountsFromFile() {
    // Check if accounts data exists in localStorage
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
    // Format all accounts for the text file
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
    
    // Store the file content in localStorage for demo
    // In a real server environment, this would write directly to accounts/accounts.txt
    localStorage.setItem('accountsFileData', fileContent);
    
    // Log to console for debugging
    console.log('Accounts saved to accounts/accounts.txt');
    console.log('Total accounts:', accounts.length);
}

// ============================================
// 2. FILE MANAGEMENT SYSTEM
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
    
    // Update active tab
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim() === category || (category === 'all' && tab.textContent.trim() === 'All Resources')) {
            tab.classList.add('active');
        }
    });
    
    loadFileList(category);
    
    // Hide/show default resource grid
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
    // Update greeting in navigation
    const greetingElements = document.querySelectorAll('#userGreeting');
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    
    greetingElements.forEach(el => {
        el.style.display = 'inline';
        el.textContent = `👋 ${currentUser.username}`;
    });
    
    logoutButtons.forEach(el => {
        el.style.display = 'inline-block';
    });
    
    // Update welcome message on resources page
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome, ${currentUser.username}! • ${currentUser.accountType === 'admin' ? '🔑 Admin' : '👤 Standard'} User`;
    }
    
    // Show admin controls if admin
    if (currentUser && currentUser.accountType === 'admin') {
        const adminControls = document.getElementById('adminControls');
        if (adminControls) adminControls.style.display = 'block';
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'info');
    
    // Reset UI
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

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Check auth on page load
    checkAuth();
    
    // Load file list on resources page
    if (window.location.pathname.includes('resources.html')) {
        loadFileList('all');
    }
});

function performSearch(query) {
    const searchResults = {
        'differentiation': 'Found 12 resources on differentiation for advanced learners',
        'gifted': 'Found 28 resources on gifted education',
        'depth': 'Found 8 resources on Depth & Complexity strategies',
        'complexity': 'Found 8 resources on Depth & Complexity strategies',
        'pbl': 'Found 15 resources on Project-Based Learning',
        'inquiry': 'Found 10 resources on Inquiry-Based Learning',
        'compliance': 'Found 7 resources on compliance and accountability',
        'identification': 'Found 9 resources on gifted identification',
        'family': 'Found 14 resources for families',
        'coaching': 'Found 11 resources for instructional coaches',
        'leadership': 'Found 16 resources for leadership'
    };
    
    let resultMessage = '';
    let found = false;
    
    for (let [key, message] of Object.entries(searchResults)) {
        if (query.toLowerCase().includes(key) || key.includes(query.toLowerCase())) {
            resultMessage = message;
            found = true;
            break;
        }
    }
    
    if (!found) {
        resultMessage = `Search results for "${query}": No exact matches found. Try: differentiation, gifted, depth, complexity, PBL, inquiry, compliance, identification, family, coaching, or leadership.`;
    }
    
    showNotification(resultMessage, 'search');
}

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
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.focus();
            showNotification('🔍 Search activated. Type your query.', 'info');
        }
    }
    
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification-popup');
        notifications.forEach(n => n.remove());
        closeUploadModal();
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