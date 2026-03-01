/**
 * PACE Course 2 Mini-Project Study Guide
 * Interactive functionality with persistent progress
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'pace-course1-progress';
    const TOTAL_ITEMS = 31;

    // DOM Elements
    const progressBar = document.getElementById('progressBar');
    const completedCount = document.getElementById('completedCount');
    const progressPercent = document.getElementById('progressPercent');
    const navPills = document.querySelectorAll('.nav-pill');
    const rubricCards = document.querySelectorAll('.rubric-card');

    // State
    let completedItems = loadProgress();

    /**
     * Load progress from localStorage
     */
    function loadProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('Could not load progress:', e);
            return {};
        }
    }

    /**
     * Save progress to localStorage
     */
    function saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(completedItems));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    /**
     * Update the progress display
     */
    function updateProgressDisplay() {
        const completed = Object.keys(completedItems).filter(k => completedItems[k]).length;
        const percent = Math.round((completed / TOTAL_ITEMS) * 100);

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (completedCount) completedCount.textContent = completed;
        if (progressPercent) progressPercent.textContent = `${percent}%`;
    }

    /**
     * Initialize checkbox states from saved progress
     */
    function initializeCheckboxes() {
        document.querySelectorAll('.checkbox-container input[type="checkbox"]').forEach(checkbox => {
            const id = checkbox.dataset.id;
            if (id && completedItems[id]) {
                checkbox.checked = true;
                const card = checkbox.closest('.rubric-card');
                if (card) card.classList.add('completed');
            }
        });
    }

    /**
     * Handle checkbox changes
     */
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const id = checkbox.dataset.id;
        const card = checkbox.closest('.rubric-card');

        if (id) {
            completedItems[id] = checkbox.checked;
            saveProgress();
            updateProgressDisplay();

            if (card) {
                if (checkbox.checked) {
                    card.classList.add('completed');
                    // Add a subtle animation
                    card.style.transform = 'scale(1.01)';
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 200);
                } else {
                    card.classList.remove('completed');
                }
            }
        }
    }

    /**
     * Handle card expansion
     */
    function handleCardExpansion(e) {
        const card = e.currentTarget.closest('.rubric-card');
        if (!card) return;

        // Don't toggle if clicking on checkbox
        if (e.target.closest('.checkbox-container')) return;

        card.classList.toggle('expanded');
    }

    /**
     * Handle navigation clicks
     */
    function handleNavClick(e) {
        const clickedPill = e.currentTarget;

        // Update active state
        navPills.forEach(pill => pill.classList.remove('active'));
        clickedPill.classList.add('active');
    }

    /**
     * Update active nav based on scroll position
     */
    function updateActiveNav() {
        const sections = document.querySelectorAll('.stage-section');
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.id;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navPills.forEach(pill => {
                    pill.classList.remove('active');
                    if (pill.getAttribute('href') === `#${sectionId}`) {
                        pill.classList.add('active');
                    }
                });
            }
        });
    }

    /**
     * Initialize syntax highlighting
     */
    function initializeHighlighting() {
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    /**
     * Keyboard shortcuts
     */
    function handleKeyboard(e) {
        // 'r' to reset progress (with confirmation)
        if (e.key === 'r' && e.ctrlKey && e.shiftKey) {
            if (confirm('Reset all progress? This cannot be undone.')) {
                completedItems = {};
                saveProgress();
                document.querySelectorAll('.checkbox-container input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                    const card = cb.closest('.rubric-card');
                    if (card) card.classList.remove('completed');
                });
                updateProgressDisplay();
            }
        }

        // 'e' to expand/collapse all
        if (e.key === 'e' && e.ctrlKey) {
            e.preventDefault();
            const allExpanded = document.querySelectorAll('.rubric-card.expanded').length === rubricCards.length;
            rubricCards.forEach(card => {
                if (allExpanded) {
                    card.classList.remove('expanded');
                } else {
                    card.classList.add('expanded');
                }
            });
        }
    }

    /**
     * Initialize the application
     */
    function init() {
        // Initialize checkboxes from saved state
        initializeCheckboxes();
        updateProgressDisplay();

        // Initialize syntax highlighting
        initializeHighlighting();

        // Event listeners for checkboxes
        document.querySelectorAll('.checkbox-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });

        // Event listeners for card headers (expansion)
        document.querySelectorAll('.card-header').forEach(header => {
            header.addEventListener('click', handleCardExpansion);
        });

        // Event listeners for navigation
        navPills.forEach(pill => {
            pill.addEventListener('click', handleNavClick);
        });

        // Scroll spy for navigation
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveNav, 50);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);

        // Expand first few items by default for better UX
        const firstCards = document.querySelectorAll('.rubric-card');
        if (firstCards.length > 0) {
            firstCards[0].classList.add('expanded');
        }

        console.log('PACE Course 1 Study Guide initialized');
        console.log('Keyboard shortcuts:');
        console.log('  Ctrl+Shift+R - Reset all progress');
        console.log('  Ctrl+E - Expand/collapse all cards');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
