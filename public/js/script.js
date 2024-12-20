const sidebarLinks = document.querySelectorAll('.sidebar-container a');
const contentSections = document.querySelectorAll('.content-section');
const title = document.getElementById('title');
const dynamicFormId = document.getElementById('dynamicForm');
const homeIcon = document.querySelector('.fa-house');
const dashboardLink = document.querySelector('#dashboardLink');
const cards = document.querySelectorAll('.card');
const backButtons = document.querySelectorAll('.backButton');
const createButtons = document.querySelectorAll('.createButton');
const buttons = document.querySelectorAll('.button-section');
const buttonClickMap = new Map();
const baseUrl = 'https://quiz-app-backend-bi9c.onrender.com';
const frontendBaseUrl = "https://cys-app.netlify.app";
let token;

// get token 
token = getTokenFromCookie();

// Add click event listeners to each card
cards.forEach(card => {
    card.addEventListener('click', () => {
        // Get the target sidebar link ID from the card's data-target attribute
        const targetLink = card.getAttribute('data-target');

        // Trigger a click on the corresponding sidebar link
        const link = document.querySelector(targetLink);
        if (link) {
            link.click();
        }
    });
});

// Loop through all back buttons and add the event listener
backButtons.forEach(function (backButton) {
    backButton.addEventListener('click', () => {
        const divId = backButton.getAttribute('data-id');
        const categoryId = divId.split('_')[0];
        const formId = divId.split('_')[1];

        document.querySelector('.createButton').classList.remove('d-none');
        document.querySelector('.createButton').classList.add('d-block');

        document.querySelector('.backButton').classList.remove('d-block');
        document.querySelector('.backButton').classList.add('d-none');

        document.getElementById(categoryId).classList.remove('d-none');
        document.getElementById(formId).classList.add('d-none');
        document.getElementById(formId).classList.remove('d-block');

        buttonClickMap.clear(); // Resets all button click counts
    });
});

// Loop through all create buttons and add the event listener
createButtons.forEach(function (createButton) {
    createButton.addEventListener('click', async () => {

        // get button id
        const buttonId = createButton.getAttribute('id');

        document.getElementById(buttonId).classList.add('d-none');
        document.querySelector('.backButton').classList.remove('d-none');
        document.querySelector('.backButton').classList.add('d-block');

        // Initialize click count for this button if not already tracked
        if (!buttonClickMap.has(buttonId)) {
            buttonClickMap.set(buttonId, 0);
        };

        // Get the current click count
        let countClick = buttonClickMap.get(buttonId);

        // Only allow the form to be generated on the first click
        if (countClick === 0) {
            const divId = createButton.getAttribute('data-id');
            const categoryId = divId.split('_')[0];
            const formId = divId.split('_')[1];

            document.getElementById(categoryId).classList.add('d-none');
            document.getElementById(formId).classList.remove('d-none');
            document.getElementById(formId).classList.add('d-block');

            const dataEndpoints = [
                {
                    url: `${baseUrl}/api/classes`,
                    id: "createSubjectButton",
                    dropdowns: [{ data_id: "classId", placeholder: "Select a class" }]
                },
                {
                    url: `${baseUrl}/api/classes`,
                    id: "createUserButton",
                    dropdowns: [{ data_id: "classId", placeholder: "Select a class" }]
                },
                {
                    url: `${baseUrl}/api/subjects`,
                    id: "createChapterButton",
                    dropdowns: [{ data_id: "subjectId", placeholder: "Select a subject" }]
                },
                {
                    url: `${baseUrl}/api/categories`,
                    url2: `${baseUrl}/api/chapters`,
                    id: "createQuestionButton",
                    dropdowns: [
                        { data_id: "categoryId", placeholder: "Select a category" },
                        { data_id: "chapterId", placeholder: "Select a chapter" }
                    ]
                },
                {
                    url: `${baseUrl}/api/classes`,
                    url2: `${baseUrl}/api/subjects`,
                    url3: `${baseUrl}/api/chapters`,
                    url4: `${baseUrl}/api/categories`,
                    id: "createQuizButton",
                    dropdowns: [
                        { data_id: "classId", placeholder: "Select a class" },
                        { data_id: "subjectId", placeholder: "Select a subject" },
                        { data_id: "chapterId", placeholder: "Select a chapter" },
                        { data_id: "categoryId", placeholder: "Select a category" }
                    ]
                }
            ];

            async function fetchDropDownData(buttonId, token) {
                // Find endpoint based on buttonId
                const endpoint = dataEndpoints.find((ep) => ep.id === buttonId);
                if (!endpoint) {
                    console.error("Invalid button ID");
                    return;
                };

                try {
                    // Fetch all URLs dynamically
                    const urls = Object.keys(endpoint)
                        .filter((key) => key.startsWith("url"))
                        .map((key) => endpoint[key]);

                    const responses = await Promise.all(urls.map((url) => fetchData(url, token)));

                    // Map data to dropdowns dynamically
                    responses.forEach((response, index) => {
                        const dropdownConfig = endpoint.dropdowns[index];
                        if (dropdownConfig) {
                            const dropdownElement = document.getElementById(dropdownConfig.data_id);
                            populateDropdown(dropdownElement, response.data, dropdownConfig.placeholder);
                        };
                    });
                } catch (error) {
                    console.error("Error fetching data:", error);
                };
            };

            await fetchDropDownData(buttonId, token);

            // Increment click count for this button
            buttonClickMap.set(buttonId, countClick + 1);
        };
    });
});

// Function to update the Correct Answer dropdown dynamically
function updateCorrectAnswerOptions() {
    const answerDropdown = document.getElementById('answer');
    const options = ['option_1', 'option_2', 'option_3', 'option_4'];

    // Clear existing options in the dropdown
    answerDropdown.innerHTML = '<option value="" selected>Select Correct Answer</option>';

    // Loop through each option input and add to the dropdown if not empty
    options.forEach((optionId, index) => {
        const optionValue = document.getElementById(optionId).value.trim();
        if (optionValue) {
            const newOption = document.createElement('option');
            newOption.value = optionValue;
            newOption.textContent = `Answer ${String.fromCharCode(65 + index)}`;
            answerDropdown.appendChild(newOption);
        }
    });
};

// Event listeners to update the dropdown whenever an option is changed
['option_1', 'option_2', 'option_3', 'option_4'].forEach(optionId => {
    if (document.getElementById(optionId)) {
        document.getElementById(optionId).addEventListener('input', updateCorrectAnswerOptions);
    };
});

// get token from cookie function
function getTokenFromCookie() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('admin_token='));

    // show loader
    document.getElementById('loader').classList.remove('d-none');

    if (tokenCookie) {
        return tokenCookie.split('=')[1]; // Extract the token value
    };

    // hide loader
    document.getElementById('loader').classList.add('d-none');
    window.location.href = `${frontendBaseUrl}/index.html`;
};

// Function to populate dropdown dynamically
function populateDropdown(dropdown, data, placeholder) {
    if (!dropdown || !data) return;

    dropdown.innerHTML = `<option value="">${placeholder}</option>`; // Set placeholder

    // Map data dynamically based on common keys like id and name
    data.forEach((item) => {
        dropdown.innerHTML += `<option value="${item._id}">${item.name}</option>`;
    });
};

// Show the popup
function showDeletePopup() {
    document.getElementById("deletePopup").style.display = "flex";
};

// Helper function to toggle button states
function toggleButtonState(isLoading) {
    const submitBtn = document.getElementById("submitBtn");
    const loadingBtn = document.getElementById("loading-btn");

    if (isLoading) {
        submitBtn.classList.add("d-none");
        loadingBtn.classList.remove("d-none");
        loadingBtn.classList.add("d-block");
    } else {
        submitBtn.classList.remove("d-none");
        loadingBtn.classList.add("d-none");
        loadingBtn.classList.remove("d-block");
    };
};

// checck element
function handleMissingElement(selector) {
    let element = document.querySelector(selector);
    return element ? true : false;
};

// Load dashboard data
function loadDashboardCardData(data) {
    // Check if the data and necessary properties exist before trying to set values
    if (data && data.data) {
        // Check if each element exists in the DOM before modifying it
        const totalQuizElement = document.getElementById('total_quiz');
        const totalChapterElement = document.getElementById('total_chapter');
        const totalReportElement = document.getElementById('total_report');
        const totalUserElement = document.getElementById('total_user');

        if (totalQuizElement) totalQuizElement.innerText = data.data.totalQuizzes || 0;
        if (totalChapterElement) totalChapterElement.innerText = data.data.totalChapters || 0;
        if (totalReportElement) totalReportElement.innerText = data.data.totalReports || 0;
        if (totalUserElement) totalUserElement.innerText = data.data.totalUsers || 0;
    } else {
        console.error('Invalid data structure or missing data');
    };
};

// load new users data
function loadNewUsersData(data) {
    document.getElementById('user-list').innerHTML = "";
    const userListElement = document.getElementById("user-list");

    data.newUsers.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
        <div class="user-avatar">
          <img src="${user.profileUrl || 'https://via.placeholder.com/50'}" alt="">
        </div>
        <div class="user-details">
          <span class="user-name">${user.fullName}</span>
          <span class="user-email">${user.email}</span>
        </div>
        <span class="user-date">Joined: ${new Date(user.createdAt).toISOString().split('T')[0]}</span>
      `;
        userListElement.appendChild(listItem);
    });
};

// lead category data
function loadCategoryData(data) {
    const container = document.getElementById("categoryContainer");
    container.innerHTML = '';

    data.data.forEach((category, index) => {
        // Create the card structure
        const card = document.createElement("div");
        card.className = "col";
        card.innerHTML = `
        <div class="card subject-card h-100">
          <img
            src="${category.imageUrl}"
            class="card-img-top"
            alt="${category.name}"
          />
          <div class="card-body text-center">
            <h5 class="card-title">${category.name}</h5>
            <div class="d-flex justify-content-center gap-2">
              <button
                class="btn btn-warning btn-sm fw-bold createButton"
                data-edit-id="${category._id}"
                id="createEditCategory${index + 1}"
                data-id="category"
                data-form-id="create"
                data-title="Edit Category"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="btn btn-danger btn-sm fw-bold"
                onclick="showDeletePopup()"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      `;
        // Append the card to the container
        container.appendChild(card);
    });
};

// load class data
function loadClassData(data) {
    // Ensure data is valid
    if (!data || !Array.isArray(data.data)) {
        console.error("Invalid data format. Expected an object with a 'data' array.");
        return;
    }

    const table = document.getElementById("classTable");

    // Clear existing table rows (excluding headers)
    table.querySelector("tbody").innerHTML = "";

    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();

    data.data.forEach(class_ => {
        const row = document.createElement("tr");

        // Class Name Cell
        const classNameCell = document.createElement("td");
        classNameCell.textContent = class_.name;
        row.appendChild(classNameCell);

        // Status Cell
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `badge bg-${class_.status === "Active" ? "success" : "danger"} badge-status`;
        badge.textContent = class_.status;
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        // Actions Cell
        const actionsCell = document.createElement("td");

        // Edit Button
        const editButton = document.createElement("button");
        editButton.className = "btn btn-warning btn-sm me-2 fw-bold createButton";
        editButton.dataset.editId = class_._id; // Use dataset for custom attributes
        editButton.dataset.id = "class";
        editButton.dataset.formId = "create";
        editButton.dataset.title = "Edit Class";
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener("click", () => {
            handleEdit(class_._id); // Attach event listener for edit
        });
        actionsCell.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement("button");
        deleteButton.className = "btn btn-danger btn-sm fw-bold";
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.addEventListener("click", () => {
            showDeletePopup(class_._id); // Attach event listener for delete
        });
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        fragment.appendChild(row);
    });

    // Append all rows at once
    table.querySelector("tbody").appendChild(fragment);
};

// load subject data
function loadSubjectData(data) {
    const container = document.getElementById("subjectContainer");
    container.innerHTML = '';
    container.innerHTML = data.data.map(subject => `
        <div class="col">
            <div class="card subject-card h-100">
                <img src="${subject.imageUrl}" class="card-img-top" alt="${subject.name}" />
                <div class="card-body text-center">
                    <h5 class="card-title">${subject.name}</h5>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-warning btn-sm fw-bold createButton" 
                                data-edit-id="${subject._id}" 
                                id="createEditSubject${subject._id}" 
                                data-id="subject" 
                                data-form-id="create" 
                                data-title="Edit Subject">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm fw-bold" 
                                onclick="showDeletePopup()">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
};

// load chapter data
function loadChapterData(data) {
    const container = document.getElementById("chapterContainer");
    container.innerHTML = "";
    container.innerHTML = data.data.map(chapter => `
        <div class="col">
            <div class="card chapter-card_">
                <img src="${chapter.imageUrl}" alt="${chapter.name}" class="card-img-top" />
                <div class="card-body text-center">
                    <h5 class="card-title">${chapter.name}</h5>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-warning btn-sm createButton" 
                                data-edit-id="${chapter._id}" 
                                id="createEditChapter${chapter._id}" 
                                data-id="chapter" 
                                data-form-id="create" 
                                data-title="Edit Chapter">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" 
                                onclick="showDeletePopup()">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
};

// load question data
function loadQuestionData(data) {
    const tableBody = document.getElementById("questionTableBody");
    tableBody.innerHTML = "";
    tableBody.innerHTML = data.data.map(question => `
        <tr>
            <td>${question.question}</td>
            <td>
                <span class="badge bg-${question.status === "Active" ? "success" : "danger"} badge-status">
                    ${question.status}
                </span>
            </td>
            <td>
                <button class="btn btn-warning btn-sm mb-1 createButton"
                        title="Edit Question"
                        data-edit-id="${question._id}"
                        id="createEditQuestion${question._id}"
                        data-id="question"
                        data-form-id="create"
                        data-title="Edit Question">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm mb-1"
                        title="Delete Question"
                        onclick="showDeletePopup()">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

// load quiz data 
function loadQuizData(data) {
    const quizContainer = document.getElementById("quizContainer");
    quizContainer.innerHTML = "";
    quizContainer.innerHTML = data.data.map(quiz => `
        <div class="col">
            <div class="card quiz-card_">
                <img 
                    src="${quiz.imageUrl || '/images/default_quiz.png'}" 
                    class="card-img-top quiz-image" 
                    alt="${quiz.quizTitle || 'Quiz Image'}" 
                />
                <div class="card-body quiz-card-body p-3 text-center">
                    <h5 class="card-title">${quiz.quizTitle}</h5>
                    <div class="d-flex justify-content-center gap-2">
                        <button 
                            class="btn btn-warning btn-sm createButton"
                            data-edit-id="${quiz._id}"
                            id="createEditQuiz${quiz._id}"
                            data-id="quiz"
                            data-form-id="create"
                            data-title="Edit Quiz">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button 
                            class="btn btn-danger btn-sm"
                            onclick="showDeletePopup()">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
};

// load user data
function loadUserData(data) {
    const userTableBody = document.getElementById("userTableBody");
    userTableBody.innerHTML = "";
    userTableBody.innerHTML = data.data.map(user => `
        <tr>
            <td>
                <img 
                    src="${user.profileUrl || 'https://via.placeholder.com/50'}" 
                    alt="User Image" 
                    class="rounded-circle" 
                    style="width: 50px; height: 50px;"
                />
            </td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toISOString().split('T')[0]}</td>
            <td>
                <span class="badge bg-${user.status === 'Active' ? 'success' : 'danger'} badge-status">
                    ${user.status}
                </span>
            </td>
            <td>
                <button
                    class="btn btn-warning btn-sm mb-1 createButton"
                    title="Edit User"
                    data-edit-id="${user._id}"
                    id="createEditUser${user._id}"
                    data-id="user"
                    data-form-id="create"
                    data-title="Edit User"
                >
                    <i class="fas fa-edit"></i>
                </button>
                <button
                    class="btn btn-danger btn-sm mb-1"
                    title="Delete User"
                    onclick="showDeletePopup()"
                >
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

// load report data
function loadReportData(data) {
    const reportTableBody = document.getElementById("reportTableBody");
    reportTableBody.innerHTML = "";
    reportTableBody.innerHTML = data.data.map(report => `
        <tr>
            <td>${report.reporterId.fullName}</td>
            <td>${report.reason}</td>
            <td>${new Date(report.reporterId.createdAt).toISOString().split('T')[0]}</td>
            <td>
                <button
                    class="btn btn-info btn-sm mb-2 fw-bold"
                    title="View Report"
                    onclick="viewReport(${report._id})"
                >
                    <i class="fas fa-eye"></i>
                </button>
                <button
                    class="btn btn-danger btn-sm mb-2 fw-bold"
                    title="Delete Report"
                    onclick="showDeletePopup()"
                >
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

// edit
function handleEdit(id) {
    console.log(`Edit button clicked for ID: ${id}`);
    // Add edit logic here
};

// view
function viewReport(id) {
    console.log(`View report with ID: ${id}`);
    // Add your logic to display or handle report viewing
};

// Function to handle server response with errors
function handleFormErrors(errors) {
    // Clear any existing error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach((elem) => elem.remove());

    // Ensure errors is an array before processing
    if (Array.isArray(errors)) {
        // Group errors by field path (name or id)
        const groupedErrors = {};

        errors.forEach((error) => {
            // Group errors by field name/path (we only keep the first error for each field)
            if (!groupedErrors[error.path]) {
                groupedErrors[error.path] = error.msg;
            };
        });

        // Now loop through the grouped errors and display them
        Object.keys(groupedErrors).forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Create a div to display the first error message for the field
                const errorMessageDiv = document.createElement('div');
                errorMessageDiv.classList.add('error-message', 'text-danger', 'mt-2');
                errorMessageDiv.textContent = groupedErrors[fieldId];

                // Append the error message after the field
                field.insertAdjacentElement('afterend', errorMessageDiv);
            };
        });
    } else {
        console.error('Expected errors to be an array but got:', errors);
    };
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

// dynamic api function
async function dynamicApiRequest({ url, method = "GET", headers = {}, body = null }) {
    try {
        const options = {
            method,
            headers: { ...headers },
        };

        // Handle JSON and FormData bodies
        if (body) {
            if (body instanceof FormData) {
                // Remove Content-Type header for FormData
                delete options.headers["Content-Type"];
                options.body = body;
            } else if (["POST", "PUT", "PATCH"].includes(method)) {
                options.headers["Content-Type"] = "application/json";
                options.body = JSON.stringify(body);
            };
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            handleFormErrors(errorData.errors);
            throw new Error(`HTTP error! status: ${response.status}`);
        };

        return await response.json();
    } catch (error) {
        console.error("Error in API request:", error);
        throw error;
    };
};

// Helper function to make API requests dynamically get
async function fetchData(url, token = '') {
    const response = await dynamicApiRequest({
        url,
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
    });
    return response;
};

// Helper function to make API requests dynamically post
async function postData(url, token = '', body) {
    const response = await dynamicApiRequest({
        url,
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body,
    });
    return response;
};

// show loader
document.getElementById('loader').classList.remove('d-none');

// call api
(async (baseUrl) => {
    try {
        // get data endpoints
        const getDataEndpoints = [
            { url: `${baseUrl}/api/dashboard/stats`, handler: loadDashboardCardData, id: "dashboard-card-container" },
            { url: `${baseUrl}/api/dashboard/new-users`, handler: loadNewUsersData, id: "user-list" },
            { url: `${baseUrl}/api/categories`, handler: loadCategoryData, id: "categoryContainer" },
            { url: `${baseUrl}/api/classes`, handler: loadClassData, id: "classTable" },
            { url: `${baseUrl}/api/subjects`, handler: loadSubjectData, id: "subjectContainer" },
            { url: `${baseUrl}/api/chapters`, handler: loadChapterData, id: "chapterContainer" },
            { url: `${baseUrl}/api/questions`, handler: loadQuestionData, id: "questionTableBody" },
            { url: `${baseUrl}/api/quizzes`, handler: loadQuizData, id: "quizContainer" },
            { url: `${baseUrl}/api/auth/users`, handler: loadUserData, id: "userTableBody" },
            { url: `${baseUrl}/api/reports`, handler: loadReportData, id: "reportTableBody" }
        ];

        // Use Promise.all to wait for all data to load
        await Promise.all(getDataEndpoints.map(async ({ url, handler, id }) => {
            if (document.getElementById(id)) {
                const data = await fetchData(url, token);
                handler(data);
            };
        }));

        // Hide loader and show main content
        document.getElementById('loader').classList.add('d-none');

    } catch (error) {
        console.error("Error fetching data:", error);
    };
})(baseUrl);

// toggle sidebar btn
document.getElementById('toggleButton').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar__');

    // Check if the screen size is medium to small
    if (window.matchMedia('(max-width: 768px)').matches) {
        // Toggle the `d-none` class to show/hide the sidebar
        if (sidebar.classList.contains('d-none')) {
            sidebar.classList.remove('d-none'); // Open the sidebar
            document.body.style.overflow = 'hidden'; // Disable scroll
        } else {
            sidebar.classList.add('d-none'); // Close the sidebar
            document.body.style.overflow = ''; // Enable scroll
        };
    };
});

// Close the sidebar if clicked outside
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar__');
    const toggleButton = document.getElementById('toggleButton');

    if (!sidebar.classList.contains('d-none') && !sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
        sidebar.classList.add('d-none'); // Close the sidebar
        document.body.style.overflow = ''; // Enable scroll
    };
});

// Close the sidebar if clicked outside
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar__');
    const toggleButton = document.getElementById('toggleButton');

    if (!sidebar.classList.contains('d-none')
        && !sidebar.contains(event.target)
        && !toggleButton.contains(event.target)) {
        sidebar.classList.add('d-none'); // Close the sidebar
        document.body.style.overflow = ''; // Enable scroll
    };
});

document.getElementById("logoutButton").addEventListener("click", async (e) => {
    e.preventDefault();

    // show loader
    document.getElementById('loader').classList.remove('d-none');

    const url = `${baseUrl}/api/auth/logout`;
    const response = await dynamicApiRequest({
        url,
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });
    if (response.success) {
        document.cookie.split(";").forEach((cookie) => {
            const [name] = cookie.split("=");
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        // show loader
        document.getElementById('loader').classList.add('d-none');

        window.location.href = `${frontendBaseUrl}/index.html`;
    } else {
        showNotification('error', response.message || 'Logout failed!')
    };
});

if (document.getElementById('cancelDelete')
    || document.getElementById('confirmDelete')
    || document.getElementById('submitBtn')) {

    // Close the popup when Cancel is clicked
    document.getElementById("cancelDelete").addEventListener("click", function () {
        document.getElementById("deletePopup").style.display = "none";
    });

    // Close the popup and confirm delete when Confirm is clicked
    document.getElementById("confirmDelete").addEventListener("click", function () {
        document.getElementById("deletePopup").style.display = "none";
        showNotification('success', 'Item deleted!');
    });

    // submit btn
    document.getElementById("submitBtn").addEventListener("click", async (event) => {
        toggleButtonState(true);

        const form = document.getElementById("dynamicForm");
        const formData = new FormData(form);
        const dataTitle = event.target.getAttribute('data-title');

        // Capitalize the "status" field, if it exists
        const status = formData.get("status");
        if (status) formData.set("status", status.charAt(0).toUpperCase() + status.slice(1).toLowerCase());

        const postDataEndpoints = {
            "Create Category": `${baseUrl}/api/categories`,
            "Create Class": `${baseUrl}/api/classes`,
            "Create Subject": `${baseUrl}/api/subjects`,
            "Create Chapter": `${baseUrl}/api/chapters`,
            "Create Question": `${baseUrl}/api/questions`,
            "Create Quiz": `${baseUrl}/api/quizzes/quiz`,
            "Create User": `${baseUrl}/api/auth/user`
        };

        if (!postDataEndpoints[dataTitle]) {
            console.error("Invalid data title:", dataTitle);
            toggleButtonState(false);
            return;
        };

        try {
            let payload = formData; // Default payload

            if (dataTitle === "Create Question") {
                const options = [];
                const questionData = {};

                // Organize data for "Create Question"
                for (let [key, value] of formData.entries()) {
                    if (key.startsWith("option_") && value.trim() !== "") {
                        options.push(value); // Collect options if they are not empty
                    } else {
                        questionData[key] = value;
                    };
                };

                if (options.length === 0) {
                    showNotification('error', 'Please provide at least one option for the question.')
                    toggleButtonState(false);
                    return; // Exit if no options are provided
                };

                // Construct final JSON payload
                payload = {
                    categoryId: questionData.categoryId,
                    chapterId: questionData.chapterId,
                    question: questionData.question,
                    questionType: questionData.questionType,
                    options,
                    answer: questionData.answer,
                    status: questionData.status
                };
            };

            // Send request
            const response = await postData(postDataEndpoints[dataTitle], token, payload);
            if (response.success) {
                form.reset();
                showNotification('success', response.message);
            } else {
                console.error(`${dataTitle} creation failed:`, response.error || "Unknown error.");
            };
        } catch (error) {
            console.error("An error occurred:", error);
        } finally {
            toggleButtonState(false); // Reset button state
        };
    });
};
