document.addEventListener("DOMContentLoaded", () => {
    // Update footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Visitor counter logic (starts at 1000)
    let visitorCount = parseInt(localStorage.getItem('visitor_counter') || '999');
    visitorCount++;
    localStorage.setItem('visitor_counter', visitorCount.toString());

    function updateVisitorCounters() {
        const counters = document.querySelectorAll('.visitor-counter');
        counters.forEach(el => el.textContent = visitorCount);
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // SPA Router Logic
    const homeView = document.getElementById('home-view');
    const dynamicContent = document.getElementById('dynamic-content');

    async function loadConfig() {
        try {
            const response = await fetch('data/config.properties');
            const text = await response.text();
            const config = {};
            text.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
                    const parts = trimmed.split('=');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join('=').trim();
                        config[key] = value;
                    }
                }
            });
            return config;
        } catch (e) {
            console.error("Failed to load config", e);
            return {};
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GLOBAL VIDEO MANAGER
    // Singleton that owns every video on the site. Call VideoManager.stopAll()
    // before any navigation or browser-leave event to guarantee only one video
    // ever plays at a time.
    // ═══════════════════════════════════════════════════════════════════════════
    const VideoManager = (() => {
        const _videos = new Set();            // all registered HTMLVideoElement refs
        let _unmuteCleanup = null;            // active unmute-on-interaction remover

        /** Register a video element so the manager knows about it. */
        function register(video) {
            if (!video) return;
            _videos.add(video);
        }

        /** Pause every known video and cancel any pending unmute listener. */
        function stopAll(reason) {
            console.log(`[VideoManager] stopAll() reason="${reason || 'navigation'}"`);
            _videos.forEach(v => {
                if (!v.paused) v.pause();
            });
            // Also catch any video elements not yet registered (e.g. dynamicContent)
            document.querySelectorAll('video').forEach(v => {
                if (!v.paused) v.pause();
                _videos.add(v);
            });
            if (_unmuteCleanup) {
                _unmuteCleanup();
                _unmuteCleanup = null;
            }
        }

        /**
         * Play a video with audio.
         * - Tries unmuted first.
         * - Falls back to muted + unmute-on-first-interaction.
         * Cancels any previous unmute listener before setting up a new one.
         */
        async function playWithAudio(video) {
            if (!video) return;
            register(video);

            // Cancel any leftover unmute listener from a previous play
            if (_unmuteCleanup) {
                _unmuteCleanup();
                _unmuteCleanup = null;
            }

            video.muted = false;
            try {
                await video.play();
                console.log(`[VideoManager] Audible autoplay succeeded for #${video.id}`);
            } catch {
                console.log(`[VideoManager] Audible blocked for #${video.id}, starting muted...`);
                video.muted = true;
                try {
                    await video.play();
                    console.log(`[VideoManager] Muted autoplay succeeded for #${video.id}`);

                    // Unmute on first interaction
                    const unmute = () => {
                        video.muted = false;
                        video.play().catch(e => console.warn('[VideoManager] unmute retry failed:', e));
                        cleanup();
                    };
                    const cleanup = () => {
                        document.removeEventListener('click', unmute);
                        document.removeEventListener('touchstart', unmute);
                        _unmuteCleanup = null;
                    };
                    document.addEventListener('click', unmute);
                    document.addEventListener('touchstart', unmute);
                    _unmuteCleanup = cleanup;
                } catch (err2) {
                    console.error(`[VideoManager] Muted autoplay also failed for #${video.id}:`, err2);
                }
            }
        }

        return { register, stopAll, playWithAudio };
    })();

    // ── Pause ALL videos on any browser-leave event ───────────────────────────
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) VideoManager.stopAll('tab hidden');
        // Resume is intentionally NOT done here — user must see the page again
        // and explicitly be on a video page; handleRoute will resume if needed.
    });

    window.addEventListener('blur', () => VideoManager.stopAll('window blur'));

    document.addEventListener('mouseleave', () => VideoManager.stopAll('mouse left viewport'));

    // ── Home video play/pause toggle button ───────────────────────────────────
    const PAUSE_ICON = `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`;
    const PLAY_ICON  = `<polygon points="5,3 19,12 5,21"/>`;

    function setVideoIcon(playing) {
        const icon = document.getElementById('home-video-icon');
        if (icon) icon.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
        const btn = document.getElementById('home-video-toggle');
        if (btn) btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    }

    function setupHomeVideoToggle(video) {
        if (video._toggleSetup) return;
        video._toggleSetup = true;

        video.addEventListener('play',  () => setVideoIcon(true));
        video.addEventListener('pause', () => setVideoIcon(false));

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#home-video-toggle');
            if (!btn) return;
            if (video.paused) {
                VideoManager.playWithAudio(video);
            } else {
                video.pause();
            }
        });

        const btn = document.getElementById('home-video-toggle');
        if (btn) {
            btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(0,0,0,0.8)');
            btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(0,0,0,0.55)');
        }
    }

    // ── Helper: is the current hash the home view? ───────────────────────────
    function isHomeView() {
        const hash = window.location.hash;
        return !hash || hash === '#home' || hash === '#' ||
               hash === '#contact-us' || hash === '#contact-us-section';
    }

    // Event delegation for contact form submit
    document.addEventListener('click', async (e) => {
        const submitBtn = e.target.closest('#contact-submit');
        if (submitBtn) {
            console.log("Delegated click: #contact-submit clicked!");
            e.preventDefault();

            const form = document.getElementById('contact-form');
            const nameEl = document.getElementById('contact-name');
            const mobileEl = document.getElementById('contact-mobile');
            const emailEl = document.getElementById('contact-email');
            const linkedinEl = document.getElementById('contact-linkedin');
            const naukriEl = document.getElementById('contact-naukri');
            const messageEl = document.getElementById('contact-message');

            if (!nameEl || !mobileEl || !emailEl || !messageEl) {
                console.error("Delegated click: Form input elements missing from DOM!");
                return;
            }

            const name = nameEl.value.trim();
            const mobile = mobileEl.value.trim();
            const email = emailEl.value.trim();
            const linkedin = linkedinEl ? linkedinEl.value.trim() : '';
            const naukri = naukriEl ? naukriEl.value.trim() : '';
            const message = messageEl.value.trim();
            console.log("Delegated click: Form inputs read:", { name, mobile, email, linkedin, naukri, message });

            let statusDiv = document.getElementById('contact-status');
            if (!statusDiv) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'contact-status';
                statusDiv.style.marginTop = '1rem';
                statusDiv.style.fontWeight = '600';
                statusDiv.style.textAlign = 'center';
                if (form) form.appendChild(statusDiv);
            }

            statusDiv.style.display = 'block';
            statusDiv.style.color = '#3b82f6';
            statusDiv.innerText = 'Sending message...';

            if (!name || !mobile || !email || !message) {
                console.warn("Delegated click: Form validation failed (missing fields)");
                statusDiv.style.color = '#ef4444';
                statusDiv.innerText = 'Please fill in all fields.';
                return;
            }

            console.log("Delegated click: Loading configurations...");
            const config = await loadConfig();
            const mailTo = config['mail.to'] || 'LinkRi.Jobs@gmail.com';
            console.log("Delegated click: Mail To:", mailTo);

            try {
                console.log("Delegated click: Sending fetch request to formsubmit.co...");
                const response = await fetch(`https://formsubmit.co/ajax/${mailTo}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        mobile: mobile,
                        email: email,
                        ...(linkedin && { linkedin_profile: linkedin }),
                        ...(naukri && { naukri_profile: naukri }),
                        message: message,
                        _subject: name,
                        _replyto: email
                    })
                });

                console.log("Delegated click: Response received. Status:", response.status);
                if (response.ok) {
                    const result = await response.json();
                    console.log("Delegated click: Result payload:", result);
                    if (result.success === 'true') {
                        statusDiv.style.color = '#10b981';
                        statusDiv.innerText = 'Message sent successfully!';
                        if (form) form.reset();
                    } else if (result.message && result.message.includes('Activation')) {
                        statusDiv.style.color = '#d97706';
                        statusDiv.innerText = 'Activation email sent! Please check your inbox to activate this form.';
                    } else {
                        statusDiv.style.color = '#ef4444';
                        statusDiv.innerText = 'Message is not sent; pls try again';
                    }
                } else {
                    statusDiv.style.color = '#ef4444';
                    statusDiv.innerText = 'Message is not sent; pls try again';
                }
            } catch (error) {
                console.error("Delegated click: Error sending email in catch:", error);
                statusDiv.style.color = '#ef4444';
                statusDiv.innerText = 'Message is not sent; pls try again';
            }
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // SPA ROUTER
    // ═══════════════════════════════════════════════════════════════════════════
    function handleRoute() {
        const hash = window.location.hash;
        console.log("handleRoute: Hash is", hash);

        // ── Always stop every video before switching view ─────────────────────
        VideoManager.stopAll(`navigating to ${hash || '#home'}`);

        // ── HOME VIEW ─────────────────────────────────────────────────────────
        if (!hash || hash === '#home' || hash === '#' ||
            hash === '#contact-us' || hash === '#contact-us-section') {

            dynamicContent.style.display = 'none';
            homeView.style.display = 'block';

            // Start home video with audio
            const homeVideo = document.getElementById('home-video');
            if (homeVideo) {
                VideoManager.register(homeVideo);
                setupHomeVideoToggle(homeVideo);
                VideoManager.playWithAudio(homeVideo);
            }

            if (hash === '#contact-us' || hash === '#contact-us-section') {
                const el = document.getElementById('contact-us-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0);
            }
            updateVisitorCounters();
            return;
        }

        // ── DYNAMIC SPA PAGES ─────────────────────────────────────────────────
        console.log(`handleRoute: checking pageContent for ${hash}:`, !!pageContent[hash]);
        if (pageContent[hash]) {
            homeView.style.display = 'none';
            dynamicContent.innerHTML = pageContent[hash];
            dynamicContent.style.display = 'block';
            window.scrollTo(0, 0);
            updateVisitorCounters();

            // Auto-start the About page video
            if (hash === '#about') {
                const video = document.getElementById('about-what-we-do-video');
                if (video) {
                    VideoManager.register(video);
                    VideoManager.playWithAudio(video);
                }
            }
        } else {
            // 404 Not Found
            homeView.style.display = 'none';
            dynamicContent.innerHTML = pageContent['#404'] || '<h1>Page Not Found</h1>';
            dynamicContent.style.display = 'block';
            window.scrollTo(0, 0);
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Initial load route handling
    handleRoute();
});
