/**
 * Sannith Reddy Portfolio Core Scripts
 * Includes mobile drawer navigation, typewriter animation, collapsible height transitions,
 * drag-scroll and button-controlled project carousel, and recruiter form submission.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initTypewriter();
  initAccordion();
  initProjectCarousel();
  initFormSubmission();
  initScrollSpy();
});

/* ==========================================================================
   1. Mobile Navigation Drawer Controls
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('drawer-close');
  const drawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-links a');

  if (!toggleBtn || !drawer || !closeBtn) return;

  function openDrawer() {
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable background scroll
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable background scroll
  }

  toggleBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   2. Subtitle Typewriter Simulation
   ========================================================================== */
function initTypewriter() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const roles = [
    "AI/ML Developer",
    "CS Student",
    "Tech Lead Intern",
    "Software Engineer"
  ];

  let currentRoleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeStep() {
    const currentText = roles[currentRoleIdx];

    if (isDeleting) {
      typingElement.textContent = currentText.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 50;
    } else {
      typingElement.textContent = currentText.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 100;
    }

    // Determine state change
    if (!isDeleting && charIdx === currentText.length) {
      isDeleting = true;
      typingSpeed = 2000; // Hold at the end of the word
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      currentRoleIdx = (currentRoleIdx + 1) % roles.length;
      typingSpeed = 500; // Brief pause before typing next word
    }

    setTimeout(typeStep, typingSpeed);
  }

  typeStep();
}

/* ==========================================================================
   3. Collapsible About Me Accordion (Smooth Height Transitions)
   ========================================================================== */
function initAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const content = trigger.nextElementSibling;

      // Close all other items first (optional, but creates a cleaner UI)
      triggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherTrigger.nextElementSibling.style.maxHeight = null;
        }
      });

      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        // Retrieve internal container height for smooth transition
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

/* ==========================================================================
   4. Draggable and Button-Controlled Horizontal Project Carousel
   ========================================================================== */
function initProjectCarousel() {
  const carousel = document.getElementById('projects-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!carousel) return;

  // 4a. Button Controls
  const getCardWidth = () => {
    const card = carousel.querySelector('.project-card');
    if (!card) return 440;
    // Calculate full width including gap
    const style = window.getComputedStyle(carousel.querySelector('.projects-track'));
    const gap = parseInt(style.gap) || 32;
    return card.offsetWidth + gap;
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
    });
  }

  // 4b. Drag-to-Scroll Functionality for Desktop
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('grabbing');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('grabbing');
  });

  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('grabbing');
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    carousel.scrollLeft = scrollLeft - walk;
  });
}

/* ==========================================================================
   5. Recruiter Message Form Submission Feedback
   ========================================================================== */
function initFormSubmission() {
  const form = document.getElementById('recruiter-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();
    const submitBtn = form.querySelector('.form-submit-btn');

    if (!name || !email || !message) {
      showStatus('All fields are required. Please check inputs.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Simulating API call
    submitBtn.disabled = true;
    submitBtn.textContent = 'TRANSMITTING...';

    setTimeout(() => {
      showStatus('Message successfully sent to Sannith!', 'success');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND MESSAGE';
      form.reset();

      // Clear status banner after 5 seconds
      setTimeout(() => {
        statusEl.style.display = 'none';
        statusEl.className = 'form-status';
      }, 5000);
    }, 1500);
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status'; // Reset styling
    statusEl.style.display = 'block';

    if (type === 'success') {
      statusEl.classList.add('success');
    } else if (type === 'error') {
      statusEl.classList.add('error');
    }
  }
}

/* ==========================================================================
   6. Scroll-Spy Navigation Highlighting
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-links-bio)');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 100; // Account for header size buffer

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}
