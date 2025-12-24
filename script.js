// ========================================
// SEBOU DIGITAL - INTERACTIVE FEATURES
// ========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // ========== NAVIGATION ========== 
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Mobile menu toggle - Modern Full-screen Menu
    navToggle.addEventListener('click', function () {
        const isActive = navMenu.classList.contains('active');

        if (isActive) {
            // Closing menu
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        } else {
            // Opening menu
            navMenu.classList.add('active');
            navToggle.classList.add('active');
            document.body.classList.add('menu-open');
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Height of navbar
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== SCROLL ANIMATIONS (Enhanced) ==========
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    // Observer for .reveal elements
    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    // Auto-add reveal class to sections and observe
    const sectionsToAnimate = document.querySelectorAll('.section, .card, .text-center h2, .hero-content');
    sectionsToAnimate.forEach((el, index) => {
        // Don't override if already has a reveal class
        if (!el.classList.contains('reveal') &&
            !el.classList.contains('reveal-left') &&
            !el.classList.contains('reveal-right') &&
            !el.classList.contains('reveal-scale')) {
            el.classList.add('reveal');
        }
        // Stagger effect for cards within sections
        if (el.classList.contains('card')) {
            el.style.transitionDelay = `${(index % 6) * 0.1}s`;
        }
        revealObserver.observe(el);
    });

    // Legacy observer for cards (keeps existing behavior)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);

        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    showNotification('✅ Message envoyé ! Je vous répondrai rapidement (souvent sous 24h).', 'success');
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            showNotification('❌ Erreur : ' + data["errors"].map(error => error["message"]).join(", "), 'error');
                        } else {
                            showNotification('❌ Une erreur est survenue. Veuillez réessayer.', 'error');
                        }
                    });
                }
            })
            .catch(error => {
                showNotification('❌ Erreur de connexion. Vérifiez votre internet.', 'error');
            })
            .finally(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
    });

    // ========== NOTIFICATION SYSTEM ==========
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            backgroundColor: type === 'success' ? 'var(--neon-cyan)' : 'var(--neon-red)',
            color: type === 'success' ? 'var(--ink-deep)' : 'var(--white)',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease-out',
            maxWidth: '400px'
        });

        // Add to page
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // ========== DYNAMIC PRICING HOVER EFFECTS ==========
    const priceCards = document.querySelectorAll('.card');

    priceCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // ========== ANIMATE NUMBERS ON SCROLL ==========
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString() + ' DH';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // ========== FORM VALIDATION ENHANCEMENTS ==========
    const formInputs = contactForm.querySelectorAll('input, select, textarea');

    formInputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this);
        });

        input.addEventListener('input', function () {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    function validateField(field) {
        let isValid = true;
        const value = field.value.trim();

        // Remove previous error
        const existingError = field.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        field.classList.remove('error');

        // Validation rules
        if (field.hasAttribute('required') && value === '') {
            isValid = false;
            showFieldError(field, 'Ce champ est requis');
        } else if (field.type === 'email' && value !== '') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                isValid = false;
                showFieldError(field, 'Email invalide');
            }
        } else if (field.type === 'tel' && value !== '') {
            const phonePattern = /^(\+212|0)[0-9]{9}$/;
            if (!phonePattern.test(value.replace(/[\s-]/g, ''))) {
                isValid = false;
                showFieldError(field, 'Numéro de téléphone invalide');
            }
        }

        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        field.style.borderColor = 'var(--neon-red)';

        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = message;
        errorMsg.style.color = 'var(--neon-red)';
        errorMsg.style.fontSize = '0.875rem';
        errorMsg.style.marginTop = '0.25rem';

        field.parentElement.appendChild(errorMsg);
    }

    // ========== LAZY LOADING OPTIMIZATION ==========
    // Add lazy loading for images if they exist
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ========== CONSOLE MESSAGE ==========
    console.log('%c🌊 Sebou Digital', 'color: #0B5394; font-size: 24px; font-weight: bold;');
    console.log('%cCréation de Sites Web à Kénitra', 'color: #E67E22; font-size: 14px;');
    console.log('%cSite développé avec passion ❤️', 'color: #16A085; font-size: 12px;');

    // ========== REVIEWS SYSTEM (Avis Clients) ==========
    const listContainer = document.getElementById('reviews-list');
    const loadingMsg = document.getElementById('reviews-loading');
    const authContainer = document.getElementById('auth-container');
    const formContainer = document.getElementById('review-form-container');
    const reviewForm = document.getElementById('reviewForm');
    const userDisplayName = document.getElementById('user-display-name');

    // 1. Charger les avis approuvés
    fetch('/.netlify/functions/reviews-list')
        .then(res => res.json())
        .then(data => {
            if (loadingMsg) loadingMsg.style.display = 'none';

            if (Array.isArray(data) && data.length > 0) {
                // Vider le helper
                if (listContainer.contains(loadingMsg)) listContainer.innerHTML = '';

                data.forEach(review => {
                    const stars = '⭐'.repeat(review.rating);
                    const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });

                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.textAlign = 'left';
                    card.innerHTML = `
                        <div class="d-flex justify-between align-center mb-sm">
                            <span style="font-weight: 700; color: var(--white);">${escapeHtml(review.display_name)}</span>
                            <span style="font-size: 0.8em; color: var(--text-muted);">${date}</span>
                        </div>
                        <div class="mb-xs">${stars}</div>
                        <p class="text-secondary" style="font-style: italic;">"${escapeHtml(review.comment)}"</p>
                        <div class="mt-sm d-flex align-center gap-xs" style="font-size: 0.75rem; color: var(--neon-cyan);">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> 
                            Avis vérifié
                        </div>
                    `;
                    listContainer.appendChild(card);
                });
            } else {
                if (loadingMsg) loadingMsg.textContent = "Soyez le premier à donner votre avis !";
            }
        })
        .catch(err => {
            console.error('Erreur chargement avis:', err);
            // On ne montre rien si erreur pour éviter de polluer l'UI
        });

    // 2. Gestion Netlify Identity
    if (window.netlifyIdentity) {
        netlifyIdentity.on('init', user => {
            updateAuthUI(user);
        });
        netlifyIdentity.on('login', user => {
            updateAuthUI(user);
            netlifyIdentity.close();
        });
        netlifyIdentity.on('logout', () => {
            updateAuthUI(null);
        });
    }

    function updateAuthUI(user) {
        if (!authContainer || !formContainer) return;

        if (user) {
            authContainer.style.display = 'none';
            formContainer.style.display = 'block';
            const name = user.user_metadata?.full_name || user.email;
            if (userDisplayName) userDisplayName.textContent = name;
        } else {
            authContainer.style.display = 'block';
            formContainer.style.display = 'none';
        }
    }

    // 3. Soumission Avis
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = netlifyIdentity.currentUser();
            if (!user) {
                showNotification('❌ Veuillez vous reconnecter.', 'error');
                return;
            }

            const comment = document.getElementById('review-comment').value;
            const rating = document.getElementById('review-rating').value;
            const btn = reviewForm.querySelector('button[type="submit"]');

            btn.disabled = true;
            btn.textContent = "Envoi...";

            try {
                // On doit récupérer le token JWT pour l'authentification
                const token = await user.jwt();

                const response = await fetch('/.netlify/functions/reviews-create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ comment, rating })
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification('✅ ' + result.message, 'success');
                    reviewForm.reset();
                    // On peut masquer le formulaire ou laisser l'user
                } else {
                    showNotification('❌ ' + (result.error || "Erreur inconnue"), 'error');
                }

            } catch (error) {
                console.error(error);
                showNotification('❌ Erreur technique.', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = "Envoyer mon avis";
            }
        });
    }

    // Helper XSS
    function escapeHtml(text) {
        if (!text) return text;
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});

// ========== PERFORMANCE OPTIMIZATION ==========
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== ACCESSIBILITY ENHANCEMENTS ==========
// Add keyboard navigation support
document.addEventListener('keydown', function (e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }
});
