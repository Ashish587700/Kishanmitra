import { addCrop } from '../js/common/apimethodCall.js';
document.addEventListener('DOMContentLoaded', async function () {

  const currentUser = await Storage.getCurrentUser();
  console.log("currentUser: ", currentUser);

  const userType = Storage.getUserType();

  if (!currentUser || userType !== 'farmer') {

    window.location.href = 'login.html';
    return;
  }

  setUserDetails(currentUser);

  initializeOverview(currentUser);
  initializeCropManagement(currentUser);
  initializeProductManagement(currentUser);
  initializeOrderManagement(currentUser);
  initializeMessaging(currentUser);
  initializeAccountSettings(currentUser);
});


function setUserDetails(user) {
  const userNameElements = document.querySelectorAll('#userName, #headerUserName');
  const userInitials = document.querySelectorAll('#userInitials, #profileInitials');
  const userLocationElement = document.getElementById('userLocation');

  userNameElements?.forEach(element => {
    if (element) element.textContent = user.name;
  });

  userInitials?.forEach(element => {
    if (element) element.textContent = getInitials(user.name);
  });

  if (userLocationElement) {
    userLocationElement.textContent = `${user.district}, ${user.state}`;
  }
}


async function initializeOverview(user) {

  const crops = await Storage.findBy('crops', 'farmerId', user.id);
  const orders = await Storage.filter('orders', order => order.farmerId === user.id);

  const totalCrops = crops?.length;
  const activeOrders = await orders?.filter(order =>
    ['pending', 'processing', 'packed', 'shipped'].includes(order.status)
  ).length;

  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const conversations = await Storage.getConversations(user.id);
  const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  document.getElementById('totalCrops').textContent = totalCrops;
  document.getElementById('activeOrders').textContent = activeOrders;
  document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('unreadMessages').textContent = unreadMessages;

  populateRecentOrders(orders.slice(0, 5));

  populateCropInventory(crops.slice(0, 5));
}


function populateRecentOrders(orders) {
  const tableBody = document.querySelector('#recentOrdersTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (orders.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" class="text-center">No orders found</td>';
    tableBody.appendChild(row);
    return;
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  orders?.forEach(order => {

    const buyer = Storage.getById('buyers', order.buyerId);

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${buyer ? buyer.name : 'Unknown Buyer'}</td>
      <td>${order.items.length} item(s)</td>
      <td>${formatCurrency(order.totalAmount)}</td>
      <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
    `;

    row.addEventListener('click', () => {

      document.querySelector('.nav-link[data-page="orders"]').click();
      showOrderDetails(order.id);
    });

    tableBody.appendChild(row);
  });
}


function populateCropInventory(crops) {
  const tableBody = document.querySelector('#cropInventoryTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (crops.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="text-center">No crops found</td>';
    tableBody.appendChild(row);
    return;
  }

  crops?.forEach(crop => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${crop.name}</td>
      <td>${crop.quantity} kg</td>
      <td>${formatCurrency(crop.price)}/kg</td>
      <td><span class="status-badge ${crop.available ? 'available' : 'unavailable'}">${crop.available ? 'Available' : 'Out of Stock'}</span></td>
    `;

    row.addEventListener('click', () => {

      document.querySelector('.nav-link[data-page="manage-crops"]').click();
    });

    tableBody.appendChild(row);
  });
}

function initializeCropManagement(user) {

  const modal = setupModal('cropModal', 'addCropBtn', 'cancelCropBtn');

  const cropForm = document.getElementById('cropForm');
  const cropList = document.getElementById('cropList');
  const cropModalTitle = document.getElementById('cropModalTitle');
  const cropImageInput = document.getElementById('cropImage');
  const previewContainer = document.getElementById('previewContainer');

  loadCrops();

  if (cropImageInput) {
    cropImageInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
          previewContainer.style.backgroundImage = `url('${e.target.result}')`;
          previewContainer.textContent = '';
        };

        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  if (cropForm) {
    cropForm.addEventListener('submit', async function (e) {
      console.log("DEv test 000.......")
      e.preventDefault();

      const cropId = document.getElementById('cropId').value;
      const name = document.getElementById('cropName').value;
      const quantity = document.getElementById('cropQuantity').value;
      const price = document.getElementById('cropPrice').value;
      const condition = document.getElementById('cropCondition').value;
      const available = document.getElementById('cropAvailable').checked;
      const description = document.getElementById('cropDescription').value;

      let imageUrl = null;
      if (cropImageInput.files && cropImageInput.files[0]) {

        imageUrl = previewContainer.style.backgroundImage;
        imageUrl = imageUrl.replace('url("', '').replace('")', '');

        if (imageUrl.startsWith('data:')) {
          imageUrl = 'https://images.unsplash.com/photo-1553787434-60f1eae9ea9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZmFybSUyMGNyb3B8ZW58MHx8fHwxNjkwMjM4MTgxfDA&ixlib=rb-4.0.3&q=80&w=900';
        }
      }

      const cropData = {
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        condition,
        available,
        description,
        farmerId: user.id,
        image: imageUrl
      };
      // console.log("Crop 1......")
      if (cropId) {
        // console.log("Crop 2......")

        // Storage.update('crops', cropId, cropData);
      } else {
        // console.log("Crop 3......")

        const response = await addCrop(cropData);
        // console.log("Crop 4......",response)

        if (response?.status === 200 || response?.StatusCode === 200) {
          alert('Added  successful! ');
          // window.location.href = 'login.html';
        } else if (response?.status === 400) {
          alert("already exist ! Please try with another name.");
        } else if (response?.status !== 200 || 400) {
          alert(' failed! Please try again.1');
        }
        // Storage.add('crops', cropData);
      }

      modal.close();
      loadCrops();

      cropForm.reset();
      previewContainer.style.backgroundImage = '';
      previewContainer.textContent = 'No image selected';
    });
  }

  async function loadCrops() {
    if (!cropList) return;

    const crops = await Storage.findBy('crops', 'farmerId', user.id);

    cropList.innerHTML = '';

    if (crops.length === 0) {
      cropList.innerHTML = '<p class="text-center">No crops added yet. Click "Add New Crop" to get started.</p>';
      return;
    }

    crops?.forEach(crop => {
      const cropCard = document.createElement('div');
      cropCard.className = 'crop-card';

      cropCard.innerHTML = `
        <div class="crop-image" style="${crop.image ? `background-image: url('${crop.image}')` : ''}">
          <span class="crop-status ${crop.available ? 'available' : 'unavailable'}">${crop.available ? 'Available' : 'Out of Stock'}</span>
        </div>
        <div class="crop-content">
          <div class="crop-header">
            <h3 class="crop-title">${crop.name}</h3>
            <div class="crop-price">${formatCurrency(crop.price)}/kg</div>
          </div>
          <div class="crop-details">
            <div class="crop-detail-item">
              <span class="crop-detail-label">Quantity:</span>
              <span>${crop.quantity} kg</span>
            </div>
            <div class="crop-detail-item">
              <span class="crop-detail-label">Condition:</span>
              <span>${crop.condition}</span>
            </div>
            <div class="crop-detail-item">
              <span class="crop-detail-label">Added on:</span>
              <span>${formatDate(crop.createdAt)}</span>
            </div>
          </div>
          <div class="crop-actions">
            <button class="btn btn-primary edit-crop" data-id="${crop.id}">Edit</button>
            <button class="btn btn-danger delete-crop" data-id="${crop.id}">Delete</button>
          </div>
        </div>
      `;

      cropCard.querySelector('.edit-crop').addEventListener('click', function () {
        editCrop(crop.id);
      });

      cropCard.querySelector('.delete-crop').addEventListener('click', function () {
        deleteCrop(crop.id);
      });

      cropList.appendChild(cropCard);
    });
  }


  function editCrop(cropId) {
    const crop = Storage.getById('crops', cropId);
    if (!crop) return;

    document.getElementById('cropId').value = crop.id;
    document.getElementById('cropName').value = crop.name;
    document.getElementById('cropQuantity').value = crop.quantity;
    document.getElementById('cropPrice').value = crop.price;
    document.getElementById('cropCondition').value = crop.condition;
    document.getElementById('cropAvailable').checked = crop.available;
    document.getElementById('cropDescription').value = crop.description || '';

    if (crop.image) {
      previewContainer.style.backgroundImage = `url('${crop.image}')`;
      previewContainer.textContent = '';
    } else {
      previewContainer.style.backgroundImage = '';
      previewContainer.textContent = 'No image selected';
    }

    cropModalTitle.textContent = 'Edit Crop';

    modal.open();
  }

  function deleteCrop(cropId) {
    if (confirm('Are you sure you want to delete this crop?')) {
      Storage.remove('crops', cropId);
      loadCrops();
    }
  }
  const addCropBtn = document.getElementById('addCropBtn');
  if (addCropBtn) {
    addCropBtn.addEventListener('click', function () {
      cropForm.reset();
      document.getElementById('cropId').value = '';
      previewContainer.style.backgroundImage = '';
      previewContainer.textContent = 'No image selected';

      cropModalTitle.textContent = 'Add New Crop';

      modal.open();
    });
  }
}

function initializeProductManagement(user) {

  const modal = setupModal('productModal', 'addProductBtn', 'cancelProductBtn');

  const productForm = document.getElementById('productForm');
  const productList = document.getElementById('productList');
  const productModalTitle = document.getElementById('productModalTitle');
  const productImageInput = document.getElementById('productImage');
  const productPreviewContainer = document.getElementById('productPreviewContainer');

  loadProducts();

  if (productImageInput) {
    productImageInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
          productPreviewContainer.style.backgroundImage = `url('${e.target.result}')`;
          productPreviewContainer.textContent = '';
        };

        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const productId = document.getElementById('productId').value;
      const name = document.getElementById('productName').value;
      const description = document.getElementById('productDescription').value;
      const quantity = document.getElementById('productQuantity').value;
      const price = document.getElementById('productPrice').value;
      const packaging = document.getElementById('productPackaging').value;
      const shelfLife = document.getElementById('productShelfLife').value;
      const available = document.getElementById('productAvailable').checked;

      const qualityTagsInputs = document.querySelectorAll('input[name="qualityTags"]:checked');
      const qualityTags = Array.from(qualityTagsInputs).map(input => input.value);
      let imageUrl = null;
      if (productImageInput.files && productImageInput.files[0]) {
        imageUrl = productPreviewContainer.style.backgroundImage;
        imageUrl = imageUrl.replace('url("', '').replace('")', '');
        if (imageUrl.startsWith('data:')) {
          imageUrl = 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8cmljZSUyMGZsb3VyfGVufDB8fHx8MTY5MDIzNzk0MXww&ixlib=rb-4.0.3&q=80&w=900';
        }
      }

      const productData = {
        name,
        description,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        packaging,
        shelfLife: parseInt(shelfLife),
        qualityTags,
        available,
        farmerId: user.id,
        image: imageUrl
      };

      if (productId) {
        Storage.update('products', productId, productData);
      } else {
        Storage.add('products', productData);
      }

      modal.close();
      loadProducts();

      productForm.reset();
      productPreviewContainer.style.backgroundImage = '';
      productPreviewContainer.textContent = 'No image selected';
    });
  }

  async function loadProducts() {
    if (!productList) return;

    const products = await Storage.findBy('products', 'farmerId', user.id);

    productList.innerHTML = '';

    if (products.length === 0) {
      productList.innerHTML = '<p class="text-center">No processed goods added yet. Click "Add New Product" to get started.</p>';
      return;
    }

    products?.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';

      productCard.innerHTML = `
        <div class="product-image" style="${product.image ? `background-image: url('${product.image}')` : ''}">
          <div class="product-tags">
            ${product.qualityTags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="product-content">
          <div class="product-header">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${formatCurrency(product.price)}</div>
          </div>
          <div class="product-description">${product.description}</div>
          <div class="product-details">
            <div class="product-detail-item">
              <span class="product-detail-label">Quantity:</span>
              <span>${product.quantity} units</span>
            </div>
            <div class="product-detail-item">
              <span class="product-detail-label">Packaging:</span>
              <span>${product.packaging}</span>
            </div>
            <div class="product-detail-item">
              <span class="product-detail-label">Shelf Life:</span>
              <span>${product.shelfLife} days</span>
            </div>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary edit-product" data-id="${product.id}">Edit</button>
            <button class="btn btn-danger delete-product" data-id="${product.id}">Delete</button>
          </div>
        </div>
      `;

      productCard.querySelector('.edit-product').addEventListener('click', function () {
        editProduct(product.id);
      });

      productCard.querySelector('.delete-product').addEventListener('click', function () {
        deleteProduct(product.id);
      });

      productList.appendChild(productCard);
    });
  }

  function editProduct(productId) {
    const product = Storage.getById('products', productId);
    if (!product) return;
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productPackaging').value = product.packaging;
    document.getElementById('productShelfLife').value = product.shelfLife;
    document.getElementById('productAvailable').checked = product.available;

    document.querySelectorAll('input[name="qualityTags"]')?.forEach(input => {
      input.checked = product.qualityTags.includes(input.value);
    });

    if (product.image) {
      productPreviewContainer.style.backgroundImage = `url('${product.image}')`;
      productPreviewContainer.textContent = '';
    } else {
      productPreviewContainer.style.backgroundImage = '';
      productPreviewContainer.textContent = 'No image selected';
    }

    productModalTitle.textContent = 'Edit Product';

    modal.open();
  }

  function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      Storage.remove('products', productId);
      loadProducts();
    }
  }
  const addProductBtn = document.getElementById('addProductBtn');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', function () {
      productForm.reset();
      document.getElementById('productId').value = '';
      productPreviewContainer.style.backgroundImage = '';
      productPreviewContainer.textContent = 'No image selected';

      productModalTitle.textContent = 'Add New Product';

      modal.open();
    });
  }
}


function initializeOrderManagement(user) {

  const orderDetailsModal = setupModal('orderDetailsModal', null, null);

  const ordersTable = document.getElementById('ordersTable');
  const orderStatusFilter = document.getElementById('orderStatusFilter');
  const updateStatusBtn = document.getElementById('updateStatusBtn');

  loadOrders();

  if (orderStatusFilter) {
    orderStatusFilter.addEventListener('change', function () {
      loadOrders(this.value);
    });
  }

  if (updateStatusBtn) {
    updateStatusBtn.addEventListener('click', function () {
      const orderId = document.getElementById('orderDetailId').textContent;
      const newStatus = document.getElementById('updateOrderStatus').value;

      if (orderId && newStatus) {
        Storage.update('orders', orderId, { status: newStatus });

        document.getElementById('orderDetailStatus').textContent = capitalizeFirstLetter(newStatus);
        document.getElementById('orderDetailStatus').className = `status-badge ${newStatus}`;

        loadOrders(orderStatusFilter ? orderStatusFilter.value : 'all');
      }
    });
  }

  async function loadOrders(statusFilter = 'all') {
    if (!ordersTable) return;

    const tableBody = ordersTable.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    let orders = await Storage.findBy('orders', 'farmerId', user.id);

    if (statusFilter !== 'all') {
      orders = orders?.filter(order => order.status === statusFilter);
    }

    if (orders.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="7" class="text-center">No orders found</td>';
      tableBody.appendChild(row);
      return;
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    orders?.forEach(order => {

      const buyer = Storage.getById('buyers', order.buyerId);

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${order.id}</td>
        <td>${formatDate(order.createdAt)}</td>
        <td>${buyer ? buyer.name : 'Unknown Buyer'}</td>
        <td>${order.items.length} item(s)</td>
        <td>${formatCurrency(order.totalAmount)}</td>
        <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
        <td>
          <button class="btn btn-outline-sm view-order" data-id="${order.id}">View</button>
        </td>
      `;

      row.querySelector('.view-order').addEventListener('click', function () {
        showOrderDetails(order.id);
      });

      tableBody.appendChild(row);
    });
  }

  function showOrderDetails(orderId) {
    const order = Storage.getById('orders', orderId);
    if (!order) return;

    const buyer = Storage.getById('buyers', order.buyerId);
    if (!buyer) return;

    document.getElementById('orderDetailId').textContent = order.id;
    document.getElementById('orderDetailDate').textContent = formatDate(order.createdAt, true);
    document.getElementById('orderDetailStatus').textContent = capitalizeFirstLetter(order.status);
    document.getElementById('orderDetailStatus').className = `status-badge ${order.status}`;

    document.getElementById('orderDetailBuyer').textContent = buyer.name;
    document.getElementById('orderDetailPhone').textContent = buyer.phone;
    document.getElementById('orderDetailEmail').textContent = buyer.email;

    const orderItemsList = document.getElementById('orderDetailItems');
    orderItemsList.innerHTML = '';

    order.items?.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - ${item.quantity} kg x ${formatCurrency(item.price)}/kg = ${formatCurrency(item.subtotal)}`;
      orderItemsList.appendChild(li);
    });
    document.getElementById('orderDetailAddress').textContent = order.deliveryAddress;

    const updateOrderStatus = document.getElementById('updateOrderStatus');
    if (updateOrderStatus) {
      updateOrderStatus.value = order.status;
    }

    orderDetailsModal.open();
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
    sendMessageBtn.addEventListener('click', function () {
      sendMessage();
    });

    messageInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  if (searchContactsInput) {
    searchContactsInput.addEventListener('input', function () {
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


      contactItem.addEventListener('click', function () {

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

    let recipient = Storage.getById('buyers', recipientId);

    if (!recipient) {
      recipient = Storage.getById('farmers', recipientId);
    }

    if (!recipient) {
      return;
    }

    if (chatRecipientName) {
      chatRecipientName.textContent = recipient.name;
    }

    if (chatRecipientStatus) {
      chatRecipientStatus.textContent = recipient.userType || `${recipient.district}, ${recipient.state}`;
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

function initializeAccountSettings(user) {

  const profileForm = document.getElementById('profileForm');
  const farmForm = document.getElementById('farmForm');
  const passwordForm = document.getElementById('passwordForm');
  const changeProfilePicBtn = document.getElementById('changeProfilePicBtn');
  const profilePictureInput = document.getElementById('profilePicture');

  if (profileForm) {
    profileForm.querySelector('#profileName').value = user.name;
    profileForm.querySelector('#profilePhone').value = user.phone;
    profileForm.querySelector('#profileEmail').value = user.email;
    profileForm.querySelector('#profileDistrict').value = user.district;
    profileForm.querySelector('#profileState').value = user.state;

    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = profileForm.querySelector('#profileName').value;
      const phone = profileForm.querySelector('#profilePhone').value;
      const email = profileForm.querySelector('#profileEmail').value;
      const district = profileForm.querySelector('#profileDistrict').value;
      const state = profileForm.querySelector('#profileState').value;

      Storage.update('farmers', user.id, {
        name,
        phone,
        email,
        district,
        state
      });

      const updatedUser = Storage.getById('farmers', user.id);
      console.log(" 1...")
      Storage.setCurrentUser(updatedUser, 'farmer');

      setUserDetails(updatedUser);

      alert('Profile updated successfully');
    });
  }

  if (farmForm) {
    farmForm.querySelector('#farmSize').value = user.farmSize;

    const cropCheckboxes = farmForm?.querySelectorAll('input[name="farmCrops"]');
    cropCheckboxes?.forEach(checkbox => {
      checkbox.checked = user?.crops?.includes(checkbox?.value);
    });

    farmForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const farmSize = farmForm.querySelector('#farmSize').value;
      const cropCheckboxes = farmForm.querySelectorAll('input[name="farmCrops"]:checked');
      const crops = Array.from(cropCheckboxes).map(checkbox => checkbox.value);

      Storage.update('farmers', user.id, {
        farmSize: parseFloat(farmSize),
        crops
      });

      const updatedUser = Storage.getById('farmers', user.id);
      console.log(" 4...")

      Storage.setCurrentUser(updatedUser, 'farmer');

      alert('Farm details updated successfully');
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
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

      Storage.update('farmers', user.id, {
        password: newPassword
      });

      passwordForm.reset();

      alert('Password updated successfully');
    });
  }

  if (changeProfilePicBtn && profilePictureInput) {
    changeProfilePicBtn.addEventListener('click', function () {
      profilePictureInput.click();
    });

    profilePictureInput.addEventListener('change', function () {
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

  if (!modal) return { open: () => { }, close: () => { } };

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