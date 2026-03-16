// validation for sign-up form

document.addEventListener('DOMContentLoaded', () => {
  // elements for signup form
  const signupForm = document.getElementById('signupForm');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const phone = document.getElementById('phone');
  const age = document.getElementById('age');
  const address = document.getElementById('address');

  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const phoneError = document.getElementById('phoneError');
  const ageError = document.getElementById('ageError');
  const addressError = document.getElementById('addressError');

  // elements for login form
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginEmailError = document.getElementById('loginEmailError');
  const loginPasswordError = document.getElementById('loginPasswordError');
  const signupResult = document.getElementById('signupResult');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(input, messageElem, message) {
    input.classList.add('border', 'border-danger');
    messageElem.textContent = message;
    messageElem.classList.remove('d-none');
  }

  function clearError(input, messageElem) {
    input.classList.remove('border', 'border-danger');
    messageElem.textContent = '';
    messageElem.classList.add('d-none');
  }

  let triedSubmitSignup = false;
  let triedSubmitLogin = false;

  function validateSignup(showAll = true) {
    let valid = true;

    // first name required
    if (!firstName.value.trim()) {
      if (showAll) showError(firstName, firstNameError, 'First name is required');
      valid = false;
    } else {
      clearError(firstName, firstNameError);
    }

    // last name required
    if (!lastName.value.trim()) {
      if (showAll) showError(lastName, lastNameError, 'Last name is required');
      valid = false;
    } else {
      clearError(lastName, lastNameError);
    }

    // email required + format
    if (!email.value.trim()) {
      if (showAll) showError(email, emailError, 'Email is required');
      valid = false;
    } else if (!emailPattern.test(email.value)) {
      if (showAll) showError(email, emailError, 'Invalid email format');
      valid = false;
    } else {
      clearError(email, emailError);
    }

    // password required (min 8 characters)
    if (!password.value) {
      if (showAll) showError(password, passwordError, 'Password is required');
      valid = false;
    } else if (password.value.length < 8) {
      if (showAll) showError(password, passwordError, 'Password must be at least 8 characters');
      valid = false;
    } else {
      clearError(password, passwordError);
    }

    // phone optional (if provided, check for basic digits)
    if (phone.value.trim()) {
      const phonePattern = /^[0-9\s()+-]+$/;
      if (!phonePattern.test(phone.value.trim())) {
        if (showAll) showError(phone, phoneError, 'Invalid phone number format');
        valid = false;
      } else {
        clearError(phone, phoneError);
      }
    } else {
      clearError(phone, phoneError);
    }

    // age required (13-100)
    const ageValue = Number(age.value);
    if (!age.value.trim()) {
      if (showAll) showError(age, ageError, 'Age is required');
      valid = false;
    } else if (Number.isNaN(ageValue) || ageValue < 13 || ageValue > 100) {
      if (showAll) showError(age, ageError, 'Age must be between 13 and 100');
      valid = false;
    } else {
      clearError(age, ageError);
    }

    // address required
    if (!address.value.trim()) {
      if (showAll) showError(address, addressError, 'Home address is required');
      valid = false;
    } else {
      clearError(address, addressError);
    }

    return valid;
  }

  function getShoppers() {
    const shoppersRaw = localStorage.getItem('shoppers');
    if (!shoppersRaw) return [];
    try {
      return JSON.parse(shoppersRaw);
    } catch {
      return [];
    }
  }

  function setShoppers(shoppers) {
    localStorage.setItem('shoppers', JSON.stringify(shoppers, null, 2));
  }

function displayShopper(shopper) {
    if (!signupResult) return;
    const pre = document.createElement('pre');
    pre.className = 'bg-light p-3 border rounded';
    pre.textContent = JSON.stringify(shopper, null, 2);
    signupResult.innerHTML = '<h5 class="mb-2">New Shopper JSON</h5>';
    signupResult.appendChild(pre);
  }

  function saveShopper() {
    const shoppers = getShoppers();
    const shopUser = {
      id: Date.now(),
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || null,
      age: Number(age.value),
      address: address.value.trim(),
      createdAt: new Date().toISOString()
    }; 

    shoppers.push(shopUser);
    setShoppers(shoppers);

    displayShopper(shopUser);

    return shopUser;
  }

  function validateLogin(showAll = true) {
    let valid = true;
    // email required + format
    if (!loginEmail.value.trim()) {
      if (showAll) showError(loginEmail, loginEmailError, 'Email is required');
      valid = false;
    } else if (!emailPattern.test(loginEmail.value)) {
      if (showAll) showError(loginEmail, loginEmailError, 'Invalid email format');
      valid = false;
    } else {
      clearError(loginEmail, loginEmailError);
    }

    // password required
    if (!loginPassword.value) {
      if (showAll) showError(loginPassword, loginPasswordError, 'Password is required');
      valid = false;
    } else {
      clearError(loginPassword, loginPasswordError);
    }

    return valid;
  }

  // submit handlers
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    triedSubmitSignup = true;

    if (!validateSignup(true)) {
      return;
    }

    const shopper = saveShopper();
    console.log('Shopper saved', shopper);

    // Reset form after successful signup
    signupForm.reset();
    triedSubmitSignup = false;

    alert('Sign-up successful! Your account information has been saved.');
  });

  loginForm.addEventListener('submit', (e) => {
    triedSubmitLogin = true;
    if (!validateLogin(true)) {
      e.preventDefault();
    }
  });

  // input listeners for signup
  [firstName, lastName, email, password, phone, age, address].forEach((input) => {
    input.addEventListener('input', () => {
      if (triedSubmitSignup) {
        validateSignup(true);
      }
    });
  });

  // input listeners for login
  [loginEmail, loginPassword].forEach((input) => {
    input.addEventListener('input', () => {
      if (triedSubmitLogin) {
        validateLogin(true);
      }
    });
  });
});
