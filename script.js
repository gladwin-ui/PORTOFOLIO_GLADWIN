/* =============================================
   script.js — Interaktivitas halaman portofolio
   
   Fitur:
   1. Navbar scroll effect (backdrop-blur)
   2. Mobile hamburger menu toggle
   3. Fade-in animation via Intersection Observer
   4. Smooth scroll untuk navigasi anchor
   5. Project detail overlay (klik kartu → fokus)
============================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------
       1. NAVBAR SCROLL EFFECT
       Tambah class --scrolled saat halaman
       di-scroll ke bawah lebih dari 40px
    ----------------------------------------- */
    const navbar = document.getElementById('navbar');

    const handleNavbarScroll = () => {
        if (window.scrollY > 40) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }
    };

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    // Jalankan sekali saat load (jika halaman sudah di-scroll)
    handleNavbarScroll();


    /* -----------------------------------------
       2. MOBILE HAMBURGER MENU
       Toggle class untuk membuka/menutup
       sidebar navigasi di layar kecil
    ----------------------------------------- */
    const navToggle = document.getElementById('navbar-toggle');
    const navLinks = document.querySelector('.navbar__links');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('navbar__toggle--active');
        navLinks.classList.toggle('navbar__links--open');
    });

    // Tutup menu saat link diklik
    navLinks.querySelectorAll('.navbar__link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('navbar__toggle--active');
            navLinks.classList.remove('navbar__links--open');
        });
    });


    /* -----------------------------------------
       3. FADE-IN ANIMATION (Intersection Observer)
       Elemen dengan class .fade-in akan muncul
       dengan animasi saat masuk viewport — stagger
       per-section agar terasa lebih hidup
    ----------------------------------------- */
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in--visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    });

    // Stagger delay di-reset per section — bukan global
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionFades = section.querySelectorAll('.fade-in');
        sectionFades.forEach((el, index) => {
            el.style.transitionDelay = `${index * 0.1}s`;
        });
    });
    // Heading tanpa delay
    document.querySelectorAll('.section-heading.fade-in, .hero__content.fade-in').forEach(el => {
        el.style.transitionDelay = '0s';
    });

    fadeElements.forEach(el => fadeObserver.observe(el));


    /* -----------------------------------------
       4. SMOOTH SCROLL UNTUK ANCHOR LINKS
       Navigasi halus ke bagian tujuan saat
       klik link anchor (href="#...")
    ----------------------------------------- */
    document.querySelectorAll('a[href^="#"]:not(#project-detail-link)').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    /* -----------------------------------------
       5. PROJECT DETAIL OVERLAY
       Saat kartu proyek diklik, overlay muncul
       menampilkan detail lengkap proyek tersebut
    ----------------------------------------- */
    const detailOverlay = document.getElementById('project-detail');
    const detailClose = document.getElementById('project-detail-close');
    const detailImage = document.getElementById('project-detail-image');
    const detailTitle = document.getElementById('project-detail-title');
    const detailTags = document.getElementById('project-detail-tags');
    const detailDesc = document.getElementById('project-detail-desc');
    const detailText = document.getElementById('project-detail-text');
    const detailBackdrop = detailOverlay.querySelector('.project-detail__backdrop');

    // "View Project" link — explicit handler to open URL in new tab
    const detailLink = document.getElementById('project-detail-link');
    if (detailLink) {
        detailLink.addEventListener('click', (e) => {
            e.stopPropagation();
            const href = detailLink.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank', 'noopener,noreferrer');
            }
            e.preventDefault();
        });
    }
    
    // Slider elements
    const sliderPrev = document.getElementById('slider-prev');
    const sliderNext = document.getElementById('slider-next');
    const sliderDots = document.getElementById('slider-dots');

    let currentImages = [];
    let currentImageIndex = 0;

    const updateSlider = () => {
        detailImage.src = currentImages[currentImageIndex];
        
        // Update dots
        if (sliderDots) {
            const dots = sliderDots.querySelectorAll('.project-detail__slider-dot');
            dots.forEach((dot, index) => {
                if (index === currentImageIndex) {
                    dot.classList.add('project-detail__slider-dot--active');
                } else {
                    dot.classList.remove('project-detail__slider-dot--active');
                }
            });
        }

        // Hide/Show controls if only 1 image
        if (currentImages.length > 1) {
            if (sliderPrev) sliderPrev.style.display = 'flex';
            if (sliderNext) sliderNext.style.display = 'flex';
            if (sliderDots) sliderDots.style.display = 'flex';
        } else {
            if (sliderPrev) sliderPrev.style.display = 'none';
            if (sliderNext) sliderNext.style.display = 'none';
            if (sliderDots) sliderDots.style.display = 'none';
        }
    };

    if (sliderPrev && sliderNext) {
        sliderPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentImages.length > 1) {
                currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
                updateSlider();
            }
        });

        sliderNext.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentImages.length > 1) {
                currentImageIndex = (currentImageIndex + 1) % currentImages.length;
                updateSlider();
            }
        });
    }

    /**
     * Buka overlay detail proyek
     * @param {HTMLElement} card - Elemen kartu proyek
     */
    const openProjectDetail = (card) => {
        // Ambil data dari atribut data-* pada kartu
        const title = card.dataset.title;
        const imageRaw = card.dataset.image;
        const tags = card.dataset.tags;
        const desc = card.dataset.desc;
        const detail = card.dataset.detail;
        const url = card.dataset.url || '';

        // Set URL on the "View Project" link
        const detailLink = document.getElementById('project-detail-link');
        if (detailLink) {
            if (url) {
                detailLink.href = url;
                detailLink.style.display = 'inline-flex';
            } else {
                detailLink.href = '#';
                detailLink.style.display = 'none';
            }
        }
        // Parse images
        currentImages = imageRaw ? imageRaw.split(',').map(src => src.trim()) : [];
        currentImageIndex = 0;
        
        // Generate dots
        if (sliderDots) {
            sliderDots.innerHTML = '';
            if (currentImages.length > 1) {
                currentImages.forEach((_, index) => {
                    const dot = document.createElement('div');
                    dot.className = 'project-detail__slider-dot';
                    if (index === 0) dot.classList.add('project-detail__slider-dot--active');
                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentImageIndex = index;
                        updateSlider();
                    });
                    sliderDots.appendChild(dot);
                });
            }
        }

        updateSlider();

        // Isi konten overlay
        detailImage.alt = title;
        detailTitle.textContent = title;
        detailDesc.textContent = desc;
        detailText.textContent = detail;

        // Buat tag elements
        detailTags.innerHTML = '';
        if (tags) {
            tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag.trim();
                detailTags.appendChild(span);
            });
        }

        // Tampilkan overlay
        detailOverlay.classList.add('project-detail--open');
        detailOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('detail-open');

        // Scroll konten ke atas
        const content = detailOverlay.querySelector('.project-detail__content');
        if (content) content.scrollTop = 0;
    };

    /**
     * Tutup overlay detail proyek
     */
    const closeProjectDetail = () => {
        detailOverlay.classList.remove('project-detail--open');
        detailOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('detail-open');
    };

    // Event: klik kartu proyek → buka detail
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            openProjectDetail(card);
        });
    });

    // Event: klik tombol close → tutup detail
    detailClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeProjectDetail();
    });

    // Event: klik backdrop → tutup detail
    detailBackdrop.addEventListener('click', () => {
        closeProjectDetail();
    });

    // Event: tekan Escape → tutup detail
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailOverlay.classList.contains('project-detail--open')) {
            closeProjectDetail();
        }
    });

});
