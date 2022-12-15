// Get references to the form and input fields
const registrationForm = document.querySelector('#registration-form');
const usernameInput = document.querySelector('#usernameInput');
const passwordInput = document.querySelector('#passwordInput');
const firstNameInput = document.querySelector('#firstNameInput');
const lastNameInput = document.querySelector('#lastNameInput');
const collegeNameInput = document.querySelector('#collegeNameInput');

function validatePassword(password) {
	// Check if the password is empty or contains only whitespace
	if (!password || password.trim().length === 0) {
		return 'Password cannot be empty or contain only whitespace';
	}

	// Check if the password is at least 6 characters long
	if (password.length < 6) {
		return 'Password must be at least 6 characters long';
	}

	// Check if the password contains at least one uppercase character
	if (!/[A-Z]/.test(password)) {
		return 'Password must contain at least one uppercase character';
	}

	// Check if the password contains at least one number
	if (!/[0-9]/.test(password)) {
		return 'Password must contain at least one number';
	}

	// Check if the password contains at least one special character
	if (!/[^a-zA-Z0-9]/.test(password)) {
		return 'Password must contain at least one special character';
	}

	// If all checks pass, the password is valid
	return false;
}

function validateUserName(str) {
	// Check if the string is empty or contains only whitespace
	if (!str || str.trim().length === 0) {
		return 'Username cannot be empty or contain only whitespace';
	}

	// Check if the string is at least 4 characters long
	if (str.length < 4) {
		return 'Username must be at least 4 characters long';
	}

	// Check if the string contains only alphanumeric characters
	if (!/^[a-zA-Z0-9]+$/.test(str)) {
		return 'Username can only contain alphanumeric characters';
	}

	// If all checks pass, the string is valid
	return false;
}

// Function to validate the form input
function validateForm() {
	// check if the username is empty

	let e = validateUserName(usernameInput.value);
	if (e) {
		alert(e);
		return false;
	}

	// check if the password is empty
	e = validatePassword(passwordInput.value);
	if (e) {
		alert(e);
		return false;
	}

	// check if the first name is empty
	if (firstNameInput.value.trim() === '') {
		alert('Please enter your first name');
		return false;
	}

	// check if the last name is empty
	if (lastNameInput.value.trim() === '') {
		alert('Please enter your last name');
		return false;
	}

	// check if a college has been selected
	if (collegeNameInput.value.trim() === '') {
		alert('Please select your college');
		return false;
	}

	// If all the checks pass, allow the form to be submitted
	return true;
}

// Add an event listener to the form to validate the input when the form is submitted
registrationForm.addEventListener('submit', (event) => {
	// prevent the form from being submitted if the input is invalid
	if (!validateForm()) {
		event.preventDefault();
	}
});
