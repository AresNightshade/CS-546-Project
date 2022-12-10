// Get references to the form and input fields
const createEventForm = document.querySelector('#createEvent-form');
const eventNameInput = document.querySelector('#eventNameInput');
const locationInput = document.querySelector('#locationInput');
const startTimeInput = document.querySelector('#startTimeInput');
const endTimeInput = document.querySelector('#endTimeInput');
const descriptionInput = document.querySelector('#descriptionInput');
const capacityInput = document.querySelector('#capacityInput');

// Function to validate the form input
function validateForm() {
	if (eventNameInput.value.trim() === '') {
		alert('Please enter Event Name');
		return false;
	}

	if (locationInput.value.trim() === '') {
		alert('Please enter the Location');
		return false;
	}

	if (startTimeInput.value.trim() === '') {
		alert('Please enter Start Time');
		return false;
	}

	if (endTimeInput.value.trim() === '') {
		alert('Please enter End Time');
		return false;
	}

	if (descriptionInput.value.trim() === '') {
		alert('Please enter the Description');
		return false;
	}

	let start = new Date(startTimeInput.value).getTime();
	let end = new Date(endTimeInput.value).getTime();
	let diff_ms = end - start;
	let diff_days = diff_ms / (24 * 60 * 60 * 1000);

	if (diff_days < 0) {
		alert(`Start time can't after End time`);
		return false;
	}
	if (diff_days > 1) {
		alert(`Event duration can't more than 24 hrs`);
		return false;
	}

	if (capacityInput.value.trim() === '') {
		alert('Please enter the capacity');
		return false;
	}
	// If all the checks pass, allow the form to be submitted
	return true;
}

// Add an event listener to the form to validate the input when the form is submitted
createEventForm.addEventListener('submit', (event) => {
	// prevent the form from being submitted if the input is invalid
	if (!validateForm()) {
		event.preventDefault();
	}
});
