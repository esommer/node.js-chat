//HOSTNAME
window.onload = function () {
	
	var chats = document.getElementById("chats");
	var chatbox = document.getElementById("chatbox");
	var start = document.getElementById("start");
	var stop = document.getElementById("stop");
	var titleArea = document.getElementById("titlearea");
	var socket = {};
	var userName = "";
	var userID = "";
	
	var ReceivedMessage = function (message) {
		this.obj = JSON.parse(message);
		this.msgType = this.obj['msgType'];
		this.msgBody = this.obj['message'];
		this.from = this.obj['from'];
	}

	var sendMessage = function (messageType, messageText, name) {
		var msgObj = {
			'from' : userID ,
			'msgType' : messageType ,
			'message' : messageText
		}
		if (name) msgObj['name'] = name;
		var data = JSON.stringify(msgObj);
		socket.send(data);
	};

	var buildMsgLi = function (message) {
		var msg = new ReceivedMessage(message);
		var newli = document.createElement('li');
		var msgHTML = "";
		if (msg.from !== userName) {
			msgHTML = "<b>" + msg.from + ":</b> " + msg.msgBody;
		}
		else {
			msgHTML = msg.msgBody;
			newli.className = 'self';
		}
		if (msg.msgType == 'userStatus') {
			newli.className = 'status';
		}
		newli.innerHTML = msgHTML;
		return newli;
	};
	
	start.addEventListener('click', function (event) {
		
		// build socket
		socket = new WebSocket ("ws://emilys-macbook-pro.local:8300");
		socket.onopen = function () {
			userName = prompt("What's your name?");
			sendMessage('enter','opening connection', userName);
		};
		var newUser = 'new';
		
		// prepare to receive messages
		socket.onmessage = function (message) {
			if (newUser === 'new') {
				var msg = new ReceivedMessage (message.data);
				titleArea.innerHTML = msg.msgBody + userName + "!";
				newUser = 'old';
				chatbox.className = '';
				stop.className = '';
				start.className = 'hidden';
				chats.className = '';
			}
			else {
				var newli = buildMsgLi(message.data);
				chats.appendChild(newli);
				var scroll = chats.scrollTop + 50;
				chats.scrollTop = scroll;
			}
		}
	});	
	
	stop.addEventListener('click', function (event) {
		if (socket.readyState == 1) {
			socket.send("<<STOP>>");
			socket.close();
			stop.className = 'hidden';
			start.className = '';
		}
	});
	
	chatbox.addEventListener('focus', function (event) {
		chatbox.value = "";
	})
	
	chatbox.addEventListener('keydown', function (event) {
		if (event.keyCode == 13 && socket.readyState == 1) {
			sendMessage('text', chatbox.value);
			chatbox.value = "";
		}
	});
};