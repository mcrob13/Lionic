const burger = document.querySelector('.burger');
const nav = document.querySelector('.header__nav');
const navList = document.querySelector('.nav__list');
const overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

burger.addEventListener('click', () => {
  nav.classList.toggle('is-active');
  navList.classList.toggle('is-active');
  overlay.classList.toggle('is-active');
  burger.classList.toggle('is-active');
});

// Закрытие при клике на оверлей
overlay.addEventListener('click', () => {
  nav.classList.remove('is-active');
  navList.classList.remove('is-active');
  overlay.classList.remove('is-active');
  burger.classList.remove('is-active');
});

const navLinks = document.querySelectorAll('.nav__link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-active');
    navList.classList.remove('is-active');
    overlay.classList.remove('is-active');
    burger.classList.remove('is-active');
  });
});


// мягкий плавный скролл

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Отменяем стандартное поведение
      const targetId = link.getAttribute('href');
      
      // Закрываем меню
      nav.classList.remove('is-active');
      overlay.classList.remove('is-active');
      burger.classList.remove('is-active');
  
      // Плавный скролл к якорю
      if (targetId !== '#') {
        setTimeout(() => {
          document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
          });
        }, 300); // Задержка для анимации закрытия меню
      }
    });
  });