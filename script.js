// script.js - Complete functionality for The Advanced Learning Collective

// ============================================
// 1. SEARCH FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Search functionality for all search boxes
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
});

function performSearch(query) {
    // Simulate search with a results popup
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
// 2. NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification-popup');
    if (existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    
    // Style based on type
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
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (popup.parentElement) popup.remove();
    }, 5000);
}

// Add animation keyframes if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// 3. PATHWAY CARD INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const pathLinks = document.querySelectorAll('.path-link');
    
    pathLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't intercept if it's a real navigation link
            if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                // Let the navigation happen
                return;
            }
            e.preventDefault();
            
            const card = this.closest('.pathway-card');
            if (card) {
                const title = card.querySelector('h3')?.textContent || 'Pathway';
                showNotification(`📘 Accessing ${title} - Full resources loading...`, 'info');
                
                // Simulate loading
                setTimeout(() => {
                    showNotification(`✅ ${title} resources loaded successfully!`, 'success');
                }, 1500);
            }
        });
    });
});

// ============================================
// 4. RESOURCE CARD INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const resourceCards = document.querySelectorAll('.resource-card');
    
    resourceCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const title = this.querySelector('h3')?.textContent || 'Resource';
            const tag = this.querySelector('.resource-tag')?.textContent || 'Document';
            showNotification(`📄 Opening "${title}" (${tag}) - Preview available`, 'info');
        });
    });
});

// ============================================
// 5. CALENDAR EVENT INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const eventItems = document.querySelectorAll('.event-item, .resource-card .event-date');
    
    eventItems.forEach(item => {
        const parent = item.closest('.event-item, .resource-card');
        if (parent) {
            parent.style.cursor = 'pointer';
            parent.addEventListener('click', function() {
                const title = this.querySelector('strong')?.textContent || 
                             this.querySelector('h3')?.textContent || 
                             'Event';
                showNotification(`📅 Event: ${title} - Details loading...`, 'info');
            });
        }
    });
});

// ============================================
// 6. ACCESS PORTAL (Login simulation)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('.access-form button, .btn-outline[type="submit"]');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const emailInput = document.querySelector('input[type="email"], input[placeholder*="Email"]');
            const passInput = document.querySelector('input[type="password"]');
            
            if (emailInput && passInput) {
                const email = emailInput.value.trim();
                const pass = passInput.value.trim();
                
                if (!email || !pass) {
                    showNotification('Please enter both email and password', 'error');
                    return;
                }
                
                if (email.includes('@') && pass.length >= 4) {
                    showNotification('✅ Access granted! Redirecting to dashboard...', 'success');
                    setTimeout(() => {
                        showNotification('Welcome to The Advanced Learning Collective!', 'success');
                    }, 2000);
                } else {
                    showNotification('Invalid credentials. Please check your email and password.', 'error');
                }
            } else {
                // For access.html without actual form inputs
                showNotification('🔐 Access portal coming soon - contact your administrator', 'info');
            }
        });
    }
});

// ============================================
// 7. RESOURCE SPOTLIGHT "VIEW ALL" LINKS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const viewAllLinks = document.querySelectorAll('.resources-preview a[href*="resources"], .calendar-preview a.path-link');
    
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If it's a real navigation link, let it navigate
            if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                return;
            }
            e.preventDefault();
            showNotification('📚 Loading all resources...', 'info');
        });
    });
});

// ============================================
// 8. NAVIGATION LINK ACTIVE STATE
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
// 9. FEATURED LINKS (Quick access chips)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const featuredLinks = document.querySelectorAll('.featured-links a');
    
    featuredLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent.trim();
            showNotification(`🔍 Searching "${text}" resources...`, 'search');
            
            setTimeout(() => {
                showNotification(`✅ Found resources related to ${text}`, 'success');
            }, 1000);
        });
    });
});

// ============================================
// 10. NEWS & UPDATES INTERACTIONS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const updateItems = document.querySelectorAll('.update-item');
    
    updateItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const text = this.textContent.trim().substring(0, 60) + '...';
            showNotification(`📰 ${text}`, 'info');
        });
    });
});

// ============================================
// 11. FLOATING CONTACT / QUICK HELP (Optional)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Create a floating help button if it doesn't exist
    if (!document.querySelector('.floating-help')) {
        const helpBtn = document.createElement('button');
        helpBtn.className = 'floating-help';
        helpBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
        helpBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            background: var(--gold-accent, #e6b12e);
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 999;
            transition: transform 0.2s;
        `;
        
        helpBtn.addEventListener('mouseenter', () => {
            helpBtn.style.transform = 'scale(1.05)';
        });
        helpBtn.addEventListener('mouseleave', () => {
            helpBtn.style.transform = 'scale(1)';
        });
        
        helpBtn.addEventListener('click', () => {
            showNotification('💡 Need help? Contact gifted@alcnetwork.org or check the About page.', 'info');
        });
        
        document.body.appendChild(helpBtn);
    }
});

// ============================================
// 12. ACCESS REQUEST LINKS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const requestLinks = document.querySelectorAll('a[href*="access"], a[href*="request"]');
    
    requestLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                return;
            }
            e.preventDefault();
            showNotification('📝 Access request submitted. You will receive a confirmation email shortly.', 'success');
        });
    });
});

// ============================================
// 13. PAGE LOAD ANIMATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Fade in main content
    const mainContent = document.querySelector('main, .hero, .page-header');
    if (mainContent) {
        mainContent.style.animation = 'fadeIn 0.5s ease';
    }
    
    // Animate pathway cards with stagger
    const cards = document.querySelectorAll('.pathway-card, .resource-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 80));
    });
});

// ============================================
// 14. SKILLS DEMONSTRATION TRACKER
// ============================================

// Track user interactions for analytics simulation
const interactionTracker = {
    interactions: [],
    log: function(action, details = '') {
        this.interactions.push({
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
        console.log(`[Interaction] ${action}: ${details}`);
    }
};

// Log key interactions
document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, .pathway-card, .resource-card');
    if (target) {
        const text = target.textContent?.trim().substring(0, 50) || 'Unknown element';
        interactionTracker.log('click', text);
    }
});

// ============================================
// 15. RESPONSIVE MOBILE MENU (Enhancement)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Add hamburger menu for mobile if not present
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.site-header');
    
    if (window.innerWidth <= 780) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.style.cssText = `
            background: none;
            border: none;
            font-size: 1.8rem;
            color: var(--primary-dark);
            cursor: pointer;
            padding: 8px;
        `;
        
        const headerFlex = document.querySelector('.header-flex');
        if (headerFlex && !document.querySelector('.mobile-menu-toggle')) {
            headerFlex.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', function() {
                const nav = document.querySelector('.nav-links');
                if (nav) {
                    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
                    nav.style.flexDirection = 'column';
                    nav.style.width = '100%';
                    nav.style.paddingTop = '16px';
                    this.innerHTML = nav.style.display === 'flex' ? 
                        '<i class="fas fa-times"></i>' : 
                        '<i class="fas fa-bars"></i>';
                }
            });
        }
    }
});

// ============================================
// 16. FEATURED RESOURCES LOADING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading featured resources count
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const parent = stat.closest('.stat-item');
        if (parent && parent.textContent.includes('Resources')) {
            // Animate counter
            let count = 0;
            const target = 150;
            const interval = setInterval(() => {
                count += 5;
                if (count >= target) {
                    count = target;
                    clearInterval(interval);
                }
                stat.textContent = count + '+';
            }, 30);
        }
    });
});

// ============================================
// 17. KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    // Press Ctrl+Shift+S for search
    if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.focus();
            showNotification('🔍 Search activated. Type your query.', 'info');
        }
    }
    
    // Press Escape to close notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification-popup');
        notifications.forEach(n => n.remove());
    }
});

// ============================================
// 18. CONSOLE WELCOME MESSAGE
// ============================================

console.log('%c 🧠 The Advanced Learning Collective ', 'background: #0f2b3d; color: #e6b12e; font-size: 18px; font-weight: bold; padding: 12px 20px; border-radius: 8px;');
console.log('%c Advancing Minds, Advancing Practice ', 'color: #2c7da0; font-size: 14px; font-style: italic;');
console.log('%c 📚 Professional Learning & Resource Network ', 'color: #1a2c3e; font-size: 13px;');
console.log('%c 🔍 Use Ctrl+Shift+S to quickly search', 'color: #6c757d; font-size: 12px;');

// ============================================
// 19. SLIDESHOW FUNCTIONALITY
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
    
    // Image list - these should be in the "slidepics" folder
    const images = [
        { src: 'slidepics/slide1.jpg', alt: 'Gifted students collaborating on a project', title: 'Collaborative Learning', desc: 'Advanced learners working together to solve complex problems' },
        { src: 'slidepics/slide2.jpg', alt: 'Teacher guiding gifted students', title: 'Expert Instruction', desc: 'Differentiated teaching strategies for gifted learners' },
        { src: 'slidepics/slide3.jpg', alt: 'Students engaged in STEM activities', title: 'STEM Excellence', desc: 'Hands-on learning experiences for advanced students' },
        { src: 'slidepics/slide4.jpg', alt: 'Family engagement workshop', title: 'Family Partnership', desc: 'Building strong connections between home and school' },
        { src: 'slidepics/slide5.jpg', alt: 'Professional development session', title: 'Professional Growth', desc: 'Continuous learning for gifted education professionals' }
    ];
    
    let currentSlide = 0;
    let slideInterval;
    const intervalDuration = 5000; // 5 seconds
    
    // Build slides
    function buildSlides() {
        slidesContainer.innerHTML = '';
        
        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.index = index;
            
            // Check if image exists, if not show placeholder
            const img = new Image();
            img.src = image.src;
            
            img.onload = function() {
                // Image loaded successfully
                slide.innerHTML = `
                    <img src="${image.src}" alt="${image.alt}" loading="lazy">
                    <div class="slide-overlay">
                        <h3>${image.title}</h3>
                        <p>${image.desc}</p>
                    </div>
                `;
            };
            
            img.onerror = function() {
                // Image failed to load - show placeholder
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
        
        // Build dots
        buildDots();
        
        // Update slide positions
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
        
        // Move the slides container
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
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        slideInterval = setInterval(nextSlide, intervalDuration);
    }
    
    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            e.preventDefault();
        }
    });
    
    // Pause on hover
    const slideshowWrapper = document.querySelector('.slideshow-wrapper');
    if (slideshowWrapper) {
        slideshowWrapper.addEventListener('mouseenter', () => {
            if (slideInterval) clearInterval(slideInterval);
        });
        slideshowWrapper.addEventListener('mouseleave', resetInterval);
    }
    
    // Build the slideshow
    buildSlides();
    
    // Start auto-play
    resetInterval();
    
    // Show a notification if images are missing
    setTimeout(() => {
        const slides = slidesContainer.querySelectorAll('.slide');
        let hasImages = false;
        slides.forEach(slide => {
            if (slide.querySelector('img')) hasImages = true;
        });
        
        if (!hasImages) {
            console.log('📸 Tip: Add your slideshow images to the "slidepics" folder as slide1.jpg, slide2.jpg, etc.');
            showNotification('📸 Add images to "slidepics" folder to customize your slideshow', 'info');
        }
    }, 2000);
}

// ============================================
// 20. PAGE LOAD COMPLETE
// ============================================

console.log('✅ The Advanced Learning Collective loaded successfully!');
