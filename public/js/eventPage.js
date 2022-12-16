function doComment(form) {
	event.preventDefault();
	if (form.comment.value.trim() == '') return false;
	$.ajax({
		url: form.postCommentLink.value,
		method: 'POST',
		data: { comment: form.comment.value.trim() },
		success: function (response) {
			let comment = response;
			alert('Comment Posted Successfully');
		},
	});

	return false;
}
