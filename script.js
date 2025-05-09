document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- GSAP Initialization ---
    gsap.registerPlugin(ScrollTrigger);

    // --- Constants ---
    const body = document.body;
    const header = document.getElementById('main-header');
    const mainContent = document.getElementById('main-content');
    const footer = document.getElementById('main-footer');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNavPanel = document.getElementById('mobile-nav-panel');
    const themeToggle = document.getElementById('theme-toggle');
    const scrollProgressIndicator = document.getElementById('scroll-progress-indicator');
    const currentYearSpan = document.getElementById('current-year');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- State Variables ---
    let lastScrollY = window.scrollY;
    let isNavOpen = false;
    let currentTheme = localStorage.getItem('theme') || 'light';

    // --- Functions ---

    /**
     * Reveals the main page content immediately.
     */
    const revealPageContent = () => {
        console.log("Revealing page content...");
        body.classList.remove('preload');
        const elementsToFade = [header, mainContent, footer].filter(el => el);
        if (elementsToFade.length > 0) {
            elementsToFade.forEach(el => el.style.opacity = 1);
            console.log("Page content revealed.");
            ScrollTrigger.refresh();
        } else {
            console.warn("Main content elements not found for reveal.");
        }
    };

    /**
     * Handles header behavior based on scroll direction.
     */
    const handleHeaderScroll = () => {
        const currentScrollY = window.scrollY;

        if (!header) return;

        // Add scrolled class for styling changes
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide header when scrolling down, show when scrolling up
        // Only hide if mobile nav is NOT open
        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight && !isNavOpen) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
    };

    /**
     * Toggles the mobile navigation menu.
     */
    const toggleMobileNav = () => {
        isNavOpen = !isNavOpen;
        navToggle.classList.toggle('active', isNavOpen);
        navToggle.setAttribute('aria-expanded', isNavOpen);
        
        if (mobileNavPanel) {
            mobileNavPanel.classList.toggle('active', isNavOpen);
            mobileNavPanel.setAttribute('aria-hidden', !isNavOpen);
            // Focus management (optional but good for accessibility)
            // if (isNavOpen) mobileNavPanel.querySelector('a')?.focus();
        }
        
        body.classList.toggle('no-scroll', isNavOpen); // Prevent background scroll
        
        // Prevent header hiding when nav is open
        if(isNavOpen) {
            header.classList.remove('hidden');
        }
    };

    /**
     * Closes the mobile navigation if open.
     */
    const closeMobileNav = () => {
        if (isNavOpen) {
            toggleMobileNav();
        }
    }

    /**
     * Applies the selected theme (light/dark).
     * @param {string} theme - 'light' or 'dark'
     */
    const applyTheme = (theme) => {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(`${theme}-mode`);
        localStorage.setItem('theme', theme);
        currentTheme = theme;
        updateThemeToggleIcon();
        console.log("Theme applied:", theme);
    };

    /**
     * Updates the theme toggle button icon.
     */
    const updateThemeToggleIcon = () => {
        if (themeToggle) {
            themeToggle.innerHTML = currentTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`);
        }
    };

    /**
     * Toggles between light and dark themes.
     */
    const toggleTheme = () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    };

    /**
     * Updates the scroll progress indicator.
     */
    const updateScrollProgress = () => {
        if (!scrollProgressIndicator) return;

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        // Prevent division by zero if content is shorter than viewport
        const scrolledPercentage = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0; 
        scrollProgressIndicator.style.width = `${scrolledPercentage}%`;
    };

    /**
     * Sets the current year in the footer.
     */
    const setFooterYear = () => {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    };
    
    /**
     * Fetches and displays finance news (requires backend proxy).
     * This function WILL NOT WORK until a backend endpoint is created.
     */
    const displayFinanceNews = async () => {
        const newsGrid = document.getElementById('news-grid');
        if (!newsGrid) return;

        // --- IMPORTANT --- 
        // Direct fetch from Yahoo Finance WILL NOT WORK in production due to CORS.
        // You NEED a backend proxy API endpoint that fetches the data server-side.
        const YOUR_BACKEND_API_ENDPOINT = '/api/finance-news'; // Replace with your actual endpoint

        newsGrid.innerHTML = '<p class="loading-news">Loading latest news...</p>'; // Show loading state

        try {
            const response = await fetch(YOUR_BACKEND_API_ENDPOINT);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const newsData = await response.json(); // Assuming your API returns JSON { items: [...] }

            newsGrid.innerHTML = ''; // Clear loading/placeholder

            if (newsData && newsData.items && newsData.items.length > 0) {
                // Limit the number of items displayed (e.g., first 4)
                const itemsToDisplay = newsData.items.slice(0, 4);
                
                itemsToDisplay.forEach(item => {
                    const article = document.createElement('article');
                    article.className = 'news-item';

                    // --- Adapt based on the actual data structure from your API --- 
                    const title = item.title || 'No Title Available';
                    // Ensure the link goes directly to the news source
                    const link = item.link || '#'; 
                    const imageUrl = item.imageUrl || 'https://via.placeholder.com/400x250/cccccc/999999?text=News'; // Placeholder image
                    const excerpt = item.excerpt || item.description || 'No description available.';
                    // ---------------------------------------------------------------
                    
                    // Construct the news item HTML, ensuring link opens in new tab
                    article.innerHTML = `
                        <a href="${link}" class="news-item-link" target="_blank" rel="noopener noreferrer" aria-label="Read more about ${title}">
                           <div class="news-item-image">
                               <img src="${imageUrl}" alt="" loading="lazy" width="400" height="250"> 
                           </div>
                           <div class="news-item-content">
                               <h3 class="news-item-title">${title}</h3>
                               <p class="news-item-excerpt">${excerpt}</p>
                               <span class="news-item-readmore">Read More &rarr;</span>
                           </div>
                        </a>
                    `; // Note: Removed image alt text, as it's often redundant with the title link
                    newsGrid.appendChild(article);
                });
                 // Re-initialize scroll animations for newly added news items
                 // Make sure initScrollAnimations can handle dynamically added content or call specific init for this grid
                 staggerAnimation('#news-grid', '.news-item'); // Assuming staggerAnimation is accessible

            } else {
                newsGrid.innerHTML = '<p>No news items found.</p>';
            }

        } catch (error) {
            console.error("Error fetching or displaying finance news:", error);
            newsGrid.innerHTML = '<p class="error-news">Could not load news at this time. Check console for details.</p>';
        }
    };

    // --- Enhanced GSAP Scroll Animations ---
    const initScrollAnimations = () => {
        // Default animation for individual elements
        const defaultAnimation = (el) => {
            gsap.from(el, {
                opacity: 0,
                y: 50,
                scale: 0.98, // Add subtle scale
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%', // Trigger when 90% from top enters viewport
                    toggleActions: 'play none none reverse', // Play on enter, reverse on leave
                }
            });
        };

        // Apply default animation to all elements with the class
        gsap.utils.toArray('.animate-on-scroll').forEach(el => {
            // Check if the element is inside a grid where we want staggering
            if (!el.closest('.featured-grid') && !el.closest('.news-grid')) {
                defaultAnimation(el);
            }
        });

        // Staggered animation for items within grids
        const staggerAnimation = (gridSelector, itemSelector) => {
            const grid = document.querySelector(gridSelector);
            if (grid) {
                gsap.from(gsap.utils.toArray(itemSelector), {
                    opacity: 0,
                    y: 50,
                    scale: 0.95,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.15, // Stagger amount between items
                    scrollTrigger: {
                        trigger: grid, // Trigger when the grid comes into view
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    }
                });
            }
        };

        // Apply staggering to specific grids
        staggerAnimation('.featured-grid', '.post-card');
        staggerAnimation('.news-grid', '.news-item');

        // Handle elements within the about wrapper specifically if needed
        // Example: Animate text column then image column
        const aboutWrapper = document.querySelector('.about-content-wrapper');
        if (aboutWrapper) {
            const textCol = aboutWrapper.querySelector('.about-text-column');
            const imgCol = aboutWrapper.querySelector('.about-image-column');
            
            // Set initial state for image column (no longer animated by timeline)
            if (imgCol) {
                gsap.set(imgCol, { opacity: 1, scale: 1 }); 
            }
            
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: aboutWrapper,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });

            if (textCol) {
                tl.from(textCol.children, { // Animate children of text column
                    opacity: 0,
                    x: -50, // Slide in from left
                    duration: 0.7,
                    stagger: 0.2,
                    ease: 'power3.out'
                });
            }
            // Ensure the animation for the image column is removed/commented out
            /* if (imgCol) {
                tl.from(imgCol, { // Animate image column
                    opacity: 0,
                    scale: 0.9, // Scale up
                    duration: 0.8,
                    ease: 'power3.out'
                }, "-=0.4"); // Start slightly before text finishes
            } */
        }
    };

    // --- Event Listeners ---
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleHeaderScroll();
            updateScrollProgress();
        }, 10);
    });

    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileNav);
    }

    // Close mobile nav if a link inside it is clicked
    if (mobileNavPanel) {
        mobileNavPanel.addEventListener('click', (e) => {
            if (e.target.matches('a')) {
                closeMobileNav();
            }
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // --- Initial Setup & Event Listeners ---

    // Apply Initial Theme
    applyTheme(currentTheme);

    // Set Footer Year
    setFooterYear();

    // Attempt to display finance news (will fail without backend)
    displayFinanceNews();

    // Immediately reveal content
    revealPageContent();

    // Initialize scroll animations AFTER content is revealed
    // Added a small delay to ensure layout is stable
    setTimeout(() => {
        if (!prefersReducedMotion) { // Only run animations if not disabled
            initScrollAnimations();
        } else {
            // Ensure elements are visible even if animations are off
            gsap.utils.toArray('.animate-on-scroll, .post-card, .news-item, .about-content-wrapper > div').forEach(el => {
                gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1 }); 
            });
        }
        ScrollTrigger.refresh(); // Refresh ScrollTrigger positions after setup
    }, 100); // 100ms delay, adjust if needed

    // Header Scroll Logic
    // ... existing code ...

    // TODO: Integrate Analytics Snippet here
    // Example: Google Analytics, Plausible, etc.
    // Ensure it's lightweight and respects user privacy.

});
