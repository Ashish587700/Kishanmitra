import { createUser,login } from './common/apimethodCall.js';
// import Storage from './storage.js';
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('farmerRegistrationForm')) {
    initializeFarmerRegistration();
  }

  if (document.getElementById('buyerRegistrationForm')) {
    initializeBuyerRegistration();
  }

  if (document.getElementById('loginForm')) {
    initializeLogin();
  }

  checkAuthStatus();
});

function checkAuthStatus() {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes('login.html');
  const isRegisterPage = currentPath.includes('register-');
  const isDashboardPage = currentPath.includes('dashboard-');
  const isAdminPage = currentPath.includes('admin.html');
// console.log("Login 1 issue:",Storage)
  if (Storage.isLoggedIn()) {
    // console.log("Login 2 issue",Storage)
    const userType = Storage.getUserType();
    if (isLoginPage || isRegisterPage) {
      if (userType === 'farmer') {
console.log("Login 3 issue")

        window.location.href = 'dashboard-farmer.html';
        return;
      } else if (userType === 'buyer') {
console.log("Login 4 issue")

        window.location.href = 'dashboard-buyer.html';
        return;
      } else if (userType === 'admin') {
        window.location.href = 'admin.html';
        return;
      }
    }
    if (isDashboardPage) {
      const isFarmerDashboard = currentPath.includes('dashboard-farmer.html');
      const isBuyerDashboard = currentPath.includes('dashboard-buyer.html');

      if ((userType === 'farmer' && !isFarmerDashboard) || 
          (userType === 'buyer' && !isBuyerDashboard) ||
          (userType === 'admin' && !isAdminPage)) {
        if (userType === 'farmer') {
          window.location.href = 'dashboard-farmer.html';
        } else if (userType === 'buyer') {
          window.location.href = 'dashboard-buyer.html';
        } else if (userType === 'admin') {
          window.location.href = 'admin.html';
        }
      }
    }

    if (isAdminPage && userType !== 'admin') {
      window.location.href = 'login.html';
    }
  } else {
    if (isDashboardPage || isAdminPage) {
      window.location.href = 'login.html';
    }
  }
}

function initializeFarmerRegistration() {
  const form = document.getElementById('farmerRegistrationForm');
  const nextButtons = document.querySelectorAll('.next-step');
  const prevButtons = document.querySelectorAll('.prev-step');
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const otpGroup = document.getElementById('otpGroup');
  const registerBtn = document.getElementById('registerBtn');
  const otpInputs = document.querySelectorAll('.otp-input');
  const otpHiddenInput = document.getElementById('otp');

  nextButtons?.forEach(button => {
    button.addEventListener('click', function() {
      const currentStep = parseInt(this.dataset.next) - 1;
      const nextStep = parseInt(this.dataset.next);
      if (validateStep(currentStep)) {
        showStep(nextStep);
      }
    });
  });

  prevButtons?.forEach(button => {
    button.addEventListener('click', function() {
      const prevStep = parseInt(this.dataset.prev);
      showStep(prevStep);
    });
  });

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', function() {
      const aadhaarInput = document.getElementById('aadhaar');
      const aadhaarValue = aadhaarInput.value;

      if (aadhaarValue.length !== 12 || !/^\d+$/.test(aadhaarValue)) {
        showError(aadhaarInput, 'Please enter a valid 12-digit Aadhaar number');
        return;
      }

      otpGroup.style.display = 'block';
      sendOtpBtn.textContent = 'Resend OTP';

      if (otpInputs.length > 0) {
        otpInputs[0].focus();
      }

      alert('OTP has been sent to your registered mobile number');
    });
  }

  if (otpInputs.length > 0) {
    otpInputs?.forEach((input, index) => {
      input.addEventListener('input', function() {
        if (this.value.length === 1) {
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
          updateOtpValue();
          if (isOtpComplete()) {
            registerBtn.disabled = false;
          }
        }
      });

      input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
  }

  form.addEventListener('submit',async function(e) {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      password: document.getElementById('password').value,
      district: document.getElementById('district').value,
      state: document.getElementById('state').value,
      farmSize: parseFloat(document.getElementById('farmSize').value),
      crops: getSelectedCrops(),
      aadhaar: document.getElementById('aadhaar').value,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userType: "farmer",
    };

    // Storage.add('farmers', formData);
     const response =  await createUser(formData)
    if(response.StatusCode === 200){
          alert('Registration successful! Your account is pending verification by admin.');
          window.location.href = 'login.html';
    }else if(response.StatusCode === 400){
      alert('User Email already exist ! Please try with another email.');
    }else if(response.StatusCode !== 200 || 400){
      alert('Registration failed! Please try again.1');
    }
  });

  function showStep(stepNumber) {
    const steps = document.querySelectorAll('.form-step');
    steps?.forEach(step => step.classList.remove('active'));

    const stepToShow = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (stepToShow) {
      stepToShow.classList.add('active');
    }

    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps?.forEach(step => {
      if (parseInt(step.dataset.step) <= stepNumber) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  function validateStep(stepNumber) {
    let isValid = true;

    if (stepNumber === 1) {
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const passwordInput = document.getElementById('password');
      const confirmPasswordInput = document.getElementById('confirmPassword');

      if (!nameInput.value.trim()) {
        showError(nameInput, 'Name is required');
        isValid = false;
      } else {
        hideError(nameInput);
      }

      if (!emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
      } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
      // } else if (Storage.isEmailRegistered(emailInput.value)) {
      //   showError(emailInput, 'This email is already registered');
      //   isValid = false;
      } else {
        hideError(emailInput);
      }

      if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Phone number is required');
        isValid = false;
      } else if (!isValidPhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid 10-digit phone number');
        isValid = false;
      // } else if (Storage.isPhoneRegistered(phoneInput.value)) {
      //   showError(phoneInput, 'This phone number is already registered');
      //   isValid = false;
      } else {
        hideError(phoneInput);
      }

      if (!passwordInput.value) {
        showError(passwordInput, 'Password is required');
        isValid = false;
      } else if (passwordInput.value.length < 8) {
        showError(passwordInput, 'Password must be at least 8 characters long');
        isValid = false;
      } else {
        hideError(passwordInput);
      }

      if (passwordInput.value !== confirmPasswordInput.value) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
      } else {
        hideError(confirmPasswordInput);
      }

    } else if (stepNumber === 2) {
      const districtInput = document.getElementById('district');
      const stateInput = document.getElementById('state');
      const farmSizeInput = document.getElementById('farmSize');
      const cropCheckboxes = document.querySelectorAll('input[name="crops"]');

      if (!districtInput.value.trim()) {
        showError(districtInput, 'District is required');
        isValid = false;
      } else {
        hideError(districtInput);
      }

      if (!stateInput.value) {
        showError(stateInput, 'Please select your state');
        isValid = false;
      } else {
        hideError(stateInput);
      }

      if (!farmSizeInput.value) {
        showError(farmSizeInput, 'Farm size is required');
        isValid = false;
      } else if (parseFloat(farmSizeInput.value) <= 0) {
        showError(farmSizeInput, 'Farm size must be greater than 0');
        isValid = false;
      } else {
        hideError(farmSizeInput);
      }

      let cropSelected = false;
      cropCheckboxes?.forEach(checkbox => {
        if (checkbox.checked) {
          cropSelected = true;
        }
      });

      if (!cropSelected) {
        const errorMessage = cropCheckboxes[0].parentElement.parentElement.nextElementSibling;
        errorMessage.textContent = 'Please select at least one crop';
        errorMessage.style.display = 'block';
        isValid = false;
      } else {
        const errorMessage = cropCheckboxes[0].parentElement.parentElement.nextElementSibling;
        errorMessage.style.display = 'none';
      }

    } else if (stepNumber === 3) {
      const aadhaarInput = document.getElementById('aadhaar');

      if (!aadhaarInput.value.trim()) {
        showError(aadhaarInput, 'Aadhaar number is required');
        isValid = false;
      } else if (aadhaarInput.value.length !== 12 || !/^\d+$/.test(aadhaarInput.value)) {
        showError(aadhaarInput, 'Please enter a valid 12-digit Aadhaar number');
        isValid = false;
      } else {
        hideError(aadhaarInput);
      }

      if (otpGroup.style.display === 'block' && !isOtpComplete()) {
        const errorMessage = otpHiddenInput.nextElementSibling;
        errorMessage.textContent = 'Please enter the complete OTP';
        errorMessage.style.display = 'block';
        isValid = false;
      }
    }

    return isValid;
  }

  function getSelectedCrops() {
    const checkboxes = document.querySelectorAll('input[name="crops"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
  }

  function updateOtpValue() {
    let otp = '';
    otpInputs?.forEach(input => {
      otp += input.value;
    });
    otpHiddenInput.value = otp;
  }

  function isOtpComplete() {
    return Array.from(otpInputs).every(input => input.value.length === 1);
  }
}

function initializeBuyerRegistration() {
  const form = document.getElementById('buyerRegistrationForm');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateBuyerForm()) {
      return;
    }

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      role: document.getElementById('userType').value,
      businessName: document.getElementById('businessName').value || '',
      address: document.getElementById('address').value,
      password: document.getElementById('password').value,
      createdAt: new Date().toISOString(),
      userType:"buyer"
    };

    // Storage.add('buyers', formData);
      const response =  await createUser(formData)
      // console.log(response)
    if(response?.status === 200){
          alert('Registration successful! Your account is pending verification by admin.');
          window.location.href = 'login.html';
    }else if(response?.status === 400){
      alert('User Email already exist ! Please try with another email.');
    }else if(response?.status !== 200 || 400){
      alert('Registration failed! Please try again.2:',response.StatusCode);
      // console.log("response.StatusCode:",response)
    }
  });

  function validateBuyerForm() {
    let isValid = true;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const userTypeInput = document.getElementById('userType');
    const addressInput = document.getElementById('address');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsAgreementInput = document.getElementById('termsAgreement');

    if (!nameInput.value.trim()) {
      showError(nameInput, 'Name is required');
      isValid = false;
    } else {
      hideError(nameInput);
    }

    if (!emailInput.value.trim()) {
      showError(emailInput, 'Email is required');
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, 'Please enter a valid email address');
      isValid = false;
    // } else if (Storage.isEmailRegistered(emailInput.value)) {
    //   showError(emailInput, 'This email is already registered');
    //   isValid = false;
    } else {
      hideError(emailInput);
    }

    if (!phoneInput.value.trim()) {
      showError(phoneInput, 'Phone number is required');
      isValid = false;
    } else if (!isValidPhone(phoneInput.value)) {
      showError(phoneInput, 'Please enter a valid 10-digit phone number');
      isValid = false;
    // } else if (Storage.isPhoneRegistered(phoneInput.value)) {
    //   showError(phoneInput, 'This phone number is already registered');
    //   isValid = false;
    } else {
      hideError(phoneInput);
    }

    if (!userTypeInput.value) {
      showError(userTypeInput, 'Please select a user type');
      isValid = false;
    } else {
      hideError(userTypeInput);
    }

    if (!addressInput.value.trim()) {
      showError(addressInput, 'Address is required');
      isValid = false;
    } else {
      hideError(addressInput);
    }

    if (!passwordInput.value) {
      showError(passwordInput, 'Password is required');
      isValid = false;
    } else if (passwordInput.value.length < 8) {
      showError(passwordInput, 'Password must be at least 8 characters long');
      isValid = false;
    } else {
      hideError(passwordInput);
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      showError(confirmPasswordInput, 'Passwords do not match');
      isValid = false;
    } else {
      hideError(confirmPasswordInput);
    }

    if (!termsAgreementInput.checked) {
      showError(termsAgreementInput, 'You must agree to the terms and conditions');
      isValid = false;
    } else {
      hideError(termsAgreementInput);
    }

    return isValid;
  }
}

function initializeLogin() {
  
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!validateLoginForm()) {
      return;
    }
    const user = await login({email, password, userType})

    if (user) {
      Storage.setCurrentUser(user, userType);
      if (userType === 'farmer') {
        window.location.href = 'dashboard-farmer.html';
      } else if (userType === 'buyer') {
        window.location.href = 'dashboard-buyer.html';
      } else if (userType === 'admin') {
        window.location.href = 'admin.html';
      }
    } else {
      alert('Invalid credentials. Please try again.');
    }
  });

  function validateLoginForm() {
    let isValid = true;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const userTypeInput = document.getElementById('userType');

    if (!emailInput.value.trim()) {
      showError(emailInput, 'Email or phone is required');
      isValid = false;
    } else {
      hideError(emailInput);
    }

    if (!passwordInput.value) {
      showError(passwordInput, 'Password is required');
      isValid = false;
    } else {
      hideError(passwordInput);
    }

    if (!userTypeInput.value) {
      showError(userTypeInput, 'Please select a user type');
      isValid = false;
    } else {
      hideError(userTypeInput);
    }

    return isValid;
  }
}

function showError(input, message) {
  const errorElement = input.nextElementSibling;
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  input.classList.add('error');
}

function hideError(input) {
  const errorElement = input.nextElementSibling;
  errorElement.style.display = 'none';
  input.classList.remove('error');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}
