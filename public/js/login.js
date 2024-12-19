// baseUrl
const baseUrl = 'https://quiz-app-backend-bi9c.onrender.com';

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const spinnerBtn = document.getElementById('spinner-btn');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Toggle button states
    toggleButtonSpinner(submitBtn, spinnerBtn, true);

    // Validate input fields
    if (!email || !password) {
        showAlert('Please fill out all fields.');
        toggleButtonSpinner(submitBtn, spinnerBtn, false);
        return;
    };

    if (!validateEmail(email)) {
        showAlert('Please enter a valid email.');
        toggleButtonSpinner(submitBtn, spinnerBtn, false);
        return;
    };

    const apiUrl = `${baseUrl}/api/auth/login`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('User logged in successfully:', data.user);
            setTokenCookie(data.token);
            window.location.href = "/pages/dashboard.html";
            document.getElementById('loginForm').reset();
        } else {
            console.error('Login Failed:', data);
            showAlert(data.error || 'Login failed. Please try again.');
        };
    } catch (error) {
        console.error('Error during login:', error);
        showAlert('An error occurred. Please try again.');
    } finally {
        toggleButtonSpinner(submitBtn, spinnerBtn, false);
    };
});

// Helper function to toggle spinner and submit button visibility
function toggleButtonSpinner(submitBtn, spinnerBtn, isLoading) {
    if (isLoading) {
        submitBtn.classList.add('d-none');
        spinnerBtn.classList.remove('d-none');
    } else {
        submitBtn.classList.remove('d-none');
        spinnerBtn.classList.add('d-none');
    };
};

// Helper function to show alerts
function showAlert(message) {
    alert(message);
};

// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// set token in cookie 
function setTokenCookie(token) {
    const cookieName = 'admin_token';
    const expiryDays = 1; // Number of days the cookie should last

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    document.cookie = `${cookieName}=${token}; path=/; expires=${expiryDate.toUTCString()}; Secure; SameSite=Strict`;
};

// Toggle password visibility
document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const icon = this.querySelector("i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    };
});
