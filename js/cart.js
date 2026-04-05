// Shopping Cart Manager - Handles cart operations, search, and checkout
class ShoppingCartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        this.products = [];
        this.cartTaxRate = 0.08; // 8% tax rate
        this.init();
    }

    // Initialize cart manager and load products
    init() {
        this.loadProductsFromLocalStorage();
        this.setupEventListeners();
        this.displayProductJSON();
        this.updateCartDisplay();
    }

    // Load products from localStorage (user-created products)
    loadProductsFromLocalStorage() {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            try {
                this.products = JSON.parse(storedProducts);
                console.log('Products loaded from localStorage:', this.products);
                this.displayProductJSON();
            } catch (error) {
                console.error('Error parsing localStorage products:', error);
                this.products = [];
            }
        } else {
            console.log('No products in localStorage');
            this.products = [];
        }
    }

    // Setup event listeners for cart actions
    setupEventListeners() {
        // Clear cart button
        $('#clearCartBtn').click(() => this.clearCart());

        // Checkout button
        $('#checkoutBtn').click(() => this.checkout());
    }

    // Add product to cart
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('Product not found');
            return;
        }

        // Validate quantity
        if (quantity < 1 || !Number.isInteger(quantity)) {
            alert('Please enter a valid quantity');
            return;
        }

        // Check if product already in cart
        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
            console.log(`Updated quantity for ${product.description}: ${cartItem.quantity}`);
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
            console.log(`Added ${product.description} to cart`);
        }

        this.saveCart();
        this.updateCartDisplay();

        // Visual feedback
        alert(`${quantity} x ${product.description} added to cart!`);
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    // Update quantity of item in cart
    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const cartItem = this.cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    // Clear entire cart
    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            alert('Cart cleared');
        }
    }

    // Calculate cart totals
    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.cartTaxRate;
        const total = subtotal + tax;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };
    }

    // Update cart display (items table and totals)
    updateCartDisplay() {
        this.displayCartItems();
        this.updateCartTotals();
    }

    // Display cart items in table
    displayCartItems() {
        const $container = $('#cartItemsContainer');

        if (this.cart.length === 0) {
            $container.html('<p class="text-muted text-center py-4">Your cart is empty</p>');
            return;
        }

        let cartHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.cart.forEach(item => {
            const itemSubtotal = (item.price * item.quantity).toFixed(2);
            cartHTML += `
                <tr class="cart-item" data-product-id="${item.id}">
                    <td>
                        <div>
                            <strong>${this.escapeHtml(item.description)}</strong>
                            <br>
                            <small class="text-muted">ID: ${item.id} | Cat: ${item.category}</small>
                        </div>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm cart-qty-input" 
                            value="${item.quantity}" min="1" max="999" data-product-id="${item.id}" style="width: 80px;">
                    </td>
                    <td>$${itemSubtotal}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-danger remove-item-btn" 
                            data-product-id="${item.id}">Remove</button>
                    </td>
                </tr>
            `;
        });

        cartHTML += '</tbody></table></div>';
        $container.html(cartHTML);

        // Attach event listeners to quantity inputs and remove buttons
        $('.cart-qty-input').off('change').on('change', (e) => {
            const productId = parseInt($(e.currentTarget).data('product-id'));
            const newQuantity = parseInt($(e.currentTarget).val());
            this.updateQuantity(productId, newQuantity);
        });

        $('.remove-item-btn').off('click').on('click', (e) => {
            const productId = parseInt($(e.currentTarget).data('product-id'));
            this.removeFromCart(productId);
        });
    }

    // Update cart totals display
    updateCartTotals() {
        const { subtotal, tax, total } = this.calculateTotals();
        $('#cartSubtotal').text(`$${subtotal.toFixed(2)}`);
        $('#cartTax').text(`$${tax.toFixed(2)}`);
        $('#cartTotal').text(`$${total.toFixed(2)}`);
    }

    // Display product JSON on page
    displayProductJSON() {
        const $display = $('#productJsonDisplay');
        if (this.products.length === 0) {
            $display.html('<p class="text-muted">No products available</p>');
            return;
        }

        const productsJSON = {
            catalogName: "ShopSmart Product Catalog",
            lastUpdated: new Date().toISOString(),
            totalProducts: this.products.length,
            products: this.products
        };

        const jsonStr = JSON.stringify(productsJSON, null, 2);
        const pre = document.createElement('pre');
        pre.className = 'bg-light p-3 border rounded overflow-auto';
        pre.style.maxHeight = '400px';
        pre.textContent = jsonStr;

        $display.html(pre);
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
        console.log('Cart saved:', this.cart);
    }

    // Checkout function with AJAX
    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty. Please add items before proceeding to checkout.');
            return;
        }

        const { subtotal, tax, total } = this.calculateTotals();
        const checkoutData = {
            timestamp: new Date().toISOString(),
            items: this.cart,
            subtotal: subtotal,
            tax: tax,
            total: total,
            itemCount: this.cart.length
        };

        console.log('Checkout data:', checkoutData);

        // Save checkout data to localStorage before redirecting
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }

    // Utility: HTML escape to prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize Shopping Cart Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ShoppingCartManager();
});
