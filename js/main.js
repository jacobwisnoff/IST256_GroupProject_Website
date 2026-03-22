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
  if (signupForm) {
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

    // input listeners for signup
    [firstName, lastName, email, password, phone, age, address].forEach((input) => {
      input.addEventListener('input', () => {
        if (triedSubmitSignup) {
          validateSignup(true);
        }
      });
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      triedSubmitLogin = true;
      if (!validateLogin(true)) {
        e.preventDefault();
      }
    });

    // input listeners for login
    [loginEmail, loginPassword].forEach((input) => {
      input.addEventListener('input', () => {
        if (triedSubmitLogin) {
          validateLogin(true);
        }
      });
    });
  }

  // Product form validation
  const productForm = document.getElementById('productForm');
  const productDescription = document.getElementById('productDescription');
  const productCategory = document.getElementById('productCategory');
  const unitOfMeasure = document.getElementById('unitOfMeasure');
  const productPrice = document.getElementById('productPrice');
  const productWeight = document.getElementById('productWeight');

  const productDescriptionError = document.getElementById('productDescriptionError');
  const productCategoryError = document.getElementById('productCategoryError');
  const unitOfMeasureError = document.getElementById('unitOfMeasureError');
  const productPriceError = document.getElementById('productPriceError');
  const productResult = document.getElementById('productResult');

  let triedSubmitProduct = false;

  function validateProduct(showAll = true) {
    let valid = true;

    // Product description required
    if (!productDescription.value.trim()) {
      if (showAll) showError(productDescription, productDescriptionError, 'Product description is required');
      valid = false;
    } else {
      clearError(productDescription, productDescriptionError);
    }

    // Product category required (must not be empty string)
    if (!productCategory.value) {
      if (showAll) showError(productCategory, productCategoryError, 'Product category is required');
      valid = false;
    } else {
      clearError(productCategory, productCategoryError);
    }

    // Unit of measure required
    if (!unitOfMeasure.value) {
      if (showAll) showError(unitOfMeasure, unitOfMeasureError, 'Unit of measure is required');
      valid = false;
    } else {
      clearError(unitOfMeasure, unitOfMeasureError);
    }

    // Product price required and must be greater than 0
    const priceValue = Number(productPrice.value);
    if (!productPrice.value || productPrice.value === '') {
      if (showAll) showError(productPrice, productPriceError, 'Product price is required');
      valid = false;
    } else if (isNaN(priceValue) || priceValue <= 0) {
      if (showAll) showError(productPrice, productPriceError, 'Product price must be greater than 0');
      valid = false;
    } else {
      clearError(productPrice, productPriceError);
    }

    return valid;
  }

  function saveProduct() {
    const product = {
      id: Date.now(),
      description: productDescription.value.trim(),
      category: productCategory.value,
      unitOfMeasure: unitOfMeasure.value,
      price: Number(productPrice.value),
      weight: productWeight.value ? Number(productWeight.value) : null,
      createdAt: new Date().toISOString()
    };

    // Get existing products from localStorage
    const productsRaw = localStorage.getItem('products');
    let products = [];
    try {
      products = productsRaw ? JSON.parse(productsRaw) : [];
    } catch {
      products = [];
    }

    products.push(product);
    localStorage.setItem('products', JSON.stringify(products, null, 2));

    // Display the saved product
    if (productResult) {
      const pre = document.createElement('pre');
      pre.className = 'bg-light p-3 border rounded';
      pre.textContent = JSON.stringify(product, null, 2);
      productResult.innerHTML = '<h5 class="mb-2">New Product JSON</h5>';
      productResult.appendChild(pre);
    }

    return product;
  }

  // Product form submit handler
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      triedSubmitProduct = true;

      if (!validateProduct(true)) {
        return;
      }

      const product = saveProduct();
      console.log('Product saved', product);

      // Reset form after successful submission
      productForm.reset();
      triedSubmitProduct = false;

      alert('Product added successfully!');
    });

    // Input listeners for product form
    [productDescription, productCategory, unitOfMeasure, productPrice].forEach((input) => {
      input.addEventListener('input', () => {
        if (triedSubmitProduct) {
          validateProduct(true);
        }
      });
      input.addEventListener('change', () => {
        if (triedSubmitProduct) {
          validateProduct(true);
        }
      });
    });
  }

  // jQuery Search Functionality
  function getProductsFromStorage() {
    const productsRaw = localStorage.getItem('products');
    try {
      return productsRaw ? JSON.parse(productsRaw) : [];
    } catch {
      return [];
    }
  }

  function displayProductCards(products, containerId) {
    const $container = $('#' + containerId);
    $container.empty();

    if (products.length === 0) {
      $container.html('<p class="col-12 text-center text-muted">No products found.</p>');
      return;
    }

    products.forEach((product) => {
      const card = `
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">${product.description}</h5>
              <p class="card-text">
                <strong>Category:</strong> ${product.category}<br>
                <strong>Price:</strong> $${product.price.toFixed(2)}<br>
                <strong>Unit:</strong> ${product.unitOfMeasure}
                ${product.weight ? `<br><strong>Weight:</strong> ${product.weight} kg` : ''}
              </p>
              <small class="text-muted">Added: ${new Date(product.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
        </div>
      `;
      $container.append(card);
    });
  }

  // Product Management page search
  $('#searchBtn').click(function() {
    const description = $('#searchDescription').val().toLowerCase();
    const category = $('#searchCategory').val();

    let products = getProductsFromStorage();

    // Filter products
    products = products.filter((product) => {
      const matchesDescription = !description || product.description.toLowerCase().includes(description);
      const matchesCategory = !category || product.category === category;
      return matchesDescription && matchesCategory;
    });

    displayProductCards(products, 'searchResults');
  });

  // Index page search
  $('#indexSearchBtn').click(function() {
    const description = $('#indexSearchDescription').val().toLowerCase();
    const category = $('#indexSearchCategory').val();

    let products = getProductsFromStorage();

    // Filter products
    products = products.filter((product) => {
      const matchesDescription = !description || product.description.toLowerCase().includes(description);
      const matchesCategory = !category || product.category === category;
      return matchesDescription && matchesCategory;
    });

    displayProductCards(products, 'indexSearchResults');
  });

  // Load all products on page load
  if ($('#searchResults').length) {
    const allProducts = getProductsFromStorage();
    displayProductCards(allProducts, 'searchResults');
  }
  if ($('#indexSearchResults').length) {
    const allProducts = getProductsFromStorage();
    displayProductCards(allProducts, 'indexSearchResults');
  }
});
  

