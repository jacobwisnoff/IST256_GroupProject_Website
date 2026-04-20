// Products Catalog Manager - Handles product browsing and search
class ProductsCatalogManager {
    constructor() {
        this.apiBaseUrl = 'https://130.203.136.203:3001';
        this.products = [];
        this.init();
    }

    normalizeProduct(product, index = 0) {
        if (!product || typeof product !== 'object') {
            return null;
        }

        const description = typeof product.description === 'string' ? product.description.trim() : '';
        const category = typeof product.category === 'string' ? product.category.trim() : '';
        const unitOfMeasure = typeof product.unitOfMeasure === 'string' ? product.unitOfMeasure.trim() : '';
        const price = Number(product.price);

        if (!description || !category || !unitOfMeasure || Number.isNaN(price) || price <= 0) {
            return null;
        }

        return {
            id: product.id !== undefined && product.id !== null ? product.id : `auto-${Date.now()}-${index}`,
            description,
            category,
            unitOfMeasure,
            price,
            weight: product.weight !== undefined && product.weight !== null && product.weight !== '' ? Number(product.weight) : null,
            createdAt: product.createdAt || new Date().toISOString()
        };
    }

    sanitizeProductList(products = []) {
        if (!Array.isArray(products)) {
            return [];
        }

        return products
            .map((product, index) => this.normalizeProduct(product, index))
            .filter((product) => product !== null);
    }

    getApiUrl(path) {
        return `${this.apiBaseUrl}${path}`;
    }

    // Initialize products manager and load products
    init() {
        this.loadProductsFromApi();
        this.setupEventListeners();
    }

    loadProductsFromApi() {
        $.ajax({
            url: this.getApiUrl('/api/products'),
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                this.products = this.sanitizeProductList(Array.isArray(data) ? data : []);
                localStorage.setItem('products', JSON.stringify(this.products, null, 2));
                console.log('Products loaded from API:', this.products);
                this.displayAllProducts();
            },
            error: (xhr, status, error) => {
                console.warn('Error loading products from API:', error);
                this.loadProductsFromJSON();
            }
        });
    }

    // Load products from JSON file using AJAX
    loadProductsFromJSON() {
        $.ajax({
            url: 'data/products.json',
            type: 'GET',
            dataType: 'json',
            success: (data) => {
                this.products = this.sanitizeProductList(data.products);
                console.log('Products loaded from JSON:', this.products);
                this.displayAllProducts();
            },
            error: (xhr, status, error) => {
                console.error('Error loading products:', error);
                this.loadProductsFromLocalStorage();
            }
        });
    }

    // Fallback: Load products from localStorage if JSON fails
    loadProductsFromLocalStorage() {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            try {
                this.products = this.sanitizeProductList(JSON.parse(storedProducts));
                console.log('Products loaded from localStorage');
                this.displayAllProducts();
            } catch (error) {
                console.error('Error parsing localStorage products:', error);
                this.displayError();
            }
        } else {
            this.displayError();
        }
    }

    // Setup event listeners for search and actions
    setupEventListeners() {
        // Search button
        $('#productsSearchBtn').click(() => this.searchProducts());

        // Reset/Show All button
        $('#productsResetBtn').click(() => this.displayAllProducts());

        // Enter key on search form
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

        // Filter by description
        if (searchDescription) {
            results = results.filter(product =>
                product.description.toLowerCase().includes(searchDescription)
            );
        }

        // Filter by category
        if (searchCategory) {
            results = results.filter(product =>
                product.category === searchCategory
            );
        }

        this.displayProductCards(results);
    }

    // Display all products
    displayAllProducts() {
        // Clear search fields
        $('#productsSearchDescription').val('');
        $('#productsSearchCategory').val('');
        this.displayProductCards(this.products);
    }

    // Display product cards in grid
    displayProductCards(products) {
        const $container = $('#productsDisplay');
        $container.empty();

        const cleanProducts = this.sanitizeProductList(products);

        if (!cleanProducts || cleanProducts.length === 0) {
            $container.html('<p class="col-12 text-center text-muted">No products found.</p>');
            return;
        }

        cleanProducts.forEach(product => {
            const card = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card product-card shadow-sm h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${this.escapeHtml(product.description)}</h5>
                            <div class="product-details flex-grow-1">
                                <p class="card-text mb-2">
                                    <strong>Price:</strong> $${product.price.toFixed(2)}
                                </p>
                                <p class="card-text mb-2">
                                    <strong>Category:</strong> ${this.escapeHtml(product.category)}
                                </p>
                                <p class="card-text mb-2">
                                    <strong>Unit:</strong> ${this.escapeHtml(product.unitOfMeasure)}
                                </p>
                                ${product.weight ? `<p class="card-text mb-2"><strong>Weight:</strong> ${product.weight} kg</p>` : ''}
                                <small class="text-muted">ID: ${product.id}</small>
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
        $container.html('<p class="col-12 text-center text-danger">Error loading products. Please try again later.</p>');
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

// Initialize Products Catalog Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductsCatalogManager();
});
