import { login, logout, signup } from './login';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';
import { sign } from 'jsonwebtoken';

const loginForm = document.querySelector('.form-login')
const signupForm = document.querySelector('.form-signup')
const logoutBtn = document.querySelector('.nav__el--logout')
const signupBtn = document.querySelector('.signup-btn')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')
console.log(signupBtn)

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    console.log('mc')
    e.preventDefault();
    document.querySelector('.login-btn').textContent = 'Logging in..';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);

    document.querySelector('.login-btn').textContent = 'Log in'

  });
}

console.log('hhhhhhhh')
if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault()
    const form = new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])

    updateData(form, 'data')
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault()

    document.querySelector('.update--pass').textContent = 'updating..'
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateData({ currentPassword, password, confirmPassword }, 'password')

    document.querySelector('.update--pass').textContent = 'save password'

    document.getElementById('password-current').value = ''
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''
  })
}


if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    bookBtn.textContent = 'Processing..'
    console.log(e)
    const { tourId } = e.target.dataset;
    bookTour(tourId)
  })
}

if (signupBtn) {
  signupBtn.addEventListener('click', async e => {
    e.preventDefault();
    signupBtn.textContent = 'Signing in...'
    // const form = new FormData()
    // form.append('name', document.getElementById('name').value)
    // form.append('email', document.getElementById('email').value)
    // form.append('password', document.getElementById('password').value)
    // form.append('confrimPassword', document.getElementById('confrimPassword').value)

    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value
    await signup( name, email, password, confirmPassword )
  })
  signupBtn.textContent = 'Sign up'

}

if (logout) {
  logoutBtn.addEventListener('click', logout)
}