
import { fetchAllCrop, fetchAllOrders } from '../js/common/apimethodCall.js';

const Storage = (function () {

  const defaultData = {
    farmers: [
      {
        id: 'f1',
        name: 'Ramesh Patel',
        email: 'ramesh@example.com',
        phone: '9876543210',
        district: 'Ahmedabad',
        state: 'Gujarat',
        farmSize: 5.5,
        crops: ['Rice', 'Wheat', 'Vegetables'],
        aadhaar: '123456789012',
        status: 'verified',
        createdAt: '2025-01-05T10:30:00',
        password: 'password123'
      },
      {
        id: 'f2',
        name: 'Sunita Kumari',
        email: 'sunita@example.com',
        phone: '8765432109',
        district: 'Patna',
        state: 'Bihar',
        farmSize: 3.2,
        crops: ['Corn', 'Pulses'],
        aadhaar: '234567890123',
        status: 'verified',
        createdAt: '2025-01-10T14:15:00',
        password: 'password123'
      },
      {
        id: 'f3',
        name: 'Manoj Singh',
        email: 'manoj@example.com',
        phone: '7654321098',
        district: 'Jaipur',
        state: 'Rajasthan',
        farmSize: 7.8,
        crops: ['Wheat', 'Millet', 'Pulses'],
        aadhaar: '345678901234',
        status: 'pending',
        createdAt: '2025-01-15T09:45:00',
        password: 'password123'
      }
    ],
    buyers: [
      {
        id: 'b1',
        name: 'Preeti Sharma',
        email: 'preeti@example.com',
        phone: '9876543211',
        userType: 'Retailer',
        businessName: 'Sharma Foods',
        address: '123, Market Street, Delhi',
        createdAt: '2025-01-07T11:20:00',
        password: 'password123'
      },
      {
        id: 'b2',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '8765432100',
        userType: 'Wholesaler',
        businessName: 'Kumar Enterprises',
        address: '456, Wholesale Market, Mumbai',
        createdAt: '2025-01-12T16:30:00',
        password: 'password123'
      },
      {
        id: 'b3',
        name: 'Anita Verma',
        email: 'anita@example.com',
        phone: '7654321099',
        userType: 'Consumer',
        businessName: '',
        address: '789, Residential Colony, Bangalore',
        createdAt: '2025-01-18T10:10:00',
        password: 'password123'
      }
    ],
    admins: [
      {
        id: 'a1',
        name: 'Admin',
        email: 'admin@kishanmitra.com',
        phone: '9999999999',
        password: 'admin123'
      }
    ],
    crops: [
      {
        id: 'c1',
        farmerId: 'f1',
        name: 'Basmati Rice',
        quantity: 500,
        price: 80,
        condition: 'Premium',
        description: 'High-quality aromatic Basmati rice, grown organically',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cmljZXxlbnwwfHx8fDE2OTAyMzc3MzB8MA&ixlib=rb-4.0.3&q=80&w=900',
        available: true,
        createdAt: '2025-01-06T09:30:00'
      },
      {
        id: 'c2',
        farmerId: 'f1',
        name: 'Fresh Tomatoes',
        quantity: 200,
        price: 30,
        condition: 'Fresh',
        description: 'Freshly harvested red tomatoes, perfect for salads and cooking',
        image: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8dG9tYXRvZXN8ZW58MHx8fHwxNjkwMjM3Nzk3fDA&ixlib=rb-4.0.3&q=80&w=900',
        available: true,
        createdAt: '2025-01-07T10:15:00'
      },
      {
        id: 'c3',
        farmerId: 'f2',
        name: 'Yellow Corn',
        quantity: 300,
        price: 25,
        condition: 'Fresh',
        description: 'Sweet yellow corn, harvested at peak ripeness',
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8Y29ybnxlbnwwfHx8fDE2OTAyMzc4Mjl8MA&ixlib=rb-4.0.3&q=80&w=900',
        available: true,
        createdAt: '2025-01-11T14:45:00'
      },
      {
        id: 'c4',
        farmerId: 'f3',
        name: 'Organic Wheat',
        quantity: 800,
        price: 40,
        condition: 'Organic',
        description: 'Organically grown wheat, no pesticides or chemical fertilizers used',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8d2hlYXR8ZW58MHx8fHwxNjkwMjM3ODY1fDA&ixlib=rb-4.0.3&q=80&w=900',
        available: true,
        createdAt: '2025-01-16T09:00:00'
      }
    ],
    products: [
      {
        id: 'p1',
        farmerId: 'f1',
        name: 'Rice Flour',
        description: 'Fine rice flour made from premium Basmati rice, perfect for traditional sweets and snacks',
        quantity: 100,
        price: 120,
        packaging: '1 kg packet, moisture-proof packaging',
        shelfLife: 180,
        qualityTags: ['Organic', 'Preservative-Free'],
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8NHx8cmljZSUyMGZsb3VyfGVufDB8fHx8MTY5MDIzNzk0MXww&ixlib=rb-4.0.3&q=80&w=900',
        available: true,
        createdAt: '2025-01-08T11:30:00'
      },
      {
        id: 'p2',
        farmerId: 'f2',
        name: 'Corn Flour',
        description: 'Ground corn flour, ideal for making rotis, bread, and other baked goods',
        quantity: 150,
        price: 90,
        packaging: '500g sealed packet',
        shelfLife: 120,
        qualityTags: ['Gluten-Free', 'Natural'],
        image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8Y29ybiUyMGZsb3VyfGVufDB8fHx8MTY5MDIzNzk5MHww&ixlib=rb-4.0.3&q=80&w=900',
        available: true,
        createdAt: '2025-01-13T15:45:00'
      }
    ],
    orders: [
      {
        id: 'o1',
        buyerId: 'b1',
        farmerId: 'f1',
        items: [
          {
            cropId: 'c1',
            name: 'Basmati Rice',
            quantity: 50,
            price: 80,
            subtotal: 4000
          }
        ],
        totalAmount: 4000,
        deliveryAddress: '123, Market Street, Delhi',
        status: 'delivered',
        createdAt: '2025-01-20T10:00:00',
        updatedAt: '2025-01-22T16:30:00',
        feedback: {
          rating: 5,
          comment: 'Excellent quality rice, very satisfied with the purchase!'
        }
      },
      {
        id: 'o2',
        buyerId: 'b2',
        farmerId: 'f1',
        items: [
          {
            cropId: 'c2',
            name: 'Fresh Tomatoes',
            quantity: 100,
            price: 30,
            subtotal: 3000
          }
        ],
        totalAmount: 3000,
        deliveryAddress: '456, Wholesale Market, Mumbai',
        status: 'shipped',
        createdAt: '2025-01-25T09:15:00',
        updatedAt: '2025-01-26T11:45:00'
      },
      {
        id: 'o3',
        buyerId: 'b3',
        farmerId: 'f2',
        items: [
          {
            cropId: 'c3',
            name: 'Yellow Corn',
            quantity: 20,
            price: 25,
            subtotal: 500
          }
        ],
        totalAmount: 500,
        deliveryAddress: '789, Residential Colony, Bangalore',
        status: 'processing',
        createdAt: '2025-01-28T14:20:00',
        updatedAt: '2025-01-28T16:00:00'
      }
    ],
    messages: [
      {
        id: 'm1',
        senderId: 'b1',
        receiverId: 'f1',
        message: 'Hello, I\'m interested in your Basmati Rice. Is it available for delivery to Delhi?',
        read: true,
        timestamp: '2025-01-19T09:30:00'
      },
      {
        id: 'm2',
        senderId: 'f1',
        receiverId: 'b1',
        message: 'Yes, the rice is available and we can deliver to Delhi. The minimum order quantity is 25 kg.',
        read: true,
        timestamp: '2025-01-19T10:15:00'
      },
      {
        id: 'm3',
        senderId: 'b1',
        receiverId: 'f1',
        message: 'Great! I\'d like to place an order for 50 kg. What would be the total cost including delivery?',
        read: true,
        timestamp: '2025-01-19T11:00:00'
      },
      {
        id: 'm4',
        senderId: 'f1',
        receiverId: 'b1',
        message: 'For 50 kg, the total cost would be ₹4,000 including delivery to Delhi. Should I proceed with the order?',
        read: true,
        timestamp: '2025-01-19T11:30:00'
      },
      {
        id: 'm5',
        senderId: 'b1',
        receiverId: 'f1',
        message: 'Yes, please proceed with the order. I\'ll make the payment through the platform.',
        read: true,
        timestamp: '2025-01-19T12:00:00'
      },
      {
        id: 'm6',
        senderId: 'b2',
        receiverId: 'f1',
        message: 'Hi, do you supply tomatoes in bulk? I need about 100 kg for my restaurant supply business.',
        read: true,
        timestamp: '2025-01-24T15:45:00'
      },
      {
        id: 'm7',
        senderId: 'f1',
        receiverId: 'b2',
        message: 'Yes, we can supply tomatoes in bulk. 100 kg is available. The price per kg is ₹30 for bulk orders.',
        read: true,
        timestamp: '2025-01-24T16:20:00'
      }
    ],
    favorites: [
      {
        id: 'fav1',
        buyerId: 'b1',
        itemId: 'c1',
        itemType: 'crop',
        addedAt: '2025-01-18T14:30:00'
      },
      {
        id: 'fav2',
        buyerId: 'b3',
        itemId: 'c3',
        itemType: 'crop',
        addedAt: '2025-01-27T10:15:00'
      }
    ]
  };

  function initializeStorage() {
    Object.keys(defaultData)?.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(defaultData[key]));
      }
    });
  }
  async function getAll(collection) {
    console.log("Collection Name:",collection)
    if (collection === "crops") {
      const { data } = await fetchAllCrop();
      // const data = localStorage.getItem(collection);
      console.log("response :",data)
      return data ?data : [];
    }
    // if (collection === "orders") {
    //   const { data } = await fetchAllOrders();
    //   // const data = localStorage.getItem(collection);
    //   console.log("response Order :",data)
    //   return data ?data : [];
    // }
    const data = localStorage.getItem(collection);
    // console.log("response :",JSON.stringify(data))
   return data ? JSON.parse(data) : [];

  }

  async function getById(collection, id) {
    const items = await  getAll(collection);
    return items.find(item => item.id === id) || null;
  }

  async function add(collection, item) {
    const items = await getAll(collection) || [];

    if (!item.id) {
      item.id = collection.charAt(0) + Math.random().toString(36).substr(2, 9);
    }

    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }

    items.push(item);
console.log("add func items",items)

    // Add API call for the Store Crop / order  data
    localStorage.setItem(collection, JSON.stringify(items));
    return item;
  }

  function update(collection, id, updates) {
    const items = getAll(collection);
console.log("items",items)

    const index = items.findIndex(item => item.id === id);
console.log("index",index)

    if (index === -1) return null;

    updates.updatedAt = new Date().toISOString();

    items[index] = { ...items[index], ...updates };
console.log(" items[index]", items[index])
    localStorage.setItem(collection, JSON.stringify(items));
    return items[index];
  }

  function remove(collection, id) {
    const items = getAll(collection);
    const filtered = items.filter(item => item.id !== id);

    if (filtered.length === items.length) return false;

    localStorage.setItem(collection, JSON.stringify(filtered));
    return true;
  }
  async function findBy(collection, key, value) {
    // if(!collection === '' || collection ===undefined) return null;
    const items = await getAll(collection);
    console.log("Item "+ collection +":",items)

    if (['crops'].includes(collection)) {
      console.log("Item:", items)
      return items;
    }
    return items?.filter(item => item[key] === value);
  }
  async function filter(collection, filterFn) {
    const items = await  getAll(collection);
    if (['crops'].includes(collection)) {
      return items;
    }
    console.log("filterFn:", filterFn)
    return items?.filter(filterFn);

  }
  function authenticate(email, password, userType) {
    let collection;

    if (userType === 'farmer') {
      collection = 'farmers';
    } else if (userType === 'buyer') {
      collection = 'buyers';
    } else if (userType === 'admin') {
      collection = 'admins';
    } else {
      return null;
    }

    const users = getAll(collection);
    const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  function setCurrentUser(user, userType) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userType', userType);
    localStorage.setItem('token', JSON.stringify(user?.data?.token));
  }

  function getCurrentUser() {

    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  function getUserType() {
    return localStorage.getItem('userType');
  }

  function isLoggedIn() {
    return !!getCurrentUser();
    // return true
  }

  function getStatistics() {
    const farmers = getAll('farmers');
    const buyers = getAll('buyers');
    const crops = getAll('crops');
    const orders = getAll('orders');

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const cropCounts = {};
    orders?.forEach(order => {
      order.items?.forEach(item => {
        if (!cropCounts[item.cropId]) {
          cropCounts[item.cropId] = 0;
        }
        cropCounts[item.cropId] += item.quantity;
      });
    });

    let mostSoldCropId = null;
    let mostSoldQuantity = 0;

    Object.keys(cropCounts)?.forEach(cropId => {
      if (cropCounts[cropId] > mostSoldQuantity) {
        mostSoldCropId = cropId;
        mostSoldQuantity = cropCounts[cropId];
      }
    });

    const mostSoldCrop = crops.find(crop => crop.id === mostSoldCropId);

    const farmerOrderCounts = {};
    orders?.forEach(order => {
      if (!farmerOrderCounts[order.farmerId]) {
        farmerOrderCounts[order.farmerId] = 0;
      }
      farmerOrderCounts[order.farmerId]++;
    });

    let topFarmerId = null;
    let topFarmerOrders = 0;

    Object.keys(farmerOrderCounts)?.forEach(farmerId => {
      if (farmerOrderCounts[farmerId] > topFarmerOrders) {
        topFarmerId = farmerId;
        topFarmerOrders = farmerOrderCounts[farmerId];
      }
    });

    const topFarmer = farmers.find(farmer => farmer.id === topFarmerId);

    const buyerOrderCounts = {};
    orders?.forEach(order => {
      if (!buyerOrderCounts[order.buyerId]) {
        buyerOrderCounts[order.buyerId] = 0;
      }
      buyerOrderCounts[order.buyerId]++;
    });

    let topBuyerId = null;
    let topBuyerOrders = 0;

    Object.keys(buyerOrderCounts)?.forEach(buyerId => {
      if (buyerOrderCounts[buyerId] > topBuyerOrders) {
        topBuyerId = buyerId;
        topBuyerOrders = buyerOrderCounts[buyerId];
      }
    });

    const topBuyer = buyers.find(buyer => buyer.id === topBuyerId);

    const regionRevenue = {};

    orders?.forEach(order => {
      const farmer = farmers.find(f => f.id === order.farmerId);

      if (farmer) {
        const region = farmer.state;

        if (!regionRevenue[region]) {
          regionRevenue[region] = 0;
        }

        regionRevenue[region] += order.totalAmount;
      }
    });

    let topRegion = null;
    let topRegionRevenue = 0;

    Object.keys(regionRevenue)?.forEach(region => {
      if (regionRevenue[region] > topRegionRevenue) {
        topRegion = region;
        topRegionRevenue = regionRevenue[region];
      }
    });

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      farmers: {
        total: farmers.length,
        verified: farmers.filter(f => f.status === 'verified').length,
        pending: farmers.filter(f => f.status === 'pending').length
      },
      buyers: {
        total: buyers.length,
        wholesalers: buyers.filter(b => b.userType === 'Wholesaler').length,
        retailers: buyers.filter(b => b.userType === 'Retailer').length,
        consumers: buyers.filter(b => b.userType === 'Consumer').length
      },
      crops: {
        total: crops.length,
        available: crops.filter(c => c.available).length
      },
      orders: {
        total: orders.length,
        pending: orders?.filter(o => o.status === 'pending').length,
        processing: orders?.filter(o => o.status === 'processing').length,
        shipped: orders?.filter(o => o.status === 'shipped').length,
        delivered: orders?.filter(o => o.status === 'delivered').length,
        cancelled: orders?.filter(o => o.status === 'cancelled').length
      },
      revenue: {
        total: totalRevenue,
        avgOrderValue: avgOrderValue
      },
      top: {
        crop: mostSoldCrop ? {
          name: mostSoldCrop.name,
          quantity: mostSoldQuantity
        } : null,
        farmer: topFarmer ? {
          name: topFarmer.name,
          orders: topFarmerOrders
        } : null,
        buyer: topBuyer ? {
          name: topBuyer.name,
          orders: topBuyerOrders
        } : null,
        region: topRegion ? {
          name: topRegion,
          revenue: topRegionRevenue
        } : null
      }
    };
  }

  async function getConversations(userId) {
    const messages = await getAll('messages');
    const farmers = await getAll('farmers');
    const buyers = await getAll('buyers');

    const conversations = new Map();

    messages?.forEach(message => {
      if (message.senderId === userId || message.receiverId === userId) {
        const otherId = message.senderId === userId ? message.receiverId : message.senderId;

        if (!conversations.has(otherId)) {

          let otherUser = farmers.find(f => f.id === otherId);
          if (!otherUser) {
            otherUser = buyers.find(b => b.id === otherId);
          }

          if (otherUser) {
            conversations.set(otherId, {
              id: otherId,
              name: otherUser.name,
              lastMessage: message,
              unreadCount: message.receiverId === userId && !message.read ? 1 : 0
            });
          }
        } else {
          const conversation = conversations.get(otherId);
          const lastTimestamp = new Date(conversation.lastMessage.timestamp);
          const currentTimestamp = new Date(message.timestamp);

          if (currentTimestamp > lastTimestamp) {
            conversation.lastMessage = message;
          }

          if (message.receiverId === userId && !message.read) {
            conversation.unreadCount++;
          }
        }
      }
    });
    return Array.from(conversations.values())
      .sort((a, b) => {
        const aTime = new Date(a.lastMessage.timestamp);
        const bTime = new Date(b.lastMessage.timestamp);
        return bTime - aTime;
      });
  }


  function getMessages(userId, otherId) {
    const messages = getAll('messages');

    return messages.filter(message =>
      (message.senderId === userId && message.receiverId === otherId) ||
      (message.senderId === otherId && message.receiverId === userId)
    ).sort((a, b) => {
      const aTime = new Date(a.timestamp);
      const bTime = new Date(b.timestamp);
      return aTime - bTime;
    });
  }

  function markMessagesAsRead(userId, senderId) {
    const messages = getAll('messages');
    let count = 0;

    const updatedMessages = messages.map(message => {
      if (message.receiverId === userId && message.senderId === senderId && !message.read) {
        count++;
        return { ...message, read: true };
      }
      return message;
    });

    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    return count;
  }

  function isEmailRegistered(email) {
    const farmers = getAll('farmers');
    const buyers = getAll('buyers');
    const admins = getAll('admins');

    return farmers.some(f => f.email === email) ||
      buyers.some(b => b.email === email) ||
      admins.some(a => a.email === email);
  }

  function isPhoneRegistered(phone) {
    const farmers = getAll('farmers');
    const buyers = getAll('buyers');
    const admins = getAll('admins');

    return farmers.some(f => f.phone === phone) ||
      buyers.some(b => b.phone === phone) ||
      admins.some(a => a.phone === phone);
  }


  initializeStorage();

  return {
    getAll,
    getById,
    add,
    update,
    remove,
    findBy,
    filter,
    authenticate,
    setCurrentUser,
    getCurrentUser,
    getUserType,
    isLoggedIn,
    getStatistics,
    getConversations,
    getMessages,
    markMessagesAsRead,
    isEmailRegistered,
    isPhoneRegistered,
    defaultData
  };
})();
// module.exports = {Storage}
window.Storage = Storage; 
