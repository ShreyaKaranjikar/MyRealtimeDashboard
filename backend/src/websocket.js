const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Store client connections

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth') {
                    this.authenticateClient(ws, data.token);
                }
            } catch (error) {
                ws.send(JSON.stringify({ error: 'Invalid message format' }));
            }
        });

        ws.on('close', () => {
            this.clients.delete(ws);
        });
    }

    authenticateClient(ws, token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            this.clients.set(ws, { userId: decoded.userId, role: decoded.role });
            ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
        } catch (error) {
            ws.send(JSON.stringify({ type: 'auth', status: 'error' }));
        }
    }

    // Broadcast updates based on user roles
    broadcastUpdate(data, requiredRole = null) {
        this.clients.forEach((client, ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                if (!requiredRole || client.role === requiredRole) {
                    ws.send(JSON.stringify(data));
                }
            }
        });
    }
}

module.exports = WebSocketServer;

