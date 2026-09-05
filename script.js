document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const opening = document.getElementById('opening');
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');

    // ==========================================
    // AUDIO HELPER FUNCTIONS
    // ==========================================
    function playAudio() {
        if (bgAudio && bgAudio.paused) {
            bgAudio.play()
                .then(() => {
                    if (audioIcon) {
                        audioIcon.innerHTML = `
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        `;
                    }
                    if (audioToggle) audioToggle.setAttribute('title', 'Pause Music');
                })
                .catch(err => {
                    console.log("Audio playback failed:", err);
                });
        }
    }

    function pauseAudio() {
        if (bgAudio && !bgAudio.paused) {
            bgAudio.pause();
            if (audioIcon) {
                audioIcon.innerHTML = `
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09 12 8.18V4zm-8.09-.09L2.81 5.09 6.82 9H4v6h4l5 5v-6.83l4.88 4.88c-.62.47-1.31.85-2.08 1.09v2.01c1.3-.3 2.49-.93 3.47-1.76l2.62 2.62 1.41-1.41L4.82 2.81 3.91 3.91zM12 15.17L9.83 13H8v-2h1.83l.26-.26 1.91 1.91v2.52z"/>
                `;
            }
            if (audioToggle) audioToggle.setAttribute('title', 'Play Music');
        }
    }

    // ==========================================
    // 0. OPENING DOORS — tap to reveal invitation
    // ==========================================
    if (opening) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('has-opening');

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function finishOpening() {
            document.body.style.overflow = '';
            document.body.classList.remove('has-opening');
            opening.classList.add('is-done');
            opening.remove();
        }

        function openDoors(e) {
            if (opening.classList.contains('is-open')) return;
            opening.classList.add('is-open');
            opening.removeEventListener('click', openDoors);
            opening.removeEventListener('touchstart', openDoors);
            opening.removeEventListener('keydown', onOpeningKey);

            // Auto-play music after this first interaction (satisfies autoplay policy)
            playAudio();

            // Smoothly reveal hero content as doors slide open
            if (window.gsap && !prefersReducedMotion) {
                gsap.fromTo(".hero-content > *",
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.12, duration: 1.1, delay: 0.2, ease: "power2.out", clearProps: "transform,opacity" }
                );
            }

            window.setTimeout(finishOpening, prefersReducedMotion ? 0 : 1150);
        }

        function onOpeningKey(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDoors(e); }
        }

        opening.addEventListener('click', openDoors);
        opening.addEventListener('touchstart', openDoors, { passive: true });
        opening.addEventListener('keydown', onOpeningKey);
    }

    // ==========================================
    // 1. LIVE COUNTDOWN TIMER
    // Target: 17 October 2026, 6:00 PM (Indian Standard Time: +05:30)
    // ==========================================
    const targetDate = new Date('2026-10-17T18:00:00+05:30').getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            clearInterval(countdownTimer);
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('minutes').innerText = "00";
            document.getElementById('seconds').innerText = "00";

            const titleEl = document.querySelector('.countdown-title');
            if (titleEl) titleEl.innerText = "The Celebration Has Begun!";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }, 1000);


    // ==========================================
    // 2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }


    // ==========================================
    // 3. AUDIO CONTROLLER TOGGLE & FALLBACK
    // ==========================================
    if (audioToggle && bgAudio && audioIcon) {
        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgAudio.paused) {
                playAudio();
            } else {
                pauseAudio();
            }
        });
    }

    // Fallback: start music on first user interaction if browser blocked autoplay initially
    let musicStarted = false;
    function tryStartMusicOnce() {
        if (musicStarted || !bgAudio) return;
        if (bgAudio.paused) {
            playAudio();
            musicStarted = true;
        }
    }
    ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
        document.addEventListener(evt, tryStartMusicOnce, { once: true, passive: true });
    });




    // ==========================================
    // 5. HERO PARALLAX ON SCROLL (subtle)
    // ==========================================
    const heroImg = document.getElementById('heroImg');
    if (heroImg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const offset = window.scrollY;
                    if (offset < window.innerHeight) {
                        heroImg.style.transform = `translateY(${offset * 0.15}px) scale(1.08)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================
    // 6. SCROLL CUE CLICK
    // ==========================================
    const scrollCue = document.getElementById('scrollCue');
    if (scrollCue) {
        scrollCue.addEventListener('click', (e) => {
            e.preventDefault();
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
