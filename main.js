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
        let _currentVideo = null;             // the video that should be playing right now
        const _savedTimes = {};               // saved playback offsets keyed by video.id

        /** Register a video element so the manager knows about it. */
        function register(video) {
            if (!video) return;
            _videos.add(video);
        }

        /** Pause every known video and cancel any pending unmute listener. */
        function stopAll(reason) {
            console.log(`[VideoManager] stopAll() reason="${reason || 'navigation'}"`);
            _videos.forEach(v => {
                // Save playback position before pausing so we can resume later
                if (v.id && v.currentTime > 0) {
                    _savedTimes[v.id] = v.currentTime;
                    console.log(`[VideoManager] saved time for #${v.id}: ${v.currentTime.toFixed(2)}s`);
                }
                if (!v.paused) v.pause();
            });
            // Also catch any video elements not yet registered (e.g. dynamicContent)
            document.querySelectorAll('video').forEach(v => {
                if (v.id && v.currentTime > 0) {
                    _savedTimes[v.id] = v.currentTime;
                }
                if (!v.paused) v.pause();
                _videos.add(v);
            });
            if (_unmuteCleanup) {
                _unmuteCleanup();
                _unmuteCleanup = null;
            }
            _currentVideo = null;
        }

        /** Resume the currently active video (called on tab-visible / focus). */
        function resumeCurrent() {
            if (_currentVideo && _currentVideo.paused) {
                _currentVideo.play().catch(e =>
                    console.warn('[VideoManager] resume failed:', e)
                );
            }
        }

        /**
         * Restore a previously saved playback offset onto a (possibly new)
         * video element. Call this right after injecting HTML that contains
         * the video, before calling playWithAudio().
         */
        function restoreTime(video) {
            if (!video || !video.id) return;
            const saved = _savedTimes[video.id];
            if (saved && saved > 0) {
                video.currentTime = saved;
                console.log(`[VideoManager] restored time for #${video.id}: ${saved.toFixed(2)}s`);
            }
        }

        /**
         * Play a video with audio.
         * - Tries unmuted first.
         * - Falls back to muted + unmute-on-first-interaction.
         * @param {HTMLVideoElement} video
         * @param {number} [startTime]  Optional offset in seconds to seek to before playing.
         */
        async function playWithAudio(video, startTime) {
            if (!video) return;
            register(video);
            _currentVideo = video;

            // Cancel any leftover unmute listener from a previous play
            if (_unmuteCleanup) {
                _unmuteCleanup();
                _unmuteCleanup = null;
            }

            // Core seek-and-play logic (runs once video metadata is available)
            const _doPlay = async () => {
                // Seek to saved position if one was provided
                if (startTime !== undefined && startTime > 0) {
                    video.currentTime = startTime;
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

                        // Unmute on first interaction (silent fallback)
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
            };

            // If we need to seek but metadata isn't loaded yet, wait for it first
            if (startTime !== undefined && startTime > 0 && video.readyState < 1) {
                video.addEventListener('loadedmetadata', _doPlay, { once: true });
            } else {
                await _doPlay();
            }
        }

        /** Return the last saved playback offset for a video id, or 0. */
        function getSavedTime(videoId) {
            return _savedTimes[videoId] || 0;
        }

        return { register, stopAll, resumeCurrent, restoreTime, getSavedTime, playWithAudio };
    })();

    // ── Pause ALL videos when tab is hidden; resume when it becomes visible ───
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            VideoManager.stopAll('tab hidden');
        } else {
            VideoManager.resumeCurrent();
        }
    });

    // Resume video when the window regains focus (e.g. switching back from
    // another app). We do NOT stop on blur — that was too aggressive and
    // caused the About-page video to freeze whenever the mouse left the window.
    window.addEventListener('focus', () => VideoManager.resumeCurrent());

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

    // ── Contact form → /contact (same-origin Worker proxy, no CORS) ──────────
    document.addEventListener('click', async (e) => {
        const submitBtn = e.target.closest('#contact-submit');
        if (!submitBtn) return;
        e.preventDefault();

        const nameEl     = document.getElementById('contact-name');
        const mobileEl   = document.getElementById('contact-mobile');
        const emailEl    = document.getElementById('contact-email');
        const linkedinEl = document.getElementById('contact-linkedin');
        const naukriEl   = document.getElementById('contact-naukri');
        const messageEl  = document.getElementById('contact-message');
        const form       = document.getElementById('contact-form');

        if (!nameEl || !mobileEl || !emailEl || !messageEl) return;

        const name     = nameEl.value.trim();
        const mobile   = mobileEl.value.trim();
        const email    = emailEl.value.trim();
        const linkedin = linkedinEl ? linkedinEl.value.trim() : '';
        const naukri   = naukriEl   ? naukriEl.value.trim()   : '';
        const message  = messageEl.value.trim();

        // Inline status div (created once, reused)
        let statusDiv = document.getElementById('contact-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'contact-status';
            statusDiv.style.cssText = 'margin-top:1rem;font-weight:600;text-align:center;';
            if (form) form.appendChild(statusDiv);
        }
        statusDiv.style.display = 'block';

        // Validate required fields
        if (!name || !mobile || !email || !message) {
            statusDiv.style.color = '#ef4444';
            statusDiv.innerText = 'Please fill in all required fields.';
            return;
        }

        // Disable button while submitting
        const originalLabel = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending…';
        statusDiv.style.color = '#3b82f6';
        statusDiv.innerText = 'Sending your message…';

        try {
            const config    = await loadConfig();
            const accessKey = config['web3forms.access-key'] || 'beff612e-87c9-4ad7-94bf-eb68845b0726';

            let response;

            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // ── Local dev: Python HTTP server can't handle POST /contact,
                //    so call Web3Forms directly from the browser (CORS supported).
                console.log('Local mode: calling Web3Forms directly from browser');
                response = await fetch('https://api.web3forms.com/submit', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        access_key: accessKey,
                        subject:    'LinkRi Contact Form',
                        name, email, mobile, message,
                        ...(linkedin && { linkedin_profile: linkedin }),
                        ...(naukri   && { naukri_profile:  naukri   }),
                    }),
                });
            } else {
                // ── Cloudflare Workers (or any real server): proxy through /contact
                //    so Web3Forms is called server-side with no CORS restriction.
                console.log('Worker mode: proxying via /contact');
                response = await fetch('/contact', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body:    JSON.stringify({
                        name, mobile, email, message,
                        ...(linkedin && { linkedin_profile: linkedin }),
                        ...(naukri   && { naukri_profile:  naukri   }),
                    }),
                });
            }

            const result = await response.json();
            console.log('Contact result:', result);

            if (result.success) {
                statusDiv.style.color = '#10b981';
                statusDiv.innerText = '✅ Message sent! We will get back to you soon.';
                if (form) form.reset();
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            statusDiv.style.color = '#ef4444';
            statusDiv.innerText = '❌ Could not send message. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalLabel;
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

            // Auto-start the About page video, resuming from saved position
            if (hash === '#about') {
                const video = document.getElementById('about-what-we-do-video');
                if (video) {
                    VideoManager.register(video);

                    // ── Inject a visible mute/unmute button overlay ──────────
                    const wrapper = video.parentElement;
                    if (wrapper && !document.getElementById('about-video-mute-btn')) {
                        const muteBtn = document.createElement('button');
                        muteBtn.id = 'about-video-mute-btn';
                        muteBtn.title = 'Click to unmute';
                        muteBtn.style.cssText = [
                            'position:absolute', 'bottom:8px', 'right:8px', 'z-index:10',
                            'background:rgba(0,0,0,0.55)', 'border:none', 'border-radius:50%',
                            'width:36px', 'height:36px', 'cursor:pointer',
                            'display:flex', 'align-items:center', 'justify-content:center',
                            'backdrop-filter:blur(4px)', 'font-size:16px', 'transition:background 0.2s'
                        ].join(';');

                        const syncIcon = () => {
                            muteBtn.textContent = video.muted ? '🔇' : '🔊';
                            muteBtn.title = video.muted ? 'Click to unmute' : 'Click to mute';
                        };
                        syncIcon();

                        muteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            video.muted = !video.muted;
                            if (!video.muted && video.paused) {
                                video.play().catch(() => {});
                            }
                            syncIcon();
                        });
                        muteBtn.addEventListener('mouseenter', () => muteBtn.style.background = 'rgba(0,0,0,0.8)');
                        muteBtn.addEventListener('mouseleave', () => muteBtn.style.background = 'rgba(0,0,0,0.55)');

                        // Keep button in sync when JS mutes/unmutes internally
                        video.addEventListener('volumechange', syncIcon);

                        wrapper.appendChild(muteBtn);
                    }

                    // ── Play from saved offset (waits for loadedmetadata if needed) ─
                    const savedTime = VideoManager.getSavedTime('about-what-we-do-video');
                    VideoManager.playWithAudio(video, savedTime);
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
