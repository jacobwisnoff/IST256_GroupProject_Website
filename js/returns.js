// AngularJS Returns Application
angular.module('returnsApp', [])
    .controller('ReturnsController', ['$scope', function($scope) {
        
        // Sample purchase data - would typically come from a server/database
        $scope.allPurchases = [
            {
                orderId: 'ORD-2026-001',
                itemName: 'Wireless Bluetooth Headphones',
                category: 'Electronics',
                quantity: 1,
                amount: 79.99,
                date: new Date('2026-03-15'),
                status: 'Delivered',
                canReturn: true
            },
            {
                orderId: 'ORD-2026-002',
                itemName: 'Cotton T-Shirt (Blue)',
                category: 'Clothing',
                quantity: 2,
                amount: 39.98,
                date: new Date('2026-03-20'),
                status: 'Delivered',
                canReturn: true
            },
            {
                orderId: 'ORD-2026-003',
                itemName: 'The Great Gatsby',
                category: 'Books',
                quantity: 1,
                amount: 14.99,
                date: new Date('2026-02-10'),
                status: 'Returned',
                canReturn: false
            },
            {
                orderId: 'ORD-2026-004',
                itemName: 'Stainless Steel Water Bottle',
                category: 'Home',
                quantity: 1,
                amount: 34.99,
                date: new Date('2026-03-25'),
                status: 'Pending',
                canReturn: false
            },
            {
                orderId: 'ORD-2026-005',
                itemName: 'Yoga Mat and Carrying Strap',
                category: 'Sports',
                quantity: 1,
                amount: 29.99,
                date: new Date('2026-03-28'),
                status: 'Delivered',
                canReturn: true
            },
            {
                orderId: 'ORD-2026-006',
                itemName: 'LED Desk Lamp',
                category: 'Electronics',
                quantity: 1,
                amount: 49.99,
                date: new Date('2026-03-01'),
                status: 'Delivered',
                canReturn: true
            }
        ];

        // Initialize filtered purchases
        $scope.filteredPurchases = [];
        $scope.searchQuery = '';
        $scope.searchStatus = '';
        $scope.searchCategory = '';
        $scope.selectedPurchaseId = null;
        $scope.returnSubmitted = false;

        // Return data object
        $scope.returnData = {
            reason: '',
            description: '',
            condition: '',
            shippingMethod: '',
            agreeTerms: false
        };

        /**
         * Initialize on page load
         */
        $scope.init = function() {
            console.log('Returns page initialized');
            $scope.displayAllPurchases();
        };

        /**
         * Display all purchases on initial load
         */
        $scope.displayAllPurchases = function() {
            $scope.filteredPurchases = angular.copy($scope.allPurchases);
            console.log('Displaying all purchases:', $scope.filteredPurchases.length);
        };

        /**
         * Search for purchases based on filters
         */
        $scope.searchPurchases = function() {
            console.log('=== SEARCHING PURCHASES ===');
            console.log('Search Query:', $scope.searchQuery);
            console.log('Search Status:', $scope.searchStatus);
            console.log('Search Category:', $scope.searchCategory);

            $scope.filteredPurchases = $scope.allPurchases.filter(function(purchase) {
                // Filter by search query (Order ID or Item Name)
                const queryMatch = !$scope.searchQuery || 
                    purchase.orderId.toLowerCase().includes($scope.searchQuery.toLowerCase()) ||
                    purchase.itemName.toLowerCase().includes($scope.searchQuery.toLowerCase());

                // Filter by status
                const statusMatch = !$scope.searchStatus || purchase.status === $scope.searchStatus;

                // Filter by category
                const categoryMatch = !$scope.searchCategory || purchase.category === $scope.searchCategory;

                return queryMatch && statusMatch && categoryMatch;
            });

            console.log('Search results:', $scope.filteredPurchases.length, 'purchases found');
        };

        /**
         * Reset search and display all purchases
         */
        $scope.resetSearch = function() {
            console.log('Resetting search filters');
            $scope.searchQuery = '';
            $scope.searchStatus = '';
            $scope.searchCategory = '';
            $scope.displayAllPurchases();
            $scope.cancelReturnForm();
        };

        /**
         * Initialize return form for selected purchase
         */
        $scope.initializeReturnForm = function(purchase) {
            console.log('Initializing return form for order:', purchase.orderId);
            
            // Validate purchase can be returned
            if (purchase.status !== 'Delivered') {
                console.warn('Cannot return item with status:', purchase.status);
                alert('You can only return items that have been delivered.');
                return;
            }

            // Reset form and set selected purchase
            $scope.selectedPurchaseId = purchase.orderId;
            $scope.returnData = {
                orderId: purchase.orderId,
                itemName: purchase.itemName,
                amount: purchase.amount,
                reason: '',
                description: '',
                condition: '',
                shippingMethod: '',
                agreeTerms: false
            };

            // Scroll to form
            setTimeout(() => {
                const element = document.querySelector('.return-form.active');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        /**
         * Cancel return form
         */
        $scope.cancelReturnForm = function() {
            console.log('Cancelling return form');
            $scope.selectedPurchaseId = null;
            $scope.returnData = {
                reason: '',
                description: '',
                condition: '',
                shippingMethod: '',
                agreeTerms: false
            };
            
            // Reset form validation
            if ($scope.returnForm) {
                $scope.returnForm.$setPristine();
                $scope.returnForm.$setUntouched();
            }
        };

        /**
         * Submit return request
         */
        $scope.submitReturn = function(purchase) {
            console.log('=== SUBMIT RETURN CLICKED ===');
            console.log('Return Form Valid:', $scope.returnForm ? $scope.returnForm.$valid : 'N/A');
            console.log('Return Data:', $scope.returnData);

            // Mark all fields as touched to display validation errors
            if ($scope.returnForm) {
                console.log('Marking all fields as touched...');
                angular.forEach($scope.returnForm, function(field, name) {
                    if (field && typeof field.$setTouched === 'function') {
                        field.$setTouched();
                        console.log(`Field "${name}" touched. Valid: ${field.$valid}`);
                    }
                });
            } else {
                console.error('returnForm is not defined!');
                return;
            }

            // Validate form
            if ($scope.returnForm.$invalid) {
                console.log('Form validation FAILED');
                console.log('Form errors:', $scope.returnForm.$error);
                alert('Please fill out all required fields correctly.');
                return;
            }

            // Validate all required fields
            const requiredFields = ['reason', 'description', 'condition', 'shippingMethod'];
            let hasErrors = false;
            requiredFields.forEach(field => {
                if (!$scope.returnData[field] || $scope.returnData[field].trim() === '') {
                    console.warn(`Required field "${field}" is empty`);
                    hasErrors = true;
                }
            });

            if (!$scope.returnData.agreeTerms) {
                console.warn('User did not agree to return policy');
                hasErrors = true;
            }

            if (hasErrors) {
                console.log('Validation FAILED: Missing required fields or agreements');
                return;
            }

            console.log('Form validation PASSED, proceeding with return submission');

            // Prepare return request data
            const returnRequest = {
                returnId: 'RET-' + Date.now(),
                orderId: purchase.orderId,
                itemName: purchase.itemName,
                category: purchase.category,
                amount: purchase.amount,
                reason: $scope.returnData.reason,
                description: $scope.returnData.description,
                condition: $scope.returnData.condition,
                shippingMethod: $scope.returnData.shippingMethod,
                timestamp: new Date().toISOString(),
                status: 'Pending Review'
            };

            console.log('Return Request Submitted:', returnRequest);

            // Update purchase status to "Returned"
            const purchaseIndex = $scope.allPurchases.findIndex(p => p.orderId === purchase.orderId);
            if (purchaseIndex !== -1) {
                $scope.allPurchases[purchaseIndex].status = 'Returned';
                $scope.allPurchases[purchaseIndex].canReturn = false;
            }

            // Save to localStorage
            const returnHistory = JSON.parse(localStorage.getItem('returnHistory') || '[]');
            returnHistory.push(returnRequest);
            localStorage.setItem('returnHistory', JSON.stringify(returnHistory));
            console.log('Return request saved to localStorage');

            // Show success message
            $scope.returnSubmitted = true;
            console.log('Return request submitted successfully');

            // Hide success message after 5 seconds
            setTimeout(() => {
                $scope.$apply(function() {
                    $scope.returnSubmitted = false;
                });
            }, 5000);

            // Close return form and refresh display
            $scope.cancelReturnForm();
            $scope.searchPurchases();

            // Send to server via AJAX (optional)
            $scope.sendReturnToServer(returnRequest);
        };

        /**
         * Send return request to server (optional backend integration)
         */
        $scope.sendReturnToServer = function(returnRequest) {
            // This would typically use $http to send data to backend
            console.log('Simulating server submission of return request');
            // Example: $http.post('/api/returns', returnRequest)...
        };

        // Initialize on page load
        $scope.init();
    }]);

/**
 * Document ready - initialize the page
 */
$(document).ready(function() {
    console.log('Returns page loaded with AngularJS');
});
