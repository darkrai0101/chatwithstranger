var uuid = require('node-uuid');
var rooms = [];
// rooms = [{id: '1698129', lang: 'vi'},{id : '1231', lang: 'en'}]
var connectCounter = 0;

module.exports = function(app,io){
	// Initialize a new socket.io application, named 'chat'
	app.get('/', function(req,res){

		// Render the chant.html view
		res.render('chat');
	});

	var chat = io.of('/socket').on('connection', function (socket) {

		
		// load khi connect den server
		// tra ve du lieu so nguoi online
		socket.on('load',function(data){
			connectCounter++;
			socket.emit('connectCounter', connectCounter);
			socket.broadcast.emit('connectCounter', connectCounter);
		});

		// nguoi dung login chuan bi chat
		socket.on('login', function(data) {
			// data = {lang : 'vi'}
			// duyet qua tat ca cac room xem room nao con trong?
			var lang = data.lang;
			var flag = 0;
			for(var i = 0;i < rooms.length; i++){
				console.log(rooms[i].id, rooms[i].lang, chat.clients(rooms[i].id).length);
				if(chat.clients(rooms[i].id).length < 2 && rooms[i].lang == lang){
					socket.join(rooms[i].id);

					socket.room = rooms[i].id;

					socket.emit('statusRoom', '1');
					socket.broadcast.to(socket.room).emit('statusRoom', '1');
					console.log('sau join ', chat.clients(rooms[i]).length);
					flag = 1;
					break;
				}
			}

			// neu khong con phong trong
			// tao phong moi
			if(!flag){
				// random id cho room
				var roomId = uuid.v4();
				var temp_room = {
					id  : roomId,
					lang: lang 
				};
				rooms.push(temp_room);
				socket.join(roomId);
				socket.room = rooms[i].id;

				socket.emit('statusRoom', '0');
			}
		});

		// co nguoi ngat ket noi
		socket.on('disconnect', function() {

			// thong bao ve client nguoi nay da roi khoi phong
			socket.broadcast.to(socket.room).emit('leave', '1');

			// leave the room
			socket.leave(socket.room);

			// kiem tra neu room co so luong nguoi = 0 thi xoa khoi mang
			if(chat.clients(socket.room).length < 1){
				for(var i = 0; i < rooms.length; i++){
					if(socket.room == rooms[i].id){
						rooms.splice(i, 1);
						break;
					}
				}
			}

			//giam so nguoi online di 1
			connectCounter--;

			socket.broadcast.to(socket.room).emit('statusRoom', '0');
			socket.broadcast.emit('connectCounter', connectCounter);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){
			console.log(data, socket.room);
			// nhan tin nhan va gui tin nhan den nhung nguoi khac trong room
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg});
		});
	});
};
