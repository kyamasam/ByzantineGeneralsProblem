// Import net module.
var net = require('net');
var cs_status=0;
var is_traitor = 1;
var commands = new Array();
var other_nodes = [12346, 12347, 12348];
var sent_messages=0;
var node_clients=[12347];
var initial_message;
var replies =['attack', 'retreat'];

// Create and return a net Server object, the function will be invoked when client connect to this server.
var server = net.createServer(function(client) {

    console.log('Client connect. Client local address : ' + client.localAddress + ':' + client.localPort + '. client remote address : ' + client.remoteAddress + ':' + client.remotePort);
    //encoding
    client.setEncoding('utf-8');
    //set timeout
    client.setTimeout(1000);

    // When receive client data.
    client.on('data', function (data) {
        if(commands.length ===0 ){
            initial_message = String(data)
        }
        else{
            //do nothing

        }
        // console.log received client data and length.
        console.log('Data received : ' + data );

        //if this node is  not a traitor
         //add the message to the array of commands
        console.log("\nbefore append "+ commands);
        console.log("adding message to array of commands");

        console.log("\nafter append "+ commands);
        console.log("messages so far ", commands.length);


        if(commands.push(data)){
            console.log("successfully pushed element to array");
        }
        else{
            console.log("could not add "+data+"to array. it is still " + commands)
        }

        if (is_traitor === 1) {
            console.log("Message received is ",data);
            //select a random skill
            console.log("But I am a traitor, So I'll send "+replies[Math.floor(Math.random() * Math.floor(2))]);
            client.end(replies[Math.floor(Math.random() * Math.floor(2))]);
        }
        else
            {
                console.log("message received was", data);
                console.log("server returned, ", data);
                client.end(String(data));

            }


        //check if we have enough messages to look for consensus
        var consensus = commands.length / (other_nodes.length + 1);
        console.log("messages so far ", commands.length);
        if(consensus >= 0.66666) {
            console.log("We have enough messages for consensus to be reached ", consensus);
            console.log("my messages are as follows", commands);

            var mf = 1;
            var m = 0;
            var item;
            for (var i=0; i<commands.length; i++)
            {
                    for (var j=i; j<commands.length; j++)
                    {
                            if (commands[i] === commands[j])
                             m++;
                            if (mf<m)
                            {
                              mf=m;
                              item = commands[i];
                            }
                    }
                    m=0;
            }
            console.log(item+" ( " +mf +" times ) ") ;

            if (mf/(other_nodes.length ) >= 0.66666){
              console.log("Reached consensus: ", item)
            }
            else{
              console.log("Could not reach Consensus !!")
            }

        }
        else {
            console.log("continue listening, not enough messages for consensus ", commands);
            // console.log("wait for any other node to connect");
        }
    });

    // When client send data complete.
    client.on('end', function () {
        console.log('Client disconnect.');
        if(sent_messages < node_clients.length) {
            for(var i =0; i<node_clients.length;i++) {
                // Create a java client socket.
                console.log("create a connection with the other node js client")

                console.log("\n***************\n");
                var javaClient = getConn('Node ',node_clients[i]);
                //determine the message to send
                 if (is_traitor === 1) {
                    console.log("The command I received from commander is ",initial_message);
                    //select a random skill
                    console.log("But I am a traitor, So I'll send "+replies[Math.floor(Math.random() * Math.floor(2))]);
                    javaClient.write(replies[Math.floor(Math.random() * Math.floor(2))]);
                    commands.push(initial_message)
                }
                else
                    {
                        console.log("message received was", initial_message);
                        javaClient.write(initial_message);
                        //add the message back to the array of messages since the array has been reinitialized
                        commands.push(initial_message)
                    }

                sent_messages += 1;
            }

        }
        else{
            console.log("total messages sent")
        }

        // Get current connections count.
        server.getConnections(function (err, count) {
            if(!err)
            {
                // console.log current connection count in server console.
                console.log("There are %d connections now. ", count);
            }else
            {
                console.error(JSON.stringify(err));
            }

        });
    });

    // When client timeout.
    client.on('timeout', function () {
        console.log('Client request time out. ');
    })
});

// Make the server a TCP server listening on port 12348.
server.listen(12348, function () {

    // Get server address info.
    var serverInfo = server.address();

    var serverInfoJson = JSON.stringify(serverInfo);

    console.log('TCP server listen on address : ' + serverInfoJson);

    server.on('close', function () {
        console.log('TCP server socket is closed.');
    });

    server.on('error', function (error) {
        console.error(JSON.stringify(error));
    });

});

// This function create and return a net.Socket object to represent TCP client.
function getConn(connName,port_number ){

    var option = {
        host:'localhost',
        port: port_number
    }

    // Create TCP client.
    var client = net.createConnection(option, function () {
        console.log('Connection name : ' + connName);
        console.log('Connection local address : ' + client.localAddress + ":" + client.localPort);
        console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort);
    });

    client.setTimeout(1000);
    client.setEncoding('utf8');

    // When receive server send back data.
    client.on('data', function (data) {
        console.log('Server return data : ' + data);
    });

    // When connection disconnected.
    client.on('end',function () {
        console.log('Client socket disconnect. ');
    });

    client.on('timeout', function () {
        console.log('Client connection timeout. ');
    });

    client.on('error', function (err) {
        console.error(JSON.stringify(err));
    });

    return client;
}





