let loginPage = document.querySelector('.login-button');
let signupPage = document.querySelector('.signup-button');

loginPage.addEventListener('click', () => {
    window.location.href = '../login/login.html';
}); 
signupPage.addEventListener('click', () => {
    window.location.href = '../signup/signup.html';
}); 