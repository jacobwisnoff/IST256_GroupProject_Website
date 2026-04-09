// AngularJS Checkout Application
angular.module('checkoutApp', [])
    .controller('CheckoutController', ['$scope', '$http', function($scope, $http) {
        
        // Initialize checkout data object
        $scope.checkout = {
            address: '',
            city: '',
            state: '',
            zip: '',
            carrier: '',
            method: '',
            billingName: '',
            billingAddress: '',
            billingCity: '',
            billingState: '',
            billingZip: '',
            phone: '',
            email: '',
            cardNumber: '',
            expiryDate: '',
            cvv: ''
        };

        // Cart data from localStorage
        $scope.checkoutData = {
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0
        };

        // Submitted order data
        $scope.submittedCheckoutData = null;
        $scope.orderSubmitted = false;

        /**
         * Initialize checkout page
         */
        $scope.init = function() {
            // Verify cart has items
            if (!verifyCartNotEmpty()) {
                return;
            }
            $scope.loadCheckoutData();
        };

        /**
         * Load checkout data from localStorage
         */
        $scope.loadCheckoutData = function() {
            const storedData = localStorage.getItem('checkoutData');
            if (storedData) {
                try {
                    const data = JSON.parse(storedData);
                    $scope.checkoutData = {
                        items: data.items || [],
                        subtotal: data.subtotal || 0,
                        tax: data.tax || 0,
                        total: data.total || 0,
                        itemCount: data.itemCount || 0
                    };
                    console.log('Checkout data loaded:', $scope.checkoutData);
                } catch (error) {
                    console.error('Error parsing checkout data:', error);
                }
            } else {
                console.warn('No checkout data found in localStorage');
            }
        };

        /**
         * Submit checkout form
         */
        $scope.submitCheckout = function() {
            console.log('=== SUBMIT CHECKOUT CLICKED ===');
            console.log('Checkout data:', $scope.checkout);
            console.log('Form object:', $scope.checkoutForm);
            console.log('Form invalid?:', $scope.checkoutForm ? $scope.checkoutForm.$invalid : 'N/A');
            
            // Mark all fields as touched to display validation errors
            if ($scope.checkoutForm) {
                console.log('Marking all fields as touched...');
                angular.forEach($scope.checkoutForm, function(field, name) {
                    if (field && typeof field.$setTouched === 'function') {
                        field.$setTouched();
                        console.log(`Field "${name}" touched. Valid: ${field.$valid}`);
                    }
                });
            } else {
                console.error('checkoutForm is not defined!');
            }

            // Check each required field
            const requiredFields = ['address', 'city', 'state', 'zip', 'carrier', 'method', 'billingName', 'billingAddress', 'billingCity', 'billingState', 'billingZip', 'phone', 'email', 'cardNumber', 'expiryDate', 'cvv'];
            let hasErrors = false;
            requiredFields.forEach(field => {
                if (!$scope.checkout[field] || $scope.checkout[field].trim() === '') {
                    console.warn(`Required field "${field}" is empty`);
                    hasErrors = true;
                }
            });

            // Validate form using AngularJS validation
            if ($scope.checkoutForm.$invalid || hasErrors) {
                console.log('Form validation FAILED');
                console.log('Form errors:', $scope.checkoutForm);
                return;
            }

            console.log('Form validation PASSED, proceeding with checkout');

            // Prepare complete order data with cart items
            const completeOrderData = {
                shipping: {
                    address: $scope.checkout.address,
                    city: $scope.checkout.city,
                    state: $scope.checkout.state.toUpperCase(),
                    zip: $scope.checkout.zip,
                    carrier: $scope.checkout.carrier,
                    method: $scope.checkout.method
                },
                billing: {
                    name: $scope.checkout.billingName,
                    address: $scope.checkout.billingAddress,
                    city: $scope.checkout.billingCity,
                    state: $scope.checkout.billingState.toUpperCase(),
                    zip: $scope.checkout.billingZip,
                    phone: $scope.checkout.phone,
                    email: $scope.checkout.email
                },
                payment: {
                    cardNumber: $scope.checkout.cardNumber.replace(/\s/g, ''),
                    expiryDate: $scope.checkout.expiryDate,
                    cvv: $scope.checkout.cvv
                },
                items: $scope.checkoutData.items,
                subtotal: $scope.checkoutData.subtotal,
                tax: $scope.checkoutData.tax,
                total: $scope.checkoutData.total,
                timestamp: new Date().toISOString()
            };

            console.log('Order Submitted:', completeOrderData);

            // Display JSON on page using AngularJS
            $scope.submittedCheckoutData = completeOrderData;
            $scope.orderSubmitted = true;

            // Save to localStorage
            localStorage.setItem('submittedOrder', JSON.stringify(completeOrderData));

            // Clear shopping cart
            $scope.clearCart();

            // Send to server via AJAX
            $scope.sendOrderToServer(completeOrderData);

            // Scroll to JSON display
            setTimeout(() => {
                const element = document.querySelector('[ng-show="orderSubmitted"]');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        /**
         * Clear shopping cart from localStorage
         */
        $scope.clearCart = function() {
            localStorage.removeItem('shoppingCart');
            sessionStorage.removeItem('shoppingCart');
            console.log('Shopping cart cleared');
        };

        /**
         * Send order to server via AJAX using $http
         */
        $scope.sendOrderToServer = function(orderData) {
            $http({
                method: 'POST',
                url: '/api/checkout',
                data: orderData,
                headers: { 'Content-Type': 'application/json' }
            }).then(
                function(response) {
                    console.log('Order submitted to server successfully:', response);
                },
                function(error) {
                    console.warn('Server submission failed, order saved locally:', error);
                }
            );
        };

        // Initialize on page load
        $scope.init();
    }]);


/**
 * Verify that cart has at least one item
 * Redirect to cart.html if cart is empty
 */
function verifyCartNotEmpty() {
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
    
    if (!checkoutData.items || checkoutData.items.length === 0) {
        console.warn('Cart is empty, redirecting to cart.html');
        window.location.href = 'cart.html';
        return false;
    }
    
    return true;
}


/**
 * Document ready - initialize AngularJS
 */
$(document).ready(function() {
    console.log('Checkout page loaded with AngularJS');
});
