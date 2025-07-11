const endpoint ='http://localhost:5000/api/'
export async function createUser(data) {
  try {
    // console.log('-------API call-----:',data)
    const response = await fetch(`${endpoint}auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return {
      status: response.status,    // success code like 200, 201, etc.
      success: response.ok,       // true if status is 200–299
      data: result                // backend response data
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
};
export async function login(data) {
  try {

    const response = await fetch(`${endpoint}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return {
      status: response.status,    // success code like 200, 201, etc.
      success: response.ok,       // true if status is 200–299
      data: result                // backend response data
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
};

export async function addCrop(data) {
  try {
    const token = localStorage.getItem('token').replaceAll('"','')

    const response = await fetch(`${endpoint}crops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token

      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('------- addCrop API response-----:',result)


    return {
      status: response.status,    // success code like 200, 201, etc.
      success: response.ok,       // true if status is 200–299
      data: result                // backend response data
    };
  } catch (error) {
    console.log('------- addCrop error-----:',error)
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
};
export async function fetchAllCrop() {
  try {
  
    const token = localStorage.getItem('token').replaceAll('"','')
    const response = await fetch(`${endpoint}crops`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token

      },
      body: JSON.stringify()
    });

    const result = await response.json();
    console.log('------- addCrop API response-----:',result)


    return {
      status: response.status,    // success code like 200, 201, etc.
      success: response.ok,       // true if status is 200–299
      data: result                // backend response data
    };
  } catch (error) {
    console.log('------- get crop error-----:',error)
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
};

export async function placeOrder(data) {
  try {
    const response = await fetch(`${endpoint}orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+ localStorage.getItem('token')

      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('------- placeOrder API response-----:',result)


    return {
      status: response.status,    // success code like 200, 201, etc.
      success: response.ok,       // true if status is 200–299
      data: result                // backend response data
    };
  } catch (error) {
    console.log('------- placeOrder error-----:',error)
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
};
export async function fetchAllOrders() {
  try {
    const token = localStorage.getItem('token').replaceAll('"','')
    const response = await fetch(`${endpoint}orders`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':token

      },
      body: JSON.stringify()
    });

    const result = await response.json();
    console.log('------- fetchAllOrders API response-----:',result)


    return {
      status: response.status,    // success code like 200, 201, etc.
      success: response.ok,       // true if status is 200–299
      data: result                // backend response data
    };
  } catch (error) {
    console.log('------- fetchAllOrders crop error-----:',error)
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
};