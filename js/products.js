// Products Catalog Manager - Handles product browsing and search
class ProductsCatalogManager {
    constructor() {
        this.products = [];
        this.apiBaseUrl = 'https://ist256.up.ist.psu.edu:3001/api/products'; // backend endpointD
        this.init();
    }

    // Initialize products manager and load products
    init() {
        this.loadProductsFromAPI();
        this.setupEventListeners();
    }

    // Load products from backend API
    loadProductsFromAPI() {
        $.ajax({
            url: this.apiBaseUrl,
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                // Adjust depending on backend response shape
                this.products = Array.isArray(data) ? data : data.products;

                console.log('Products loaded from API:', this.products);
                this.displayAllProducts();
            },
            error: (xhr, status, error) => {
                console.error('Error loading products:', error);
                this.displayError();
            }
        });
    }

    // Setup event listeners for search and actions
    setupEventListeners() {
        $('#productsSearchBtn').click(() => this.searchProducts());
        $('#productsResetBtn').click(() => this.displayAllProducts());

        $('#productsSearchForm').on('keypress', (e) => {
            if (e.which === 13) {
                e.preventDefault();
                this.searchProducts();
            }
        });
    }

    // Search products by description and category
    searchProducts() {
        const searchDescription = $('#productsSearchDescription').val().toLowerCase().trim();
        const searchCategory = $('#productsSearchCategory').val();

        let results = this.products;

        if (searchDescription) {
            results = results.filter(product =>
                product.description.toLowerCase().includes(searchDescription)
            );
        }

        if (searchCategory) {
            results = results.filter(product =>
                product.category === searchCategory
            );
        }

        this.displayProductCards(results);
    }

    // Display all products
    displayAllProducts() {
        $('#productsSearchDescription').val('');
        $('#productsSearchCategory').val('');
        this.displayProductCards(this.products);
    }

    // Display product cards in grid
    displayProductCards(products) {
        const $container = $('#productsDisplay');
        $container.empty();

        if (!products || products.length === 0) {
            $container.html('<p class="col-12 text-center text-muted">No products found.</p>');
            return;
        }

        products.forEach(product => {
            const card = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card product-card shadow-sm h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${this.escapeHtml(product.description)}</h5>
                            <div class="product-details flex-grow-1">
                                <p class="card-text mb-2">
                                    <strong>Price:</strong> $${Number(product.price).toFixed(2)}
                                </p>
                                <p class="card-text mb-2">
                                    <strong>Category:</strong> ${this.escapeHtml(product.category)}
                                </p>
                                <p class="card-text mb-2">
                                    <strong>Unit:</strong> ${this.escapeHtml(product.unitOfMeasure)}
                                </p>
                                ${product.weight ? `<p class="card-text mb-2"><strong>Weight:</strong> ${product.weight} kg</p>` : ''}
                                <small class="text-muted">ID: ${product.id || product._id}</small>
                            </div>
                            <div class="mt-auto">
                                <a href="cart.html" class="btn btn-sm btn-primary w-100">View in Cart</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $container.append(card);
        });
    }

    // Display error message
    displayError() {
        const $container = $('#productsDisplay');
        $container.html('<p class="col-12 text-center text-danger">Error loading products from server. Please try again later.</p>');
    }

    // Utility: HTML escape to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize Products Catalog Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductsCatalogManager();
});