document.addEventListener('DOMContentLoaded', function() {
  const currentUser = Storage.getCurrentUser();
  const userType = Storage.getUserType();
  
  if (!currentUser || userType !== 'buyer') {
    window.location.href = 'login.html';
    return;
  }
  
  setUserDetails(currentUser);
  
  initializeMarketplace(currentUser);
  initializeOrders(currentUser);
  initializeMessaging(currentUser);
  initializeFavorites(currentUser);
  initializeAccountSettings(currentUser);
});


function setUserDetails(user) {
  const userNameElements = document.querySelectorAll('#userName, #headerUserName');
  const userInitials = document.querySelectorAll('#userInitials, #profileInitials');
  const userTypeElement = document.getElementById('userType');
  
  userNameElements?.forEach(element => {
    if (element) element.textContent = user.name;
  });
  
  userInitials?.forEach(element => {
    if (element) element.textContent = getInitials(user.name);
  });
  
  if (userTypeElement) {
    userTypeElement.textContent = user.userType;
  }
}


function initializeMarketplace(user) {

  const productsContainer = document.getElementById('productsContainer');
  const searchInput = document.getElementById('searchProducts');
  const searchButton = document.getElementById('searchButton');
  const sortOption = document.getElementById('sortOption');
  const viewOptions = document.querySelectorAll('.view-option');
  const categoryFilters = document.querySelectorAll('input[name="category"]');
  const regionFilter = document.getElementById('regionFilter');
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const qualityFilters = document.querySelectorAll('input[name="quality"]');
  const applyFiltersBtn = document.getElementById('applyFilters');
  const resetFiltersBtn = document.getElementById('resetFilters');
  const cartIcon = document.getElementById('cartIcon');
  const cartCount = document.getElementById('cartCount');
  
  const productDetailModal = setupModal('productDetailModal', null, null);
  const cartModal = setupModal('cartModal', 'cartIcon', null);
  
  let cart = loadCart();
  updateCartCount();
  
  loadProducts();
  
  if (searchButton && searchInput) {
    searchButton.addEventListener('click', function() {
      const searchTerm = searchInput.value.trim().toLowerCase();
      loadProducts({ searchTerm });
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchButton.click();
      }
    });
  }
  
  if (sortOption) {
    sortOption.addEventListener('change', function() {
      loadProducts();
    });
  }
 
  if (viewOptions.length > 0) {
    viewOptions?.forEach(option => {
      option.addEventListener('click', function() {
  
        viewOptions?.forEach(opt => opt.classList.remove('active'));
        
        this.classList.add('active');
        
        const viewType = this.dataset.view;
        if (productsContainer) {
          productsContainer.className = viewType === 'grid' ? 'products-container grid-view' : 'products-container list-view';
        }
      });
    });
  }
  
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      loadProducts();
    });
  }
  
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function() {
  
      categoryFilters?.forEach(filter => {
        filter.checked = false;
      });
      
      if (regionFilter) regionFilter.value = '';
      
 
      if (minPriceInput) minPriceInput.value = '';
      if (maxPriceInput) maxPriceInput.value = '';
     
      qualityFilters?.forEach(filter => {
        filter.checked = false;
      });
      
      loadProducts();
    });
  }
  
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) {
        alert('Your cart is empty');
        return;
      }

      alert('Checkout successful! Your order has been placed.');
      
      cart = [];
      saveCart(cart);
      updateCartCount();
      updateCartDisplay();
    
      cartModal.close();
    });
  }
  

  async function loadProducts(options = {}) {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    let crops = await Storage.getAll('crops');
    let products = await Storage.getAll('products');
    
    crops = crops.filter(crop => crop.available);
    products = products.filter(product => product.available);

    let items = [
      ...crops.map(crop => ({
        ...crop,
        type: 'crop',
        category: getCropCategory(crop.name)
      })),
      ...products.map(product => ({
        ...product,
        type: 'product',
        category: 'Processed Goods'
      }))
    ];
    
    if (options.searchTerm) {
      const searchTerm = options.searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }
    
    const selectedCategories = Array.from(categoryFilters)
      .filter(filter => filter.checked)
      .map(filter => filter.value);
    
    if (selectedCategories.length > 0) {
      items = items.filter(item => selectedCategories.includes(item.category));
    }
    
    if (regionFilter && regionFilter.value) {
      const selectedRegion = regionFilter.value;
      
      items = items.filter(item => {
        const farmer = Storage.getById('farmers', item.farmerId);
        if (!farmer) return false;
        
        const northStates = ['Jammu and Kashmir', 'Himachal Pradesh', 'Punjab', 'Uttarakhand', 'Haryana', 'Delhi', 'Uttar Pradesh'];
        const southStates = ['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Kerala', 'Telangana'];
        const eastStates = ['Bihar', 'Jharkhand', 'West Bengal', 'Odisha', 'Assam'];
        const westStates = ['Rajasthan', 'Gujarat', 'Maharashtra', 'Goa'];
        const centralStates = ['Madhya Pradesh', 'Chhattisgarh'];
        
        const state = farmer.state;
        
        if (selectedRegion === 'North') return northStates.includes(state);
        if (selectedRegion === 'South') return southStates.includes(state);
        if (selectedRegion === 'East') return eastStates.includes(state);
        if (selectedRegion === 'West') return westStates.includes(state);
        if (selectedRegion === 'Central') return centralStates.includes(state);
        
        return false;
      });
    }
    
    const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : null;
    const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
    
    if (minPrice !== null) {
      items = items.filter(item => item.price >= minPrice);
    }
    
    if (maxPrice !== null) {
      items = items.filter(item => item.price <= maxPrice);
    }
 
    const selectedQualities = Array.from(qualityFilters)
      .filter(filter => filter.checked)
      .map(filter => filter.value);
    
    if (selectedQualities.length > 0) {
      items = items.filter(item => {
        if (item.type === 'crop') {
          return selectedQualities.includes(item.condition);
        } else if (item.type === 'product') {
          return item.qualityTags.some(tag => selectedQualities.includes(tag));
        }
        return false;
      });
    }
    
    if (sortOption) {
      const sorting = sortOption.value;
      
      if (sorting === 'price-asc') {
        items.sort((a, b) => a.price - b.price);
      } else if (sorting === 'price-desc') {
        items.sort((a, b) => b.price - a.price);
      } else if (sorting === 'name-asc') {
        items.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sorting === 'name-desc') {
        items.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sorting === 'newest') {
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
    
    if (items.length === 0) {
      productsContainer.innerHTML = '<p class="text-center">No products found matching your criteria</p>';
      return;
    }
    
    items?.forEach(item => {
      const farmer = Storage.getById('farmers', item.farmerId);
      
      const isFavorite = Storage.filter('favorites', fav => 
        fav.buyerId === user.id && fav.itemId === item.id && fav.itemType === item.type
      ).length > 0;
      
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      
      const isGridView = productsContainer.classList.contains('grid-view');
      
      productCard.innerHTML = `
        <div class="product-image" style="${item.image ? `background-image: url('${item.image}')` : ''}">
          <span class="product-badge">${item.type === 'crop' ? item.condition : 'Processed'}</span>
          <div class="product-favorite ${isFavorite ? 'active' : ''}" data-id="${item.id}" data-type="${item.type}"></div>
        </div>
        <div class="product-content">
          <div class="product-header">
            <h3 class="product-title">${item.name}</h3>
            <div class="product-price">${formatCurrency(item.price)}${item.type === 'crop' ? '/kg' : ''}</div>
          </div>
          <div class="product-description">${item.description || 'No description available'}</div>
          <div class="product-meta">
            <div class="product-seller">Seller: ${farmer ? farmer.name : 'Unknown'}</div>
            <div class="product-actions">
              <button class="btn btn-primary view-product" data-id="${item.id}" data-type="${item.type}">View</button>
            </div>
          </div>
        </div>
      `;
      
      productCard.querySelector('.product-favorite').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFavorite(this.dataset.id, this.dataset.type);
      });
      
      productCard.querySelector('.view-product').addEventListener('click', function() {
        viewProduct(this.dataset.id, this.dataset.type);
      });
      
      productCard.addEventListener('click', function() {
        const viewBtn = this.querySelector('.view-product');
        viewProduct(viewBtn.dataset.id, viewBtn.dataset.type);
      });
      
      productsContainer.appendChild(productCard);
    });
  }
  
 
  function viewProduct(id, type) {
    let item;
    
    if (type === 'crop') {
      item = Storage.getById('crops', id);
    } else if (type === 'product') {
      item = Storage.getById('products', id);
    }
    
    if (!item) return;
    
    const farmer = Storage.getById('farmers', item.farmerId);
    if (!farmer) return;
    
    document.getElementById('modalProductName').textContent = item.name;
    document.getElementById('modalProductPrice').textContent = item.price;
    
    if (type === 'crop') {
      document.getElementById('modalProductCondition').textContent = item.condition;
    } else {
      document.getElementById('modalProductCondition').textContent = item.qualityTags.join(', ');
    }
    
    document.getElementById('modalProductDescription').textContent = item.description || 'No description available';
    
    document.getElementById('modalSellerName').textContent = farmer.name;
    document.getElementById('modalSellerLocation').textContent = `${farmer.district}, ${farmer.state}`;
    
    const modalProductImage = document.getElementById('modalProductImage');
    if (modalProductImage) {
      modalProductImage.style.backgroundImage = item.image ? `url('${item.image}')` : '';
    }
    document.getElementById('productId').value = item.id;
    document.getElementById('sellerId').value = item.farmerId;
    
    document.getElementById('summaryProduct').textContent = item.name;
    document.getElementById('summaryQuantity').textContent = '1 ' + (type === 'crop' ? 'kg' : 'unit');
    document.getElementById('summaryUnitPrice').textContent = formatCurrency(item.price);
    document.getElementById('summaryTotal').textContent = formatCurrency(item.price);
    
    const orderQuantity = document.getElementById('orderQuantity');
    if (orderQuantity) {
      orderQuantity.addEventListener('input', function() {
        const quantity = parseInt(this.value) || 1;
        document.getElementById('summaryQuantity').textContent = quantity + ' ' + (type === 'crop' ? 'kg' : 'unit');
        document.getElementById('summaryTotal').textContent = formatCurrency(item.price * quantity);
      });
    }
    
    const deliveryInstructions = document.getElementById('deliveryInstructions');
    const instructionsGroup = document.getElementById('instructionsGroup');
    
    if (deliveryInstructions && instructionsGroup) {
      deliveryInstructions.addEventListener('change', function() {
        instructionsGroup.style.display = this.checked ? 'block' : 'none';
      });
    }
 
    const contactSellerBtn = document.getElementById('contactSellerBtn');
    if (contactSellerBtn) {
      contactSellerBtn.addEventListener('click', function() {

        productDetailModal.close();
        
        document.querySelector('.nav-link[data-page="messages"]').click();

        const contactItems = document.querySelectorAll('.contact-item');
        contactItems?.forEach(item => {
          if (item.dataset.id === farmer.id) {
            item.click();
          }
        });
      });
    }
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
      orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const sellerId = document.getElementById('sellerId').value;
        const quantity = parseInt(document.getElementById('orderQuantity').value) || 1;
        const deliveryAddress = document.getElementById('deliveryAddress').value;
        const instructions = document.getElementById('instructions').value;
        
        placeOrder({
          productId,
          productType: type,
          sellerId,
          quantity,
          deliveryAddress,
          instructions
        });
        
        productDetailModal.close();
      });
    }
   
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function() {
        const productId = document.getElementById('productId').value;
        const quantity = parseInt(document.getElementById('orderQuantity').value) || 1;
        
        addToCart({
          id: productId,
          type,
          quantity
        });
        
        productDetailModal.close();
      });
    }
    
    productDetailModal.open();
  }
  
  function toggleFavorite(itemId, itemType) {
    const existingFavorite = Storage.filter('favorites', fav => 
      fav.buyerId === user.id && fav.itemId === itemId && fav.itemType === itemType
    );
    
    if (existingFavorite.length > 0) {
      Storage.remove('favorites', existingFavorite[0].id);
    } else {

      Storage.add('favorites', {
        buyerId: user.id,
        itemId,
        itemType,
        addedAt: new Date().toISOString()
      });
    }
    
    loadProducts();
  }
  
  function placeOrder(orderData) {
    const { productId, productType, sellerId, quantity, deliveryAddress, instructions } = orderData;
    
    let product;
    if (productType === 'crop') {
      product = Storage.getById('crops', productId);
    } else {
      product = Storage.getById('products', productId);
    }
    
    if (!product) {
      alert('Product not found');
      return;
    }
    
    const subtotal = product.price * quantity;
    
    const order = {
      buyerId: user.id,
      farmerId: sellerId,
      items: [
        {
          cropId: productId,
          name: product.name,
          quantity,
          price: product.price,
          subtotal
        }
      ],
      totalAmount: subtotal,
      deliveryAddress,
      instructions: instructions || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    Storage.add('orders', order);
    
    alert('Order placed successfully!');
  }
  
  function addToCart(item) {
    let product;
    if (item.type === 'crop') {
      product = Storage.getById('crops', item.id);
    } else {
      product = Storage.getById('products', item.id);
    }
    
    if (!product) {
      alert('Product not found');
      return;
    }
    const farmer = Storage.getById('farmers', product.farmerId);
    
    const existingItem = cart.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.type === item.type
    );
    
    if (existingItem !== -1) {
      cart[existingItem].quantity += item.quantity;
    } else {
      cart.push({
        id: item.id,
        type: item.type,
        name: product.name,
        price: product.price,
        image: product.image,
        sellerId: product.farmerId,
        sellerName: farmer ? farmer.name : 'Unknown',
        quantity: item.quantity
      });
    }
    
    saveCart(cart);
    
    updateCartCount();
    updateCartDisplay();
    
    alert('Added to cart!');
  }
  
  function updateCartCount() {
    if (!cartCount) return;
    
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count.toString();
  }
 
  function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
      cartTotal.textContent = formatCurrency(0);
      return;
    }
    
    let total = 0;
    
    cart?.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      
      cartItem.innerHTML = `
        <div class="cart-item-image" style="${item.image ? `background-image: url('${item.image}')` : ''}"></div>
        <div class="cart-item-content">
          <div class="cart-item-header">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">${formatCurrency(subtotal)}</div>
          </div>
          <div class="cart-item-details">
            <div class="cart-item-seller">Seller: ${item.sellerName}</div>
            <div class="cart-item-quantity">
              <button class="decrease-quantity" data-index="${index}">-</button>
              <span>${item.quantity}</span>
              <button class="increase-quantity" data-index="${index}">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-remove" data-index="${index}">Remove</span>
          </div>
        </div>
      `;
      
      cartItem.querySelector('.cart-item-remove').addEventListener('click', function() {
        removeFromCart(parseInt(this.dataset.index));
      });
      
      cartItem.querySelector('.decrease-quantity').addEventListener('click', function() {
        updateCartItemQuantity(parseInt(this.dataset.index), -1);
      });
      
      cartItem.querySelector('.increase-quantity').addEventListener('click', function() {
        updateCartItemQuantity(parseInt(this.dataset.index), 1);
      });
      
      cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = formatCurrency(total);
  }
  
  function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
      updateCartCount();
      updateCartDisplay();
    }
  }
 
  function updateCartItemQuantity(index, change) {
    if (index >= 0 && index < cart.length) {
      const newQuantity = cart[index].quantity + change;
      
      if (newQuantity <= 0) {

        removeFromCart(index);
      } else {
        cart[index].quantity = newQuantity;
        saveCart(cart);
        updateCartCount();
        updateCartDisplay();
      }
    }
  }
  
  function loadCart() {
    const cartData = localStorage.getItem('cart_' + user.id);
    return cartData ? JSON.parse(cartData) : [];
  }
  function saveCart(cartData) {
    localStorage.setItem('cart_' + user.id, JSON.stringify(cartData));
  }

  function getCropCategory(cropName) {
    cropName = cropName.toLowerCase();
    
    const categories = {
      'Vegetables': ['tomato', 'potato', 'onion', 'cabbage', 'cauliflower', 'carrot', 'brinjal', 'lady finger', 'spinach', 'cucumber', 'radish', 'capsicum', 'beans', 'peas'],
      'Fruits': ['apple', 'banana', 'orange', 'grapes', 'mango', 'papaya', 'pineapple', 'watermelon', 'strawberry', 'kiwi', 'peach'],
      'Grains': ['rice', 'wheat', 'barley', 'oats', 'rye', 'maize', 'corn'],
      'Pulses': ['lentil', 'chickpea', 'pigeon pea', 'split pea', 'kidney bean', 'black gram', 'green gram', 'black eyed pea', 'soybean']
    };
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => cropName.includes(item))) {
        return category;
      }
    }
    
    return 'Other';
  }
}

function initializeOrders(user) {
  const ordersContainer = document.getElementById('ordersContainer');
  const orderStatusFilter = document.getElementById('orderStatusFilter');
  
  const feedbackModal = setupModal('feedbackModal', null, null);
  
  loadOrders();

  if (orderStatusFilter) {
    orderStatusFilter.addEventListener('change', function() {
      loadOrders(this.value);
    });
  }
  function loadOrders(statusFilter = 'all') {
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '';
    
    let orders = Storage.findBy('orders', 'buyerId', user.id);
    
    if (statusFilter !== 'all') {
      orders = orders?.filter(order => order.status === statusFilter);
    }
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = '<p class="text-center">No orders found</p>';
      return;
    }
    
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    orders?.forEach(order => {
 
      const farmer = Storage.getById('farmers', order.farmerId);
      
      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
    
      const orderHeader = document.createElement('div');
      orderHeader.className = 'order-card-header';
      orderHeader.innerHTML = `
        <div>
          <h3 class="order-id">Order #${order.id}</h3>
          <p class="order-date">Placed on ${formatDate(order.createdAt)}</p>
        </div>
        <span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span>
      `;
  
      const orderContent = document.createElement('div');
      orderContent.className = 'order-card-content';
      
      const orderItems = document.createElement('div');
      orderItems.className = 'order-items';
      
      order.items?.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        
        const productImage = getProductImage(item.cropId);
        
        orderItem.innerHTML = `
          <div class="order-item-image" style="${productImage ? `background-image: url('${productImage}')` : ''}"></div>
          <div class="order-item-content">
            <h4 class="order-item-title">${item.name}</h4>
            <div class="order-item-details">
              <span class="order-item-quantity">Quantity: ${item.quantity} kg</span>
              <span class="order-item-price">${formatCurrency(item.price)} / kg</span>
            </div>
          </div>
        `;
        
        orderItems.appendChild(orderItem);
      });
      const orderSummary = document.createElement('div');
      orderSummary.className = 'order-summary';
      orderSummary.innerHTML = `
        <div>
          <p>Seller: ${farmer ? farmer.name : 'Unknown'}</p>
        </div>
        <div class="order-total">${formatCurrency(order.totalAmount)}</div>
      `;
      const orderActions = document.createElement('div');
      orderActions.className = 'order-actions';
      
      orderActions.innerHTML = `
        <button class="btn btn-outline-sm track-order" data-id="${order.id}">Track Order</button>
      `;
      
      orderActions.innerHTML += `
        <button class="btn btn-outline-sm contact-seller" data-id="${order.farmerId}">Contact Seller</button>
      `;
      
      if (order.status === 'delivered' && !order.feedback) {
        orderActions.innerHTML += `
          <button class="btn btn-primary leave-feedback" data-id="${order.id}">Leave Feedback</button>
        `;
      }
      
      orderActions.querySelector('.track-order').addEventListener('click', function() {
        toggleTracking(order.id, this);
      });
      
      orderActions.querySelector('.contact-seller').addEventListener('click', function() {
        contactSeller(this.dataset.id);
      });
      
      if (order.status === 'delivered' && !order.feedback) {
        orderActions.querySelector('.leave-feedback').addEventListener('click', function() {
          leaveFeedback(order.id);
        });
      }
      
      const orderTracking = document.createElement('div');
      orderTracking.className = 'order-tracking';
      orderTracking.style.display = 'none';
      orderTracking.innerHTML = `
        <div class="order-tracking-header">
          <h4>Order Status</h4>
          <span class="order-tracking-status">${capitalizeFirstLetter(order.status)}</span>
        </div>
        <div class="tracking-timeline">
          ${createTrackingTimeline(order)}
        </div>
      `;

      orderContent.appendChild(orderItems);
      orderContent.appendChild(orderSummary);
      orderContent.appendChild(orderActions);
      orderContent.appendChild(orderTracking);
      
      orderCard.appendChild(orderHeader);
      orderCard.appendChild(orderContent);
      
      ordersContainer.appendChild(orderCard);
    });
    
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const orderId = document.getElementById('feedbackOrderId').value;
        const rating = document.querySelector('input[name="rating"]:checked').value;
        const comment = document.getElementById('feedbackComment').value;
        
        Storage.update('orders', orderId, {
          feedback: {
            rating: parseInt(rating),
            comment
          }
        });
       
        feedbackModal.close();
        loadOrders(orderStatusFilter ? orderStatusFilter.value : 'all');
        alert('Thank you for your feedback!');
      });
    }
  }
  
  function toggleTracking(orderId, button) {
    const orderCard = button.closest('.order-card');
    const trackingElement = orderCard.querySelector('.order-tracking');
    
    if (trackingElement.style.display === 'none') {
      trackingElement.style.display = 'block';
      button.textContent = 'Hide Tracking';
    } else {
      trackingElement.style.display = 'none';
      button.textContent = 'Track Order';
    }
  }
  
  function contactSeller(farmerId) {

    document.querySelector('.nav-link[data-page="messages"]').click();

    setTimeout(() => {
      const contactItems = document.querySelectorAll('.contact-item');
      contactItems?.forEach(item => {
        if (item.dataset.id === farmerId) {
          item.click();
        }
      });
    }, 300);
  }
  function leaveFeedback(orderId) {

    document.getElementById('feedbackOrderId').value = orderId;

    document.querySelectorAll('input[name="rating"]')?.forEach(input => {
      input.checked = false;
    });
    document.getElementById('feedbackComment').value = '';
    
    feedbackModal.open();
  }
  
  function createTrackingTimeline(order) {
    const statuses = ['pending', 'processing', 'packed', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);
    
    let html = '';
    
    statuses?.forEach((status, index) => {
      const statusClass = index <= currentStatusIndex ? 'active' : 'pending';
      const statusTime = index === currentStatusIndex ? formatDate(order.updatedAt, true) : '';
      
      html += `
        <div class="timeline-item">
          <div class="timeline-point ${statusClass}"></div>
          <div class="timeline-content">
            <div class="timeline-status">${capitalizeFirstLetter(status)}</div>
            ${statusTime ? `<div class="timeline-date">${statusTime}</div>` : ''}
          </div>
        </div>
      `;
    });
    
    return html;
  }
 
  function getProductImage(productId) {
  
    const crop = Storage.getById('crops', productId);
    if (crop && crop.image) {
      return crop.image;
    }
    
    const product = Storage.getById('products', productId);
    if (product && product.image) {
      return product.image;
    }
    
    return null;
  }
}


function initializeMessaging(user) {
  const contactsList = document.getElementById('contactsList');
  const chatMessages = document.getElementById('chatMessages');
  const messageInput = document.getElementById('messageInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const chatRecipientName = document.getElementById('chatRecipientName');
  const chatRecipientStatus = document.getElementById('chatRecipientStatus');
  const searchContactsInput = document.getElementById('searchContacts');
  
  let currentRecipient = null;
  
  loadConversations();
  
  if (sendMessageBtn && messageInput) {
    sendMessageBtn.addEventListener('click', function() {
      sendMessage();
    });
    
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (searchContactsInput) {
    searchContactsInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      filterContacts(searchTerm);
    });
  }
  async function loadConversations() {
    if (!contactsList) return;
    
    contactsList.innerHTML = '';
    
    const conversations = await Storage.getConversations(user.id);
    
    if (conversations.length === 0) {
      contactsList.innerHTML = '<p class="text-center">No conversations yet</p>';
      return;
    }
    
     conversations?.forEach(conversation => {
      const contactItem = document.createElement('div');
      contactItem.className = 'contact-item';
      contactItem.dataset.id = conversation.id;
      
      if (currentRecipient === conversation.id) {
        contactItem.classList.add('active');
      }
      
      contactItem.innerHTML = `
        <div class="contact-avatar">
          <div class="avatar-placeholder">
            <span>${getInitials(conversation.name)}</span>
          </div>
        </div>
        <div class="contact-info">
          <div class="contact-name">${conversation.name}</div>
          <div class="contact-preview">${conversation.lastMessage.message}</div>
        </div>
        <div class="contact-meta">
          <div class="contact-time">${formatTime(conversation.lastMessage.timestamp)}</div>
          ${conversation.unreadCount > 0 ? `<div class="unread-badge">${conversation.unreadCount}</div>` : ''}
        </div>
      `;
      
      contactItem.addEventListener('click', function() {
   
        document.querySelectorAll('.contact-item')?.forEach(item => item.classList.remove('active'));
        
        contactItem.classList.add('active');
        
        currentRecipient = conversation.id;
        loadChat(currentRecipient);
      });
      
      contactsList.appendChild(contactItem);
    });
  }
  
  function filterContacts(searchTerm) {
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems?.forEach(item => {
      const name = item.querySelector('.contact-name').textContent.toLowerCase();
      
      if (name.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  function loadChat(recipientId) {
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
 
    let recipient = Storage.getById('farmers', recipientId);
    
    if (!recipient) {
      recipient = Storage.getById('buyers', recipientId);
    }
    
    if (!recipient) {
      return;
    }
    
    if (chatRecipientName) {
      chatRecipientName.textContent = recipient.name;
    }
    
    if (chatRecipientStatus) {
      chatRecipientStatus.textContent = `${recipient.district || ''}, ${recipient.state || ''}`;
    }
    
    if (messageInput) {
      messageInput.disabled = false;
      messageInput.placeholder = 'Type a message...';
    }
    
    if (sendMessageBtn) {
      sendMessageBtn.disabled = false;
    }
    
    const messages = Storage.getMessages(user.id, recipientId);
    
    if (messages.length === 0) {
      chatMessages.innerHTML = '<div class="empty-chat-message">No messages yet. Start the conversation!</div>';
      return;
    }
    
    chatMessages.innerHTML = '';
  
    Storage.markMessagesAsRead(user.id, recipientId);
    
    messages?.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${message.senderId === user.id ? 'sent' : 'received'}`;
      
      messageElement.innerHTML = `
        <div class="message-content">${message.message}</div>
        <div class="message-time">${formatTime(message.timestamp)}</div>
      `;
      
      chatMessages.appendChild(messageElement);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    loadConversations();
  }

  function sendMessage() {
    if (!currentRecipient || !messageInput.value.trim()) {
      return;
    }
    
    const message = {
      senderId: user.id,
      receiverId: currentRecipient,
      message: messageInput.value.trim(),
      read: false,
      timestamp: new Date().toISOString()
    };
    
    Storage.add('messages', message);
    
    messageInput.value = '';
    
    loadChat(currentRecipient);
  }
  
  
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

function initializeFavorites(user) {
  
  const favoritesContainer = document.getElementById('favoritesContainer');
  
  loadFavorites();
  
  function loadFavorites() {
    if (!favoritesContainer) return;
    
    favoritesContainer.innerHTML = '';
    
    const favorites = Storage.findBy('favorites', 'buyerId', user.id);
    
    if (favorites.length === 0) {
      favoritesContainer.innerHTML = '<p class="text-center">No favorites yet</p>';
      return;
    }
    
    favorites?.forEach(favorite => {
      let item;
      
      if (favorite.itemType === 'crop') {
        item = Storage.getById('crops', favorite.itemId);
      } else if (favorite.itemType === 'product') {
        item = Storage.getById('products', favorite.itemId);
      }
      
      if (!item) return;
      
      const farmer = Storage.getById('farmers', item.farmerId);
      
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      
      productCard.innerHTML = `
        <div class="product-image" style="${item.image ? `background-image: url('${item.image}')` : ''}">
          <span class="product-badge">${favorite.itemType === 'crop' ? item.condition : 'Processed'}</span>
          <div class="product-favorite active" data-id="${item.id}" data-type="${favorite.itemType}"></div>
        </div>
        <div class="product-content">
          <div class="product-header">
            <h3 class="product-title">${item.name}</h3>
            <div class="product-price">${formatCurrency(item.price)}${favorite.itemType === 'crop' ? '/kg' : ''}</div>
          </div>
          <div class="product-description">${item.description || 'No description available'}</div>
          <div class="product-meta">
            <div class="product-seller">Seller: ${farmer ? farmer.name : 'Unknown'}</div>
            <div class="product-actions">
              <button class="btn btn-primary view-product" data-id="${item.id}" data-type="${favorite.itemType}">View</button>
              <button class="btn btn-outline-sm remove-favorite" data-id="${favorite.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
      
      productCard.querySelector('.remove-favorite').addEventListener('click', function() {
        removeFavorite(this.dataset.id);
      });
      
      productCard.querySelector('.view-product').addEventListener('click', function() {
        
        document.querySelector('.nav-link[data-page="marketplace"]').click();
        
        setTimeout(() => {
          const viewBtns = document.querySelectorAll('.view-product');
          viewBtns?.forEach(btn => {
            if (btn.dataset.id === this.dataset.id && btn.dataset.type === this.dataset.type) {
              btn.click();
            }
          });
        }, 300);
      });
      
      favoritesContainer.appendChild(productCard);
    });
  }
 
  function removeFavorite(favoriteId) {
    Storage.remove('favorites', favoriteId);
    loadFavorites();
  }
}


function initializeAccountSettings(user) {
 
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');
  const changeProfilePicBtn = document.getElementById('changeProfilePicBtn');
  const profilePictureInput = document.getElementById('profilePicture');
  
  if (profileForm) {
    profileForm.querySelector('#profileName').value = user.name;
    profileForm.querySelector('#profilePhone').value = user.phone;
    profileForm.querySelector('#profileEmail').value = user.email;
    profileForm.querySelector('#userType').value = user.userType;
    profileForm.querySelector('#businessName').value = user.businessName || '';
    profileForm.querySelector('#profileAddress').value = user.address;
    
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = profileForm.querySelector('#profileName').value;
      const phone = profileForm.querySelector('#profilePhone').value;
      const email = profileForm.querySelector('#profileEmail').value;
      const userType = profileForm.querySelector('#userType').value;
      const businessName = profileForm.querySelector('#businessName').value;
      const address = profileForm.querySelector('#profileAddress').value;
      
      Storage.update('buyers', user.id, {
        name,
        phone,
        email,
        userType,
        businessName,
        address
      });
      
      const updatedUser = Storage.getById('buyers', user.id);
      console.log(" 3...")

      Storage.setCurrentUser(updatedUser, 'buyer');
      
      setUserDetails(updatedUser);
      
      alert('Profile updated successfully');
    });
  }
  
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentPassword = passwordForm.querySelector('#currentPassword').value;
      const newPassword = passwordForm.querySelector('#newPassword').value;
      const confirmNewPassword = passwordForm.querySelector('#confirmNewPassword').value;
      
      if (currentPassword !== user.password) {
        alert('Current password is incorrect');
        return;
      }
      
      if (newPassword.length < 8) {
        alert('New password must be at least 8 characters long');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match');
        return;
      }
      
      Storage.update('buyers', user.id, {
        password: newPassword
      });
      
      passwordForm.reset();
     
      alert('Password updated successfully');
    });
  }
  
  if (changeProfilePicBtn && profilePictureInput) {
    changeProfilePicBtn.addEventListener('click', function() {
      profilePictureInput.click();
    });
    
    profilePictureInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
       
        alert('Profile picture updated');
      }
    });
  }
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').replace(/\.00$/, '');
}

function formatDate(dateStr, includeTime = false) {
  const date = new Date(dateStr);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-IN', options);
}
function getInitials(name) {
  if (!name) return '';
  
  const parts = name.split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function setupModal(modalId, openTriggerId, closeTriggerId) {
  const modal = document.getElementById(modalId);
  const openTrigger = openTriggerId ? document.getElementById(openTriggerId) : null;
  const closeTrigger = modal ? modal.querySelector('.close-modal') : null;
  const closeButton = closeTriggerId ? document.getElementById(closeTriggerId) : null;
  
  if (!modal) return { open: () => {}, close: () => {} };
  
  function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = ''; 
  }
  
  if (openTrigger) {
    openTrigger.addEventListener('click', openModal);
  }
  
  if (closeTrigger) {
    closeTrigger.addEventListener('click', closeModal);
  }
  
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });
  
  return {
    open: openModal,
    close: closeModal
  };
}