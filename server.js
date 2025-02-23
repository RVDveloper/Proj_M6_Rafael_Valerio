

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let clients = [];

server.on('connection', socket => {
    console.log('Cliente conectado');
    clients.push(socket);

    socket.on('message', message => {
        console.log('Mensaje recibido:', message);

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        clients = clients.filter(client => client !== socket);
        console.log('Cliente desconectado');
    });
});

console.log('Servidor WebSocket en ejecución en ws://YourIP.local:8080'); 