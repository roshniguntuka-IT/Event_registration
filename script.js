const registrationForm = document.getElementById("registrationForm");

const participantTable = document.getElementById("participantTable");

const emptyState = document.getElementById("emptyState");

const participantCount = document.getElementById("participantCount");

const searchInput = document.getElementById("searchInput");

const availableSeats = document.getElementById("availableSeats");

const seatProgress = document.getElementById("seatProgress");

const successMessage = document.getElementById("successMessage");

const editModal = document.getElementById("editModal");

const editForm = document.getElementById("editForm");

const closeModal = document.getElementById("closeModal");

const TOTAL_SEATS = 200;

let registrations = JSON.parse(localStorage.getItem("eventRegistrations")) || [];

let editingId = null;

document.addEventListener("DOMContentLoaded", function () {
    renderParticipants();
    updateSeatInformation();
});

registrationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (registrations.length >= TOTAL_SEATS) {
        alert("Sorry, all seats are currently full.");
        return;
    }

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const city = document.getElementById("city").value.trim();

    const profession = document.getElementById("profession").value;

    const session = document.getElementById("session").value;

    const message = document.getElementById("message").value.trim();

    if (
        name === "" ||
        email === "" ||
        phone === "" ||
        city === "" ||
        profession === "" ||
        session === ""
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    const duplicateEmail = registrations.some(function (registration) {
        return registration.email.toLowerCase() === email.toLowerCase();
    });

    if (duplicateEmail) {
        alert("This email is already registered.");
        return;
    }

    const registration = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        city: city,
        profession: profession,
        session: session,
        message: message,
        registeredAt: new Date().toLocaleString()
    };

    registrations.push(registration);

    saveRegistrations();

    renderParticipants();

    updateSeatInformation();

    registrationForm.reset();

    successMessage.classList.add("show");

    setTimeout(function () {
        successMessage.classList.remove("show");
    }, 4000);

    document.getElementById("participants").scrollIntoView({
        behavior: "smooth"
    });
});

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function saveRegistrations() {
    localStorage.setItem(
        "eventRegistrations",
        JSON.stringify(registrations)
    );
}

function renderParticipants(searchTerm = "") {
    participantTable.innerHTML = "";

    const filteredRegistrations = registrations.filter(
        function (registration) {
            const searchableText = (
                registration.name +
                " " +
                registration.email +
                " " +
                registration.phone +
                " " +
                registration.profession +
                " " +
                registration.session
            ).toLowerCase();

            return searchableText.includes(
                searchTerm.toLowerCase()
            );
        }
    );

    if (filteredRegistrations.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    filteredRegistrations.forEach(
        function (registration, index) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${escapeHTML(registration.name)}</td>
                <td>${escapeHTML(registration.email)}</td>
                <td>${escapeHTML(registration.phone)}</td>
                <td>${escapeHTML(registration.profession)}</td>
                <td>${escapeHTML(registration.session)}</td>
                <td>
                    <div class="action-buttons">
                        <button
                            class="edit-button"
                            onclick="editRegistration(${registration.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-button"
                            onclick="deleteRegistration(${registration.id})"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            `;

            participantTable.appendChild(row);
        }
    );

    participantCount.textContent = registrations.length;
}

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

function updateSeatInformation() {
    const seatsLeft = TOTAL_SEATS - registrations.length;

    availableSeats.textContent = seatsLeft;

    const percentage = (
        registrations.length / TOTAL_SEATS
    ) * 100;

    seatProgress.style.width = percentage + "%";
}

searchInput.addEventListener("input", function () {
    renderParticipants(searchInput.value);
});

function deleteRegistration(id) {
    const registration = registrations.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!registration) {
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to delete the registration for " +
        registration.name +
        "?"
    );

    if (!confirmation) {
        return;
    }

    registrations = registrations.filter(
        function (item) {
            return item.id !== id;
        }
    );

    saveRegistrations();

    renderParticipants(searchInput.value);

    updateSeatInformation();
}

function editRegistration(id) {
    const registration = registrations.find(
        function (item) {
            return item.id === id;
        }
    );

    if (!registration) {
        return;
    }

    editingId = id;

    document.getElementById("editId").value = id;

    document.getElementById("editName").value = registration.name;

    document.getElementById("editEmail").value = registration.email;

    document.getElementById("editPhone").value = registration.phone;

    document.getElementById("editProfession").value =
        registration.profession;

    document.getElementById("editSession").value =
        registration.session;

    editModal.classList.remove("hidden");
}

editForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const registration = registrations.find(
        function (item) {
            return item.id === editingId;
        }
    );

    if (!registration) {
        return;
    }

    const name = document.getElementById("editName").value.trim();

    const email = document.getElementById("editEmail").value.trim();

    const phone = document.getElementById("editPhone").value.trim();

    const profession = document.getElementById("editProfession").value;

    const session = document.getElementById("editSession").value;

    if (
        name === "" ||
        email === "" ||
        phone === ""
    ) {
        alert("Please fill in all required fields.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    const duplicateEmail = registrations.some(
        function (item) {
            return (
                item.id !== editingId &&
                item.email.toLowerCase() === email.toLowerCase()
            );
        }
    );

    if (duplicateEmail) {
        alert("Another participant is already using this email.");
        return;
    }

    registration.name = name;

    registration.email = email;

    registration.phone = phone;

    registration.profession = profession;

    registration.session = session;

    saveRegistrations();

    renderParticipants(searchInput.value);

    closeEditModal();

    alert("Registration updated successfully.");
});

function closeEditModal() {
    editModal.classList.add("hidden");

    editingId = null;

    editForm.reset();
}

closeModal.addEventListener("click", closeEditModal);

editModal.addEventListener("click", function (event) {
    if (event.target === editModal) {
        closeEditModal();
    }
});

document.getElementById("phone").addEventListener(
    "input",
    function () {
        this.value = this.value.replace(/\D/g, "");
    }
);

document.getElementById("editPhone").addEventListener(
    "input",
    function () {
        this.value = this.value.replace(/\D/g, "");
    }
);