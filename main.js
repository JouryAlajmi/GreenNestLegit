/* ============================================
   GreenNest Plants — main.js
   ============================================ */

// ── Helper: is user logged in? ───────────────
function isLoggedIn() {
return localStorage.getItem('greennest_session') !== null;}

// ── LOGIN FORM ───────────────────────────────
const loginForm = document.querySelector('section.form-box:nth-of-type(1) form');

if (loginForm) {
  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !pass) {
      alert('Please fill in all login fields!');
    } else if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
    
    } else {
    const storedUser = localStorage.getItem(email);

      if (storedUser) {
    const userData = JSON.parse(storedUser); // Turn the text back into an object
    if (userData.password === pass) {
      localStorage.setItem('greennest_session', JSON.stringify(userData));
      alert('Login successful! Welcome back, ' + userData.name);
      window.location.href = 'index.html';
    } else {
      alert('Incorrect password. Please try again.');
    }
  } else {
    alert('No account found with that email. Please register first.');
  }
}
  });
}

// ── REGISTER FORM ────────────────────────────
const signupForm = document.querySelector('#create-account form');

if (signupForm) {
  signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass  = document.getElementById('reg-password').value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasUpper   = /[A-Z]/.test(pass);
    const hasLower   = /[a-z]/.test(pass);
    const hasNumber  = /[0-9]/.test(pass);
    const hasSymbol  = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (!name || !email || !pass) {
      alert('Please fill in all fields!');
    } else if (name.split(' ').length < 2) {
      alert('Please enter your full name (at least two words).');
    } else if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
    } else if (pass.length < 8) {
      alert('Password must be at least 8 characters long.');
    } else if (!hasUpper || !hasLower) {
      alert('Password must contain both uppercase and lowercase letters.');
    } else if (!hasNumber) {
      alert('Password must contain at least one number.');
    } else if (!hasSymbol) {
      alert('Password must contain at least one special character.');
    } else {
        const newUser = {
         name: name,
         email: email,
        password: pass 
  };
    localStorage.setItem(email, JSON.stringify(newUser));
    alert('Account created successfully! You can now login.');
      window.location.hash = ""; 
    window.location.href = 'login.html';
}
  });
}

// ── ADD TO CART (login required) ─────────────
function addToCart(productName, price) {
  if (!isLoggedIn()) {
    // Show inline guard message if on shop page
    const guard = document.getElementById('guard-msg');
    if (guard) {
      guard.classList.add('show');
      guard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert('Please login first before adding items to your cart.');
      window.location.href = 'login.html';
    }
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.findIndex(item => item.name === productName);

  if (existing >= 0) {
    cart[existing].quantity += 1;
  } else {
    cart.push({ name: productName, price: price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`✅ ${productName} has been added to your cart.`);
}

// ── CART: render (empty if not logged in) ────
function updateCart() {
  const cartBody = document.getElementById('cart-body');
  if (!cartBody) return;

  // If not logged in — show empty cart
  if (!isLoggedIn()) {
    cartBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#4b6043; padding:28px;">
          &#128274; Please <a href="login.html">login</a> to view your cart.
        </td>
      </tr>`;
    document.getElementById('cart-total').innerText = '$0';
    document.getElementById('cart-item-count').innerText = '0';
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = 0, itemCount = 0;
  cartBody.innerHTML = '';

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#4b6043; padding:28px;">
          Your cart is empty. <a href="shop.html">Go to shop</a>
        </td>
      </tr>`;
  }

  cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td><input type="number" value="${item.quantity}" min="1"
           onchange="updateQuantity(event, '${item.name}')"></td>
      <td>$${item.price}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
      <td>
        <button class="btn-remove" onclick="removeFromCart('${item.name}')"
                aria-label="Remove ${item.name} from cart">Remove</button>
      </td>`;
    cartBody.appendChild(row);
    total += item.price * item.quantity;
    itemCount += item.quantity;
  });

  document.getElementById('cart-total').innerText = `$${total.toFixed(2)}`;
  document.getElementById('cart-item-count').innerText = itemCount;
}

// ── REMOVE FROM CART ─────────────────────────
function removeFromCart(productName) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.name !== productName);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  alert(`🗑️ ${productName} has been removed from your cart.`);
}

// ── UPDATE QUANTITY ───────────────────────────
function updateQuantity(event, productName) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const product = cart.find(item => item.name === productName);
  if (product) {
    product.quantity = parseInt(event.target.value) || 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
  }
}

// ── SHOP FILTER BUTTONS ───────────────────────
function initFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const products = document.querySelectorAll('.product-card');

      products.forEach(card => {
        const climate = card.getAttribute('data-climate');
        card.style.display = (filter === 'all' || climate === filter) ? '' : 'none';
      });
    });
  });
}

// ── CLIMATE FILTER FROM URL PARAM ─────────────
function filterByClimate() {
  const params = new URLSearchParams(window.location.search);
  const climate = params.get('climate');
  if (!climate) return;

  const products = document.querySelectorAll('.product-card');
  products.forEach(card => {
    card.style.display = card.getAttribute('data-climate') === climate ? '' : 'none';
  });

  // Mark matching filter button active
  const btn = document.querySelector(`.filter-btn[data-filter="${climate}"]`);
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

// ── CHECKOUT GUARD ────────────────────────────
function proceedToCheckout() {
  if (!isLoggedIn()) {
    alert('Please login before proceeding to checkout.');
    window.location.href = 'login.html';
  } else {
    window.location.href = 'login.html';
  }
}

// ── INIT ──────────────────────────────────────
window.onload = function () {
  if (document.getElementById('cart-body')) updateCart();
  initFilterButtons();
  filterByClimate();
};
function updateNavigation() {
  const session = localStorage.getItem('greennest_session');
  const loginLink = document.querySelector('a[href="login.html"]');

  if (session && loginLink) {
    const user = JSON.parse(session);
    loginLink.innerHTML = `Logout (${user.name})`;
    loginLink.href = "#"; 
    loginLink.addEventListener('click', () => {
      localStorage.removeItem('greennest_session'); 
      location.reload(); 
    });
  }
}
document.addEventListener('DOMContentLoaded', updateNavigation);


