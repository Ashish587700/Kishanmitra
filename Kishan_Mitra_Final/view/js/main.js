document.addEventListener('DOMContentLoaded', function() {
  initializeMobileMenu();
  initializeSlider();
  initializeContactForm();
  initializeNavigation();
  
  if (document.querySelector('.hero')) {
    animateHeroSection();
  }
});


function initializeMobileMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav-links');
  
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('active');

      burger.classList.toggle('toggle');
     
      if (burger.classList.contains('toggle')) {
        burger.querySelector('.line1').style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        burger.querySelector('.line2').style.opacity = '0';
        burger.querySelector('.line3').style.transform = 'rotate(45deg) translate(-5px, -6px)';
      } else {
        burger.querySelector('.line1').style.transform = 'none';
        burger.querySelector('.line2').style.opacity = '1';
        burger.querySelector('.line3').style.transform = 'none';
      }
    });
  }
  document.addEventListener('click', (e) => {
    if (nav && nav.classList.contains('active') && !e.target.closest('.nav-links') && !e.target.closest('.burger')) {
      nav.classList.remove('active');
      
      if (burger.classList.contains('toggle')) {
        burger.classList.remove('toggle');
        burger.querySelector('.line1').style.transform = 'none';
        burger.querySelector('.line2').style.opacity = '1';
        burger.querySelector('.line3').style.transform = 'none';
      }
    }
  });
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
    });
  }
  
  if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }
  document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && 
        !e.target.closest('.sidebar') && 
        !e.target.closest('#menuToggle')) {
      sidebar.classList.remove('active');
    }
  });
}
function initializeSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.slider-dot');
  
  if (slides.length === 0 || dots.length === 0) return;
  
  let currentSlide = 0;
  
  slides?.forEach((slide, index) => {
    if (index !== 0) {
      slide.style.display = 'none';
    }
  });
  
  dots?.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
    });
  });
  
  function showSlide(index) {
  
    slides?.forEach(slide => {
      slide.style.display = 'none';
    });
    dots?.forEach(dot => {
      dot.classList.remove('active');
    });
    
    slides[index].style.display = 'block';
    slides[index].classList.add('fade-in');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  setInterval(() => {
    let nextSlide = (currentSlide + 1) % slides.length;
    showSlide(nextSlide);
  }, 5000);
}

function initializeContactForm() {
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = contactForm.querySelector('#name').value;
      const email = contactForm.querySelector('#email').value;
      const message = contactForm.querySelector('#message').value;
      
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }
      
      alert('Thank you for your message! We will get back to you soon.');
      contactForm.reset();
    });
  }
}

function animateHeroSection() {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroText = document.querySelector('.hero-text');
  const heroButtons = document.querySelector('.hero-buttons');
  
  if (heroTitle) heroTitle.classList.add('slide-up');
  if (heroSubtitle) {
    setTimeout(() => {
      heroSubtitle.classList.add('slide-up');
    }, 200);
  }
  
  if (heroText) {
    setTimeout(() => {
      heroText.classList.add('slide-up');
    }, 400);
  }
  
  if (heroButtons) {
    setTimeout(() => {
      heroButtons.classList.add('slide-up');
    }, 600);
  }
}

function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.dashboard-page');
  const pageTitle = document.getElementById('pageTitle');
  
  if (navLinks.length === 0 || pages.length === 0) return;
  
  navLinks?.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const pageId = this.dataset.page;
     
      navLinks?.forEach(link => link.classList.remove('active'));
      pages?.forEach(page => page.classList.remove('active'));
      
      this.classList.add('active');
      
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.classList.add('active');
        
        if (pageTitle) {
          const formattedTitle = pageId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          pageTitle.textContent = formattedTitle;
        }
      }
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && window.innerWidth < 992) {
        sidebar.classList.remove('active');
      }
    });
  });
  
  const headerPageLinks = document.querySelectorAll('.header-actions a[data-page]');
  
  if (headerPageLinks.length > 0) {
    headerPageLinks?.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const pageId = this.dataset.page;
        const targetNavLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
        
        if (targetNavLink) {
          targetNavLink.click();
        }
      });
    });
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  const headerLogout = document.getElementById('headerLogout');
  
  const handleLogout = function(e) {
    e.preventDefault();
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
   
    window.location.href = 'login.html';
  };
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (headerLogout) {
    headerLogout.addEventListener('click', handleLogout);
  }
}

function setupModal(modalId, openTriggerId, closeTriggerId) {
  const modal = document.getElementById(modalId);
  const openTrigger = document.getElementById(openTriggerId);
  const closeTrigger = modal ? modal.querySelector('.close-modal') : null;
  const closeButton = document.getElementById(closeTriggerId);
  
  if (!modal) return;
  
  const openModal = () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
  };
  
  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = ''; 
  };
 
  if (openTrigger) {
    openTrigger.addEventListener('click', openModal);
  }
  
  if (closeTrigger) {
    closeTrigger.addEventListener('click', closeModal);
  }
  
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });
  
  return {
    open: openModal,
    close: closeModal
  };
}

function formatDate(date, includeTime = false) {
  const dateObj = new Date(date);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('en-IN', options);
}

function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').replace(/\.00$/, '');
}

function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substr(2, 9);
}

function truncateText(text, length = 100) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function getInitials(name) {
  if (!name) return '';
  
  const parts = name.split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function createAvatarElement(name) {
  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  
  const placeholder = document.createElement('div');
  placeholder.className = 'avatar-placeholder';
  
  const initials = document.createElement('span');
  initials.textContent = getInitials(name);
  
  placeholder.appendChild(initials);
  avatar.appendChild(placeholder);
  
  return avatar;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    formatCurrency,
    generateId,
    truncateText,
    getInitials,
    setupModal
  };
}