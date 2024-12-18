// baseUrl
const baseUrl = 'https://cys-app.netlify.app';

getTokenFromCookie();

// submit login form
document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate input fields
    if (!email || !password) {
        alert('Please fill out all fields.');
        return;
    };

    if (!validateEmail(email)) {
        alert('Please enter a valid email.');
        return;
    };

    const apiUrl = `${baseUrl}/api/auth/login`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`User logged in successful...!`, data.user);
            setTokenCookie(data.token);
            window.location.href = "/pages/dashboard.html";
            document.getElementById('loginForm').reset();
        } else {
            const errorData = await response.json();
            console.error('Login Failed:', errorData);
            return { success: false, message: errorData.error };
        };

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    };
});

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

    console.log('Token stored in cookie');
};

// get token from cookie function
function getTokenFromCookie() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('admin_token='));

    if (tokenCookie) {
        window.location.href = `${baseUrl}/pages/index.html`;
    }
    window.location.href = `${baseUrl}/index.html`;
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
