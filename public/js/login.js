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
        showNotification('error', 'Please fill out all fields.');
        toggleButtonSpinner(submitBtn, spinnerBtn, false);
        return;
    };

    if (!validateEmail(email)) {
        showNotification('error', 'Please enter a valid email.');
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
            showNotification('error', data.message || 'Login failed. Please try again.');
        };
    } catch (error) {
        console.error('Error during login:', error);
        showNotification('error', 'An error occurred. Please try again.');
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

// Function to create and display a notification
function showNotification(type, message) {
    const notificationsContainer = document.getElementById("notifications-container");

    // Helper function to create elements with class and content
    const createElement = (tag, classNames, textContent) => {
        const element = document.createElement(tag);
        element.classList.add(...classNames);
        if (textContent) element.textContent = textContent;
        return element;
    };

    // Define notification types and corresponding icons
    const notificationTypes = {
        success: { icon: "✔️", class: "success", bgColor: "#e9f7ec", borderColor: "#28a745" },
        error: { icon: "❌", class: "error", bgColor: "#f8d7da", borderColor: "#dc3545" },
        info: { icon: "ℹ️", class: "info", bgColor: "#d1ecf1", borderColor: "#17a2b8" },
        warning: { icon: "⚠️", class: "warning", bgColor: "#fff3cd", borderColor: "#ffc107" }
    };

    const { icon, class: notificationClass, bgColor, borderColor } = notificationTypes[type] || {};

    // Create notification card with type-specific styles
    const notificationCard = createElement("div", ["notification-card", notificationClass]);
    notificationCard.style.backgroundColor = bgColor;
    notificationCard.style.borderLeft = `5px solid ${borderColor}`;

    const iconElement = createElement("div", ["icon"], icon);
    const messageDiv = createElement("div", ["message"], message);
    const closeBtn = createElement("button", ["close-btn"], "×");
    closeBtn.onclick = () => removeNotification(notificationCard);

    notificationCard.append(iconElement, messageDiv, closeBtn);
    notificationsContainer.appendChild(notificationCard);

    // Automatically remove the notification after 5 seconds
    setTimeout(() => removeNotification(notificationCard), 2000);
};

// Function to remove notification (both manually and automatically)
function removeNotification(notificationCard) {
    notificationCard.style.opacity = "0";
    notificationCard.style.transform = "translateX(100%)";
    setTimeout(() => notificationCard.remove(), 500); // Remove after animation
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
