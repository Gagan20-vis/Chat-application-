require('dotenv').config();
const mongoose = require('mongoose');
const app = require("express")();
const http = require("http").Server(app);
const User = require('./models/userModel');
const userRoute = require('./routes/userRoute');
const io = require('socket.io')(http);
app.use('/',userRoute);

mongoose.connect('mongodb://127.0.0.1:27017/dynamic-chat-app');

var usp = io.of('/user-namespace');

usp.on('connection',async function(socket){
    console.log('User Connected');

    var userId = socket.handshake.auth.token;

    await User.findByIdAndUpdate({_id: userId},{$set:{is_online:"1"}});

    //broadcasting that user is online 
    socket.broadcast.emit('getOnlineUser',{user_id:userId});

    socket.on('disconnect', async   function(){
        console.log('user Disconnected');

        var userId = socket.handshake.auth.token;
        await User.findByIdAndUpdate({_id: userId},{$set:{is_online:"0"}});

        //broadcasting that user is offline 
        socket.broadcast.emit('getOfflineUser',{user_id:userId});
    });
});

http.listen(5000, (err) => {
    console.log("Server Started");
})
