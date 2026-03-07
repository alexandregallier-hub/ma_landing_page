// Form submission handler
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Message envoyé ! (à connecter à votre backend)');
  e.target.reset();
});
