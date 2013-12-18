var PORT = 8008;

var options = {
//    'log level': 0
};

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, options);
server.listen(PORT);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var players = [];
//var count_players = 0;
var bonuses = [];
var count_Bonuses = 0;
var temp_date = new Date();
var minutes = temp_date.getMinutes();
var delay = {
  m: minutes + getRandomArbitrary(1, 2),
  s: getRandomArbitrary(0, 50)
};


function update_player(message){
    var count_players = 0;
        for(var i = 0; i < players.length; i++){
            if(message.id == players[i].id){
                players[i].x = message.x;
                players[i].y = message.y;
            }
            else {
                count_players++;
            }
        }
        if(count_players == players.length){
            players.push(message);
        }
}

io.sockets.on('connection', function (client) {
  function spawn_bonus(){
    if(count_Bonuses >= 4)
        count_Bonuses = 0;
      var n_s_b = getRandomArbitrary(0, 3);
      var bonus = {
        number_Bonus: count_Bonuses,
        number_Spawn: n_s_b,
        type: getRandomArbitrary(1, 2)
      }
      bonuses[count_Bonuses] = bonus;
      count_Bonuses++;
      client.emit('add_bonus', bonuses[count_Bonuses-1]);
      temp_date = new Date();
      if(temp_date.getMinutes() >= 56)
        delay.m = '0' + getRandomArbitrary(1, 2);
      else
        delay.m = temp_date.getMinutes() + getRandomArbitrary(1, 2);
      delay.s = getRandomArbitrary(0, 50);

      //socket.emit("add_bonus", {x: bonus.x, y: bonus.y, width: bonus.width, height: bonus.height, type: bonus.type});
};

        for(var i = 0; i < bonuses.length; i++){
            client.emit('add_bonus', bonuses[i]);
        }

    client.on('message', function (message) {
      /*  try {
            //client.emit('message', message);
            client.broadcast.emit('message', message);
        } catch (e) {
            console.log(e);
            client.disconnect();
        }*/
        console.log(delay.m);
        console.log(delay.s);
        console.log(players.length);
        temp_date = new Date();
        if(temp_date.getMinutes() >= delay.m){
            if(temp_date.getMinutes() == delay.m){
                if(temp_date.getSeconds() >= delay.s)
                    spawn_bonus();
            }
            else { spawn_bonus();
                  client.emit('add_bonus', bonuses[count_Bonuses-1]);
                  }
        }
        update_player(message);
            client.emit('message', players);
    });


    client.on('shoot', function (message) {
        console.log("       ");
        client.broadcast.emit('shoot', message);
    });

    client.on('take_b', function (data){
        bonuses[data.n].type = 0;
    });

    client.on('kill', function (data){
        client.broadcast.emit('kill', data);
    });

    client.on('query_bonus', function (message){
      client.emit('array_bonus', bonuses);
        /*console.log(delay.m);
        console.log(delay.s);
        temp_date = new Date();
        if(temp_date.getMinutes() >= delay.m){
          if(temp_date.getSeconds() >= delay.s)
            spawn_bonus();
            //client.emit('add_bonus', bonuses[count_Bonuses-1]);
        }
        for(var i = 0; i < bonuses.length; i++){
            client.emit('add_bonus', bonuses[i]);
        }*/
    });
});
/*socket.on('disconnect', function() {
        client.broadcast.emit('disconnect_user', message);
 });*/
/*
$(function(){
 $(“#b1”).click(function(){
  x=$(“#t1”).val()
  $.get(“1.php”,{T:x},function(a){
  $(“#t2”).text(а)
  })
 })
})*/
