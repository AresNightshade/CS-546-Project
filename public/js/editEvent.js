// Get references to the form and input fields
const editEventForm = document.querySelector('#editEvent-form');
const eventNameInput = document.querySelector('#eventNameInput');
const locationInput = document.querySelector('#locationInput');
const startTimeInput = document.querySelector('#startTimeInput');
const endTimeInput = document.querySelector('#endTimeInput');
const descriptionInput = document.querySelector('#descriptionInput');
const capacityInput = document.querySelector('#capacityInput');

// Function to validate the form input
function validateForm() {
	if (eventNameInput.value) {
		if (eventNameInput.value.trim() === '') {
			alert('Please enter Event Name');
			return false;
		}
	}

	if (locationInput.value) {
		if (locationInput.value.trim() === '') {
			alert('Please enter the Location');
			return false;
		}
	}

	if (descriptionInput.value) {
		if (descriptionInput.value.trim() === '') {
			alert('Please enter the Description');
			return false;
		}
	}

	if (capacityInput.value) {
		if (capacityInput.value.trim() === '') {
			alert('Please enter the capacity');
			return false;
		}
	}
	// If all the checks pass, allow the form to be submitted
	return true;
}

// Add an event listener to the form to validate the input when the form is submitted
editEventForm.addEventListener('submit', (event) => {
	// prevent the form from being submitted if the input is invalid
	if (!validateForm()) {
		event.preventDefault();
	}
});
