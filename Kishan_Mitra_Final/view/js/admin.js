document.addEventListener('DOMContentLoaded', function() {
  const currentUser = Storage.getCurrentUser();
  const userType = Storage.getUserType();
  
  if (!currentUser || userType !== 'admin') {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('headerUserName').textContent = currentUser.name;
  
  initializeOverview();
  initializeFarmersManagement();
  initializeBuyersManagement();
  initializeTransactionsManagement();
  initializeReports();
  initializeSettings(currentUser);
});

function initializeOverview() {
  const stats = Storage.getStatistics();
  
  document.getElementById('totalUsers').textContent = stats.farmers.total + stats.buyers.total;
  document.getElementById('totalFarmers').textContent = stats.farmers.total;
  document.getElementById('totalBuyers').textContent = stats.buyers.total;
  document.getElementById('pendingVerifications').textContent = stats.farmers.pending;
  document.getElementById('totalTransactions').textContent = stats.orders.total;
  document.getElementById('totalRevenue').textContent = formatCurrency(stats.revenue.total);
  
  if (stats.top.crop) {
    document.getElementById('mostSoldCrop').textContent = stats.top.crop.name;
    document.getElementById('mostSoldCrop').nextElementSibling.textContent = `${stats.top.crop.quantity} kg`;
  }
  
  if (stats.top.region) {
    document.getElementById('topRegion').textContent = stats.top.region.name;
    document.getElementById('topRegion').nextElementSibling.textContent = formatCurrency(stats.top.region.revenue);
  }
  
  if (stats.top.farmer) {
    document.getElementById('topFarmer').textContent = stats.top.farmer.name;
    document.getElementById('topFarmer').nextElementSibling.textContent = `${stats.top.farmer.orders} orders`;
  }
  
  if (stats.top.buyer) {
    document.getElementById('topBuyer').textContent = stats.top.buyer.name;
    document.getElementById('topBuyer').nextElementSibling.textContent = `${stats.top.buyer.orders} orders`;
  }
  
  document.getElementById('avgOrderValue').textContent = formatCurrency(stats.revenue.avgOrderValue);
  document.getElementById('activeProducts').textContent = stats.crops.available;
  
  populateRecentTransactions();

  populatePendingVerifications();
}

function populateRecentTransactions() {
  const tableBody = document.querySelector('#recentTransactionsTable tbody');
  if (!tableBody) return;
 
  let orders = Storage.getAll('orders');
  
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  orders = orders.slice(0, 5);
  
  tableBody.innerHTML = '';
  
  if (orders.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" class="text-center">No transactions found</td>';
    tableBody.appendChild(row);
    return;
  }
  
  orders?.forEach(order => {
    const farmer = Storage.getById('farmers', order.farmerId);
    const buyer = Storage.getById('buyers', order.buyerId);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${farmer ? farmer.name : 'Unknown'}</td>
      <td>${buyer ? buyer.name : 'Unknown'}</td>
      <td>${formatCurrency(order.totalAmount)}</td>
      <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
    `;
    
    row.addEventListener('click', () => {
      document.querySelector('.nav-link[data-page="transactions"]').click();
      showTransactionDetails(order.id);
    });
    
    tableBody.appendChild(row);
  });
}

function populatePendingVerifications() {
  const container = document.getElementById('pendingVerificationsList');
  if (!container) return;
  
  const pendingFarmers = Storage.filter('farmers', farmer => farmer.status === 'pending');
  
  container.innerHTML = '';
  
  if (pendingFarmers.length === 0) {
    container.innerHTML = '<p class="text-center">No pending verifications</p>';
    return;
  }
  
  pendingFarmers.slice(0, 3)?.forEach(farmer => {
    const card = document.createElement('div');
    card.className = 'verification-card';
    
    card.innerHTML = `
      <div class="verification-header">
        <h4 class="verification-id">ID: ${farmer.id}</h4>
        <p class="verification-date">Joined: ${formatDate(farmer.createdAt)}</p>
      </div>
      <div class="verification-content">
        <div class="verification-user">
          <div class="verification-avatar">${getInitials(farmer.name)}</div>
          <div class="verification-user-info">
            <h4>${farmer.name}</h4>
            <p>${farmer.district}, ${farmer.state}</p>
          </div>
        </div>
        <div class="verification-details">
          <div class="verification-detail-item">
            <span class="verification-detail-label">Phone:</span>
            <span>${farmer.phone}</span>
          </div>
          <div class="verification-detail-item">
            <span class="verification-detail-label">Farm Size:</span>
            <span>${farmer.farmSize} acres</span>
          </div>
          <div class="verification-detail-item">
            <span class="verification-detail-label">Crops:</span>
            <span>${farmer.crops.join(', ')}</span>
          </div>
        </div>
        <div class="verification-actions">
          <button class="btn btn-primary verify-farmer" data-id="${farmer.id}">Verify</button>
          <button class="btn btn-danger reject-farmer" data-id="${farmer.id}">Reject</button>
        </div>
      </div>
    `;
    
    card.querySelector('.verify-farmer').addEventListener('click', function() {
      verifyFarmer(this.dataset.id);
      card.remove();
    });
    
    card.querySelector('.reject-farmer').addEventListener('click', function() {
      rejectFarmer(this.dataset.id);
      card.remove();
    });
    
    container.appendChild(card);
  });
}

function initializeFarmersManagement() {
  const farmersTable = document.getElementById('farmersTable');
  const farmerStatusFilter = document.getElementById('farmerStatusFilter');
  const searchFarmers = document.getElementById('searchFarmers');
  const searchFarmersBtn = document.getElementById('searchFarmersBtn');
  const farmerDetailsModal = setupModal('farmerDetailsModal', null, null);
  
  loadFarmers();

  if (farmerStatusFilter) {
    farmerStatusFilter.addEventListener('change', function() {
      loadFarmers(this.value);
    });
  }
  if (searchFarmersBtn && searchFarmers) {
    searchFarmersBtn.addEventListener('click', function() {
      const searchTerm = searchFarmers.value.trim().toLowerCase();
      if (!searchTerm) {
        loadFarmers(farmerStatusFilter ? farmerStatusFilter.value : 'all');
        return;
      }
      
      searchFarmers(searchTerm);
    });
    
    searchFarmers.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchFarmersBtn.click();
      }
    });
  }

  const verifyFarmerBtn = document.getElementById('verifyFarmerBtn');
  const rejectFarmerBtn = document.getElementById('rejectFarmerBtn');
  
  if (verifyFarmerBtn) {
    verifyFarmerBtn.addEventListener('click', function() {
      const farmerId = this.dataset.id;
      verifyFarmer(farmerId);
      farmerDetailsModal.close();
      loadFarmers(farmerStatusFilter ? farmerStatusFilter.value : 'all');
    });
  }
  
  if (rejectFarmerBtn) {
    rejectFarmerBtn.addEventListener('click', function() {
      const farmerId = this.dataset.id;
      rejectFarmer(farmerId);
      farmerDetailsModal.close();
      loadFarmers(farmerStatusFilter ? farmerStatusFilter.value : 'all');
    });
  }
  
  function loadFarmers(statusFilter = 'all') {
    const tableBody = farmersTable ? farmersTable.querySelector('tbody') : null;
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
   
    let farmers = Storage.getAll('farmers');
    
    if (statusFilter !== 'all') {
      farmers = farmers.filter(farmer => farmer.status === statusFilter);
    }
    
    if (farmers.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="text-center">No farmers found</td>';
      tableBody.appendChild(row);
      return;
    }
  
    farmers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    farmers?.forEach(farmer => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${farmer.id}</td>
        <td>${farmer.name}</td>
        <td>${farmer.district}, ${farmer.state}</td>
        <td>${farmer.phone}</td>
        <td>${farmer.farmSize} acres</td>
        <td>${farmer.crops.join(', ')}</td>
        <td><span class="status-badge ${farmer.status}">${capitalizeFirstLetter(farmer.status)}</span></td>
        <td>
          <button class="btn btn-outline-sm view-farmer" data-id="${farmer.id}">View</button>
        </td>
      `;
      row.querySelector('.view-farmer').addEventListener('click', function() {
        viewFarmerDetails(farmer.id);
      });
      
      tableBody.appendChild(row);
    });
  }
  
  function searchFarmers(searchTerm) {
    const tableBody = farmersTable ? farmersTable.querySelector('tbody') : null;
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    let farmers = Storage.getAll('farmers');
 
    farmers = farmers.filter(farmer => 
      farmer.name.toLowerCase().includes(searchTerm) ||
      farmer.district.toLowerCase().includes(searchTerm) ||
      farmer.state.toLowerCase().includes(searchTerm) ||
      farmer.phone.includes(searchTerm) ||
      farmer.crops.some(crop => crop.toLowerCase().includes(searchTerm))
    );
    
    if (farmers.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="text-center">No farmers found matching your search</td>';
      tableBody.appendChild(row);
      return;
    }
    
    farmers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    farmers?.forEach(farmer => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${farmer.id}</td>
        <td>${farmer.name}</td>
        <td>${farmer.district}, ${farmer.state}</td>
        <td>${farmer.phone}</td>
        <td>${farmer.farmSize} acres</td>
        <td>${farmer.crops.join(', ')}</td>
        <td><span class="status-badge ${farmer.status}">${capitalizeFirstLetter(farmer.status)}</span></td>
        <td>
          <button class="btn btn-outline-sm view-farmer" data-id="${farmer.id}">View</button>
        </td>
      `;
      row.querySelector('.view-farmer').addEventListener('click', function() {
        viewFarmerDetails(farmer.id);
      });
      
      tableBody.appendChild(row);
    });
  }
  
  function viewFarmerDetails(farmerId) {
    const farmer = Storage.getById('farmers', farmerId);
    if (!farmer) return;
    
    document.getElementById('farmerDetailName').textContent = farmer.name;
    document.getElementById('farmerDetailInitials').textContent = getInitials(farmer.name);
    document.getElementById('farmerDetailLocation').textContent = `${farmer.district}, ${farmer.state}`;
    document.getElementById('farmerDetailStatus').textContent = capitalizeFirstLetter(farmer.status);
    document.getElementById('farmerDetailStatus').className = `status-badge ${farmer.status}`;
    
    document.getElementById('farmerDetailPhone').textContent = farmer.phone;
    document.getElementById('farmerDetailEmail').textContent = farmer.email;
    document.getElementById('farmerDetailFarmSize').textContent = `${farmer.farmSize} acres`;
    document.getElementById('farmerDetailCrops').textContent = farmer.crops.join(', ');
    document.getElementById('farmerDetailAadhaar').textContent = `XXXX-XXXX-${farmer.aadhaar.substring(8)}`;
    document.getElementById('farmerDetailRegDate').textContent = formatDate(farmer.createdAt);
 
    const crops = Storage.findBy('crops', 'farmerId', farmerId);
    const orders = Storage.findBy('orders', 'farmerId', farmerId);
    const completedOrders = orders?.filter(order => order.status === 'delivered');
    const totalRevenue = completedOrders.reduce((total, order) => total + order.totalAmount, 0);
    
    document.getElementById('farmerDetailListings').textContent = crops.length;
    document.getElementById('farmerDetailTransactions').textContent = completedOrders.length;
    document.getElementById('farmerDetailRevenue').textContent = formatCurrency(totalRevenue);
    

    const verificationActions = document.getElementById('verificationActions');
    if (verificationActions) {
      if (farmer.status === 'pending') {
        verificationActions.style.display = 'flex';
        
        const verifyButton = document.getElementById('verifyFarmerBtn');
        const rejectButton = document.getElementById('rejectFarmerBtn');
        
        if (verifyButton) verifyButton.dataset.id = farmerId;
        if (rejectButton) rejectButton.dataset.id = farmerId;
      } else {
        verificationActions.style.display = 'none';
      }
    }
   
    farmerDetailsModal.open();
  }
}

function verifyFarmer(farmerId) {
  Storage.update('farmers', farmerId, { status: 'verified' });
  
  initializeOverview();
 
  alert('Farmer verified successfully');
}
function rejectFarmer(farmerId) {
  Storage.update('farmers', farmerId, { status: 'rejected' });
  
  initializeOverview();
  
  alert('Farmer rejected');
}
function initializeBuyersManagement() {
  const buyersTable = document.getElementById('buyersTable');
  const buyerTypeFilter = document.getElementById('buyerTypeFilter');
  const searchBuyers = document.getElementById('searchBuyers');
  const searchBuyersBtn = document.getElementById('searchBuyersBtn');
 
  const buyerDetailsModal = setupModal('buyerDetailsModal', null, null);
  
  loadBuyers();
  
  if (buyerTypeFilter) {
    buyerTypeFilter.addEventListener('change', function() {
      loadBuyers(this.value);
    });
  }
  
  if (searchBuyersBtn && searchBuyers) {
    searchBuyersBtn.addEventListener('click', function() {
      const searchTerm = searchBuyers.value.trim().toLowerCase();
      if (!searchTerm) {
        loadBuyers(buyerTypeFilter ? buyerTypeFilter.value : 'all');
        return;
      }
      
      searchBuyers(searchTerm);
    });
    
    searchBuyers.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchBuyersBtn.click();
      }
    });
  }
 
  const viewBuyerOrdersBtn = document.getElementById('viewBuyerOrdersBtn');
  const blockBuyerBtn = document.getElementById('blockBuyerBtn');
  
  if (viewBuyerOrdersBtn) {
    viewBuyerOrdersBtn.addEventListener('click', function() {
      const buyerId = this.dataset.id;
      
      buyerDetailsModal.close();
      
      document.querySelector('.nav-link[data-page="transactions"]').click();
      
    });
  }
  
  if (blockBuyer) {
    blockBuyerBtn.addEventListener('click', function() {
      const buyerId = this.dataset.id;
      
      alert('Buyer blocking functionality would be implemented here');
      buyerDetailsModal.close();
    });
  }
  function loadBuyers(typeFilter = 'all') {
    const tableBody = buyersTable ? buyersTable.querySelector('tbody') : null;
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    let buyers = Storage.getAll('buyers');
    
    if (typeFilter !== 'all') {
      buyers = buyers.filter(buyer => buyer.userType === typeFilter);
    }
    
    if (buyers.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="text-center">No buyers found</td>';
      tableBody.appendChild(row);
      return;
    }
    buyers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    buyers?.forEach(buyer => {
      const orders = Storage.findBy('orders', 'buyerId', buyer.id);
      
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${buyer.id}</td>
        <td>${buyer.name}</td>
        <td>${buyer.userType}</td>
        <td>${buyer.phone}</td>
        <td>${buyer.email}</td>
        <td>${orders.length}</td>
        <td><span class="status-badge active">Active</span></td>
        <td>
          <button class="btn btn-outline-sm view-buyer" data-id="${buyer.id}">View</button>
        </td>
      `;
      row.querySelector('.view-buyer').addEventListener('click', function() {
        viewBuyerDetails(buyer.id);
      });
      
      tableBody.appendChild(row);
    });
  }
  function searchBuyers(searchTerm) {
    const tableBody = buyersTable ? buyersTable.querySelector('tbody') : null;
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    let buyers = Storage.getAll('buyers');
    
    buyers = buyers.filter(buyer => 
      buyer.name.toLowerCase().includes(searchTerm) ||
      buyer.userType.toLowerCase().includes(searchTerm) ||
      buyer.phone.includes(searchTerm) ||
      buyer.email.toLowerCase().includes(searchTerm) ||
      (buyer.businessName && buyer.businessName.toLowerCase().includes(searchTerm))
    );
    
    if (buyers.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="text-center">No buyers found matching your search</td>';
      tableBody.appendChild(row);
      return;
    }
    buyers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    buyers?.forEach(buyer => {
      const orders = Storage.findBy('orders', 'buyerId', buyer.id);
      
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${buyer.id}</td>
        <td>${buyer.name}</td>
        <td>${buyer.userType}</td>
        <td>${buyer.phone}</td>
        <td>${buyer.email}</td>
        <td>${orders.length}</td>
        <td><span class="status-badge active">Active</span></td>
        <td>
          <button class="btn btn-outline-sm view-buyer" data-id="${buyer.id}">View</button>
        </td>
      `;
      row.querySelector('.view-buyer').addEventListener('click', function() {
        viewBuyerDetails(buyer.id);
      });
      
      tableBody.appendChild(row);
    });
  }

  function viewBuyerDetails(buyerId) {
    const buyer = Storage.getById('buyers', buyerId);
    if (!buyer) return;
    
    document.getElementById('buyerDetailName').textContent = buyer.name;
    document.getElementById('buyerDetailInitials').textContent = getInitials(buyer.name);
    document.getElementById('buyerDetailType').textContent = buyer.userType;
    
    document.getElementById('buyerDetailPhone').textContent = buyer.phone;
    document.getElementById('buyerDetailEmail').textContent = buyer.email;
    document.getElementById('buyerDetailAddress').textContent = buyer.address;
    document.getElementById('buyerDetailBusiness').textContent = buyer.businessName || 'N/A';
    document.getElementById('buyerDetailRegDate').textContent = formatDate(buyer.createdAt);
    
    const orders = Storage.findBy('orders', 'buyerId', buyerId);
    const activeOrders = orders?.filter(order => 
      ['pending', 'processing', 'packed', 'shipped'].includes(order.status)
    );
    const totalSpent = orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.totalAmount, 0);
    
    document.getElementById('buyerDetailOrders').textContent = orders.length;
    document.getElementById('buyerDetailActiveOrders').textContent = activeOrders.length;
    document.getElementById('buyerDetailSpent').textContent = formatCurrency(totalSpent);
    
    const viewOrdersButton = document.getElementById('viewBuyerOrdersBtn');
    const blockButton = document.getElementById('blockBuyerBtn');
    
    if (viewOrdersButton) viewOrdersButton.dataset.id = buyerId;
    if (blockButton) blockButton.dataset.id = buyerId;
    
    buyerDetailsModal.open();
  }
}


function initializeTransactionsManagement() {
  const transactionsTable = document.getElementById('transactionsTable');
  const transactionStatusFilter = document.getElementById('transactionStatusFilter');
  const transactionDateFilter = document.getElementById('transactionDateFilter');
  const searchTransactions = document.getElementById('searchTransactions');
  const searchTransactionsBtn = document.getElementById('searchTransactionsBtn');
  
  const transactionDetailsModal = setupModal('transactionDetailsModal', null, null);
  
  loadTransactions();
  
  if (transactionStatusFilter) {
    transactionStatusFilter.addEventListener('change', function() {
      loadTransactions();
    });
  }
  
  if (transactionDateFilter) {
    transactionDateFilter.addEventListener('change', function() {
      loadTransactions();
    });
  }
  
  if (searchTransactionsBtn && searchTransactions) {
    searchTransactionsBtn.addEventListener('click', function() {
      loadTransactions();
    });
    
    searchTransactions.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchTransactionsBtn.click();
      }
    });
  }
  
  const updateTransStatusBtn = document.getElementById('updateTransStatusBtn');
  if (updateTransStatusBtn) {
    updateTransStatusBtn.addEventListener('click', function() {
      const transactionId = document.getElementById('transDetailId').textContent;
      const newStatus = document.getElementById('updateTransactionStatus').value;
      
      if (transactionId && newStatus) {
        Storage.update('orders', transactionId, { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
        
        document.getElementById('transDetailStatus').textContent = capitalizeFirstLetter(newStatus);
        document.getElementById('transDetailStatus').className = `status-badge ${newStatus}`;
        
        loadTransactions();
      }
    });
  }
  
  const saveNotesBtn = document.getElementById('saveNotesBtn');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', function() {
      const transactionId = document.getElementById('transDetailId').textContent;
      const notes = document.getElementById('adminNotes').value;
      
      if (transactionId) {
        Storage.update('orders', transactionId, { adminNotes: notes });
        
        alert('Notes saved successfully');
      }
    });
  }
  
  function loadTransactions() {
    const tableBody = transactionsTable ? transactionsTable.querySelector('tbody') : null;
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
   
    let orders = Storage.getAll('orders');
    
    const statusFilter = transactionStatusFilter ? transactionStatusFilter.value : 'all';
    if (statusFilter !== 'all') {
      orders = orders?.filter(order => order.status === statusFilter);
    }
    
    const dateFilter = transactionDateFilter ? transactionDateFilter.value : '';
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      
      orders = orders?.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === filterDate.getTime();
      });
    }

    const searchTerm = searchTransactions ? searchTransactions.value.trim().toLowerCase() : '';
    if (searchTerm) {
      orders = orders?.filter(order => {
    
        const farmer = Storage.getById('farmers', order.farmerId);
        const buyer = Storage.getById('buyers', order.buyerId);
        
        return order.id.toLowerCase().includes(searchTerm) ||
               (farmer && farmer.name.toLowerCase().includes(searchTerm)) ||
               (buyer && buyer.name.toLowerCase().includes(searchTerm)) ||
               order.items.some(item => item.name.toLowerCase().includes(searchTerm));
      });
    }
    
    if (orders.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="text-center">No transactions found</td>';
      tableBody.appendChild(row);
      return;
    }
 
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    orders?.forEach(order => {
      const farmer = Storage.getById('farmers', order.farmerId);
      const buyer = Storage.getById('buyers', order.buyerId);
      
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${order.id}</td>
        <td>${formatDate(order.createdAt)}</td>
        <td>${farmer ? farmer.name : 'Unknown'}</td>
        <td>${buyer ? buyer.name : 'Unknown'}</td>
        <td>${order.items.length} item(s)</td>
        <td>${formatCurrency(order.totalAmount)}</td>
        <td><span class="status-badge ${order.status}">${capitalizeFirstLetter(order.status)}</span></td>
        <td>
          <button class="btn btn-outline-sm view-transaction" data-id="${order.id}">View</button>
        </td>
      `;
      row.querySelector('.view-transaction').addEventListener('click', function() {
        showTransactionDetails(order.id);
      });
      
      tableBody.appendChild(row);
    });
  }
  
  function showTransactionDetails(transactionId) {
    const order = Storage.getById('orders', transactionId);
    if (!order) return;
  
    const farmer = Storage.getById('farmers', order.farmerId);
    const buyer = Storage.getById('buyers', order.buyerId);
    
    if (!farmer || !buyer) return;
    
    document.getElementById('transDetailId').textContent = order.id;
    document.getElementById('transDetailDate').textContent = formatDate(order.createdAt, true);
    document.getElementById('transDetailStatus').textContent = capitalizeFirstLetter(order.status);
    document.getElementById('transDetailStatus').className = `status-badge ${order.status}`;
    
    document.getElementById('transDetailFarmer').textContent = farmer.name;
    document.getElementById('transDetailFarmerPhone').textContent = farmer.phone;
    document.getElementById('transDetailBuyer').textContent = buyer.name;
    document.getElementById('transDetailBuyerPhone').textContent = buyer.phone;
    
    const itemsTableBody = document.getElementById('transDetailItems');
    itemsTableBody.innerHTML = '';
    
    order.items?.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity} kg</td>
        <td>${formatCurrency(item.price)}/kg</td>
        <td>${formatCurrency(item.subtotal)}</td>
      `;
      itemsTableBody.appendChild(row);
    });
    
    document.getElementById('transDetailTotal').textContent = formatCurrency(order.totalAmount);
    
    document.getElementById('transDetailAddress').textContent = order.deliveryAddress;
    
    const updateTransactionStatus = document.getElementById('updateTransactionStatus');
    if (updateTransactionStatus) {
      updateTransactionStatus.value = order.status;
    }
    
    const adminNotes = document.getElementById('adminNotes');
    if (adminNotes) {
      adminNotes.value = order.adminNotes || '';
    }
    
    const viewFarmerBtn = document.getElementById('viewFarmerBtn');
    const viewBuyerBtn = document.getElementById('viewBuyerBtn');
    
    if (viewFarmerBtn) viewFarmerBtn.dataset.id = order.farmerId;
    if (viewBuyerBtn) viewBuyerBtn.dataset.id = order.buyerId;
    
    if (viewFarmerBtn) {
      viewFarmerBtn.addEventListener('click', function() {
        transactionDetailsModal.close();
        
  
        document.querySelector('.nav-link[data-page="farmers"]').click();
        
        setTimeout(() => {
          const viewBtns = document.querySelectorAll('.view-farmer');
          viewBtns?.forEach(btn => {
            if (btn.dataset.id === order.farmerId) {
              btn.click();
            }
          });
        }, 300);
      });
    }
    
    if (viewBuyerBtn) {
      viewBuyerBtn.addEventListener('click', function() {
        transactionDetailsModal.close();
      
        document.querySelector('.nav-link[data-page="buyers"]').click();
        setTimeout(() => {
          const viewBtns = document.querySelectorAll('.view-buyer');
          viewBtns?.forEach(btn => {
            if (btn.dataset.id === order.buyerId) {
              btn.click();
            }
          });
        }, 300);
      });
    }
    
    transactionDetailsModal.open();
  }
}

function initializeReports() {
  const reportTabs = document.querySelectorAll('.report-tab');
  const reportContents = document.querySelectorAll('.report-tab-content');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const generateReportBtn = document.getElementById('generateReportBtn');
 
  if (startDateInput && endDateInput) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    endDateInput.valueAsDate = today;
    startDateInput.valueAsDate = thirtyDaysAgo;
  }
  
  if (reportTabs.length > 0 && reportContents.length > 0) {
    reportTabs?.forEach(tab => {
      tab.addEventListener('click', function() {
        reportTabs?.forEach(t => t.classList.remove('active'));
        reportContents?.forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        
        const reportId = this.dataset.report;
        const content = document.getElementById(`${reportId}Report`);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  }
  
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', function() {
      generateReports();
    });
  }
  generateReports();
 
  function generateReports() {
    const startDate = startDateInput ? new Date(startDateInput.value) : null;
    const endDate = endDateInput ? new Date(endDateInput.value) : null;
    
    if (startDate && endDate) {
      endDate.setHours(23, 59, 59, 999);
      const orders = Storage.filter('orders', order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      generateSalesReport(orders);
      
      generateProductReport(orders);
      
      generateUserReport(orders);
      
      generateRegionReport(orders);
    }
  }
  function generateSalesReport(orders) {

    const totalSales = orders.reduce((total, order) => total + order.totalAmount, 0);

    const completedOrders = orders?.filter(order => order.status === 'delivered').length;
    const completionRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;
 
    const avgOrder = orders.length > 0 ? totalSales / orders.length : 0;
   
    document.getElementById('totalSales').textContent = formatCurrency(totalSales).replace('₹', '');
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('avgOrder').textContent = formatCurrency(avgOrder).replace('₹', '');
    document.getElementById('completionRate').textContent = completionRate;
    
  }
  
  function generateProductReport(orders) {
  
    const products = {};
    
    orders?.forEach(order => {
      order.items?.forEach(item => {
        if (!products[item.cropId]) {
          products[item.cropId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            orders: 0
          };
        }
        
        products[item.cropId].quantity += item.quantity;
        products[item.cropId].revenue += item.subtotal;
        products[item.cropId].orders++;
      });
    });
    const productArray = Object.keys(products).map(key => ({
      id: key,
      ...products[key],
      avgPrice: products[key].quantity > 0 ? products[key].revenue / products[key].quantity : 0
    }));
    
    productArray.sort((a, b) => b.revenue - a.revenue);
   
    const tableBody = document.querySelector('#topProductsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (productArray.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" class="text-center">No data available</td>';
      tableBody.appendChild(row);
      return;
    }
    
    productArray.slice(0, 10)?.forEach(product => {
      const row = document.createElement('tr');
      
      let category = 'Other';
      const crop = Storage.getById('crops', product.id);
      if (crop) {
        category = getCropCategory(crop.name);
      } else {
        category = 'Processed Goods';
      }
      
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${category}</td>
        <td>${product.quantity} kg</td>
        <td>${formatCurrency(product.revenue)}</td>
        <td>${formatCurrency(product.avgPrice)}/kg</td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  function generateUserReport(orders) {
    const farmers = {};
    
    orders?.forEach(order => {
      if (!farmers[order.farmerId]) {
        farmers[order.farmerId] = {
          orders: 0,
          revenue: 0
        };
      }
      
      farmers[order.farmerId].orders++;
      farmers[order.farmerId].revenue += order.totalAmount;
    });
    
    const farmerArray = Object.keys(farmers).map(key => ({
      id: key,
      ...farmers[key]
    }));
    
    farmerArray.sort((a, b) => b.revenue - a.revenue);
    
    const farmersTableBody = document.querySelector('#topFarmersTable tbody');
    if (farmersTableBody) {
      farmersTableBody.innerHTML = '';
      
      if (farmerArray.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">No data available</td>';
        farmersTableBody.appendChild(row);
      } else {
        
        farmerArray.slice(0, 5)?.forEach(farmer => {
          const farmerData = Storage.getById('farmers', farmer.id);
          if (!farmerData) return;
          
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${farmerData.name}</td>
            <td>${farmerData.district}, ${farmerData.state}</td>
            <td>${farmer.orders}</td>
            <td>${formatCurrency(farmer.revenue)}</td>
          `;
          
          farmersTableBody.appendChild(row);
        });
      }
    }
    
    const buyers = {};
    
    orders?.forEach(order => {
      if (!buyers[order.buyerId]) {
        buyers[order.buyerId] = {
          orders: 0,
          spent: 0
        };
      }
      
      buyers[order.buyerId].orders++;
      buyers[order.buyerId].spent += order.totalAmount;
    });
    
    const buyerArray = Object.keys(buyers).map(key => ({
      id: key,
      ...buyers[key]
    }));
    
    buyerArray.sort((a, b) => b.spent - a.spent);
    
    const buyersTableBody = document.querySelector('#topBuyersTable tbody');
    if (buyersTableBody) {
      buyersTableBody.innerHTML = '';
      
      if (buyerArray.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">No data available</td>';
        buyersTableBody.appendChild(row);
      } else {
     
        buyerArray.slice(0, 5)?.forEach(buyer => {
          const buyerData = Storage.getById('buyers', buyer.id);
          if (!buyerData) return;
          
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${buyerData.name}</td>
            <td>${buyerData.userType}</td>
            <td>${buyer.orders}</td>
            <td>${formatCurrency(buyer.spent)}</td>
          `;
          
          buyersTableBody.appendChild(row);
        });
      }
    }
  }
  
  function generateRegionReport(orders) {
    const regions = {};
    
    orders?.forEach(order => {
      const farmer = Storage.getById('farmers', order.farmerId);
      const buyer = Storage.getById('buyers', order.buyerId);
      
      if (!farmer) return;
      
      const state = farmer.state;
      
      if (!regions[state]) {
        regions[state] = {
          farmers: new Set(),
          buyers: new Set(),
          orders: 0,
          revenue: 0
        };
      }
      
      regions[state].farmers.add(farmer.id);
      if (buyer) regions[state].buyers.add(buyer.id);
      regions[state].orders++;
      regions[state].revenue += order.totalAmount;
    });
    const regionArray = Object.keys(regions).map(key => ({
      state: key,
      farmers: regions[key].farmers.size,
      buyers: regions[key].buyers.size,
      orders: regions[key].orders,
      revenue: regions[key].revenue
    }));
    
    regionArray.sort((a, b) => b.revenue - a.revenue);
    
    const tableBody = document.querySelector('#regionDataTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (regionArray.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" class="text-center">No data available</td>';
      tableBody.appendChild(row);
      return;
    }
    
    regionArray?.forEach(region => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${region.state}</td>
        <td>${region.farmers}</td>
        <td>${region.buyers}</td>
        <td>${region.orders}</td>
        <td>${formatCurrency(region.revenue)}</td>
      `;
      
      tableBody.appendChild(row);
    });
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

function initializeSettings(user) {
  const adminProfileForm = document.getElementById('adminProfileForm');
  const adminPasswordForm = document.getElementById('adminPasswordForm');
  const notificationSettingsForm = document.getElementById('notificationSettingsForm');
  
  const backupBtn = document.getElementById('backupBtn');
  const maintenanceBtn = document.getElementById('maintenanceBtn');
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  
  if (adminProfileForm) {
    adminProfileForm.querySelector('#adminName').value = user.name;
    adminProfileForm.querySelector('#adminEmail').value = user.email;
    adminProfileForm.querySelector('#adminPhone').value = user.phone;
    
    adminProfileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = adminProfileForm.querySelector('#adminName').value;
      const email = adminProfileForm.querySelector('#adminEmail').value;
      const phone = adminProfileForm.querySelector('#adminPhone').value;
      
      Storage.update('admins', user.id, {
        name,
        email,
        phone
      });
      
      const updatedUser = Storage.getById('admins', user.id);
      console.log(" 2...")

      Storage.setCurrentUser(updatedUser, 'admin');
      
      document.getElementById('headerUserName').textContent = updatedUser.name;
      
      alert('Profile updated successfully');
    });
  }
  
  if (adminPasswordForm) {
    adminPasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentPassword = adminPasswordForm.querySelector('#currentPassword').value;
      const newPassword = adminPasswordForm.querySelector('#newPassword').value;
      const confirmNewPassword = adminPasswordForm.querySelector('#confirmNewPassword').value;
   
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
      
      Storage.update('admins', user.id, {
        password: newPassword
      });
      
      adminPasswordForm.reset();
    
      alert('Password updated successfully');
    });
  }
  
  if (notificationSettingsForm) {
    notificationSettingsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      alert('Notification preferences saved');
    });
  }
  
  if (backupBtn) {
    backupBtn.addEventListener('click', function() {
      alert('Database backup created successfully');
    });
  }
  
  if (maintenanceBtn) {
    maintenanceBtn.addEventListener('click', function() {
      if (this.textContent.includes('Enable')) {
        this.textContent = 'Disable Maintenance Mode';
        alert('Maintenance mode enabled. The platform is now in read-only mode for users.');
      } else {
        this.textContent = 'Enable Maintenance Mode';
        alert('Maintenance mode disabled. The platform is now fully operational.');
      }
    });
  }
  
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', function() {

      alert('Cache cleared successfully');
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