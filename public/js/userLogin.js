const loginForm = document.querySelector('#login-form');
const usernameInput = document.querySelector('#usernameInput');
const passwordInput = document.querySelector('#passwordInput');

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
		return 'String cannot be empty or contain only whitespace';
	}

	// Check if the string is at least 4 characters long
	if (str.length < 4) {
		return 'String must be at least 4 characters long';
	}

	// Check if the string contains only alphanumeric characters
	if (!/^[a-zA-Z0-9]+$/.test(str)) {
		return 'String can only contain alphanumeric characters';
	}

	// If all checks pass, the string is valid
	return false;
}

// Function to validate the form input
function validateForm() {
	// check if the username is empty

	let e = validateUserName(usernameInput.value);
	if (e) {
		alert(`Either the username or password is invalid`);
		return false;
	}

	// check if the password is empty
	e = validatePassword(passwordInput.value);
	if (e) {
		alert(`Either the username or password is invalid`);
		return false;
	}
	// If all the checks pass, allow the form to be submitted
	return true;
}

// Add an event listener to the form to validate the input when the form is submitted
loginForm.addEventListener('submit', (event) => {
	// prevent the form from being submitted if the input is invalid
	if (!validateForm()) {
		event.preventDefault();
	}
});
