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
let token;

// Load sidebar, header, heading and footer
loadComponent('sidebar__', '/components/sidebar.html');
loadComponent('header__', '/components/header.html');
loadComponent('footer__', '/components/footer.html');
loadComponent('heading__', '/components/heading.html');
// loadComponent('deletePopup', '/components/popup.html');

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

// get token from cookie function
function getTokenFromCookie() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('admin_token='));

    if (tokenCookie) {
        return tokenCookie.split('=')[1]; // Extract the token value
    };
    window.location.href = 'http://127.0.0.1:5500/index.html';
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

// Function to load HTML components
function loadComponent(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => document.getElementById(id).innerHTML = data)
        .catch(err => console.error(`Error loading ${file}:`, err));
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
    // Select the container to hold user cards
    const container = document.getElementById('user_cards_container');
    // Clear existing content (optional)
    container.innerHTML = '';

    // Loop through users and create cards
    data.newUsers.forEach(user => {
        const cardHTML = `
          <div class="col-12 user_card_ d-flex justify-content-between align-items-center">
            <div class="image-div px-1">
              <img src="${user.imageUrl || 'https://via.placeholder.com/50'}" alt="user-img" />
            </div>
            <div class="title-div px-1">
              <h6>${user.fullName}</h6>
              <p>${user.email}</p>
            </div>
            <div class="date-div px-1">${new Date(user.createdAt).toISOString().split('T')[0]}</div>
          </div>
        `;

        // Append the card to the container
        container.insertAdjacentHTML('beforeend', cardHTML);
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

// call api
(async (baseUrl) => {
    try {
        // get data endpoints
        const getDataEndpoints = [
            { url: `${baseUrl}/api/dashboard/stats`, handler: loadDashboardCardData, id: "dashboard-card-container" },
            // { url: `${baseUrl}/api/dashboard/new-users`, handler: loadNewUsersData, id: "user_cards_container" },
            { url: `${baseUrl}/api/categories`, handler: loadCategoryData, id: "categoryContainer" },
            { url: `${baseUrl}/api/classes`, handler: loadClassData, id: "classTable" },
            { url: `${baseUrl}/api/subjects`, handler: loadSubjectData, id: "subjectContainer" },
            { url: `${baseUrl}/api/chapters`, handler: loadChapterData, id: "chapterContainer" },
            { url: `${baseUrl}/api/questions`, handler: loadQuestionData, id: "questionTableBody" },
            { url: `${baseUrl}/api/quizzes`, handler: loadQuizData, id: "quizContainer" },
            { url: `${baseUrl}/api/auth/users`, handler: loadUserData, id: "userTableBody" },
            { url: `${baseUrl}/api/reports`, handler: loadReportData, id: "reportTableBody" }
        ];

        // get data endpoints
        for (const { url, handler, id } of getDataEndpoints) {
            if (document.getElementById(id)) {
                const data = await fetchData(url, token);
                handler(data);
            };
        };

    } catch (error) {
        console.error("Error fetching data:", error);
    };
})(baseUrl);

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
                alert("Please provide at least one option for the question.");
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
        console.log(`${dataTitle} Response:`, response);

        if (response.success) {
            console.log(`${dataTitle} created successfully.`);
            form.reset();
            alert(response.message);
        } else {
            console.error(`${dataTitle} creation failed:`, response.error || "Unknown error.");
            alert(response.error || response.message || "Unknown error.");
        };
    } catch (error) {
        console.error("An error occurred:", error);
        alert(error.message);
    } finally {
        toggleButtonState(false); // Reset button state
    };
});

// chnage active state on a tag of sidebar
document.querySelectorAll('.sidebar-container a').forEach(function (div) {
    div.addEventListener('click', function () {
        // Remove the active class from all divs
        document.querySelectorAll('.sidebar-container a').forEach(function (item) {
            item.classList.remove('active');
        });
        // Add the active class to the clicked div
        div.classList.add('active');
    });
});

// Close the popup when Cancel is clicked
document.getElementById("cancelDelete").addEventListener("click", function () {
    document.getElementById("deletePopup").style.display = "none";
});

// Close the popup and confirm delete when Confirm is clicked
document.getElementById("confirmDelete").addEventListener("click", function () {
    // Add your delete logic here (e.g., delete the item)
    alert("Item deleted!");
    document.getElementById("deletePopup").style.display = "none";
});
