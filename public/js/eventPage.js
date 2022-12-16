function doComment(form) {
	event.preventDefault();
	if (form.comment.value.trim() == '') return false;
	$.ajax({
		url: form.postCommentLink.value,
		method: 'POST',
		data: { comment: form.comment.value.trim() },
		success: function (response) {
			let comment = response;
			$('#commentList').prepend(
				`<li><article>
				<h3>${comment.userName} commented on  ${comment.commentDate} </h3>
				<br>
				  ${comment.body}
				</article></li>`
			);
		},
	});

	return false;
}
