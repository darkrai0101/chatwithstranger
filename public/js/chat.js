$(function(){
	var chatForm = $("#chatform"),
		textarea = $("#message"),
		contentChat = $("#content_chat"),
		online = $("#online"),
		statusRoom = $("#status_room"),
		chats = $("#chats");

	// connect to the socket
	var socket = io.connect('/socket');

	// on connection to server get the id of person's room
	socket.on('connect', function(){
		socket.emit('load', '1');
		socket.emit('login', '1');
	});

	// save the gravatar url
	socket.on('connectCounter', function(data){
		online.text(data);
		console.log('connect counter: ', data);
	});

	socket.on('statusRoom', function(data){
		if(data == 1){
			statusRoom.text('You can say "Hi!" to begin conversation. Be polite!');
		}else{
			statusRoom.text("you are alone, waiting...");
		}
	});

	socket.on('leave',function(data){

		chats.empty();

	});

	socket.on('receive', function(data){
			
		console.log('receive', data);
		createChatMessage(data.msg, 2);
	});

	textarea.keypress(function(e){

		// Submit the form on enter

		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		// Create a new chat message and display it directly

		
		console.log('send ',textarea.val());
		createChatMessage(textarea.val(), 1);
		// Send the message to the other person in the chat
		socket.emit('msg', {msg: textarea.val()});

		// Empty the textarea
		textarea.val("");
	});


	function createChatMessage(msg,user){

		var who = '';

		if(user===1) {
			who = 'bạn';
		}
		else {
			who = 'người lạ';
		}

		if(user === 1){
			var li = $(
			'<li class=line'+user+'>'+
				'<p><b></b>: ' +
				'<span></span></p>' +
			'</li>');
		}else{
			var li = $(
			'<li class=line'+user+'>'+
				'<p><b></b>: ' +
				'<span></span></p>' +
			'</li>');
		}
		

		// use the 'text' method to escape malicious user input
		li.find('span').text(msg);
		li.find('b').text(who);

		chats.append(li);

		contentChat.scrollTop(contentChat[0].scrollHeight);
	}	
});
