// Step 1: HTML form for uploading an image

{
	/* <form action="/upload" method="post" enctype="multipart/form-data">
  <label for="image">Select an image to upload:</label><br>
  <input type="file" id="image" name="image"><br>
  <input type="submit" value="Upload Image">
</form> */
}

// Step 2: Node.js route for handling the uploaded image

const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), (req, res) => {
	// Step 3: Use mongoose to connect to the database and create the image model
	const mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost/mydatabase', {
		useNewUrlParser: true,
	});

	const imageSchema = new mongoose.Schema({
		data: Buffer,
	});

	const Image = mongoose.model('Image', imageSchema);

	// Step 4: Read the uploaded image file and convert it to a Buffer object
	const fs = require('fs');
	const imageBuffer = fs.readFileSync(req.file.path);

	// Step 5: Create a new image object and save it to the database
	const image = new Image({
		data: imageBuffer,
	});

	image
		.save()
		.then(() => {
			// If the save operation is successful, redirect the user to a page that displays the uploaded image
			res.redirect('/images/' + image._id);
		})
		.catch((err) => {
			// Handle any errors that occur during the save operation
			console.error(err);
			res.send('Error uploading image: ' + err);
		});
});
