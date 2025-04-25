// Обработчик кнопки Log In в хедере
document.getElementById('loginBtn').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = 'login.html';
});

// Проверка авторизации при загрузке страниц
document.addEventListener('DOMContentLoaded', () => {
  const publicPages = ['login.html', 'register.html', 'index.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (publicPages.includes(currentPage)) {
      return;
  }
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
      window.location.href = 'login.html';
  }
});