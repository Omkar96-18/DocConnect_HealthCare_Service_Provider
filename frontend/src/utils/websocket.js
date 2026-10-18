export class ChatWebSocket {
  constructor(conversationId, onMessage) {
    const token = localStorage.getItem('access_token');
    this.ws = new WebSocket(
      `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`
    );
    this.ws.onmessage = (e) => onMessage(JSON.parse(e.data));
    this.ws.onerror = (e) => console.error('WS Error', e);
    this.ws.onclose = () => console.log('WS closed');
  }

  send(content) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ content }));
    }
  }

  close() {
    this.ws.close();
  }
}
