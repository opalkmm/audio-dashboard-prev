import io from 'socket.io-client';

//const CONNECTION = "//URL when we have it set up in GCP";
const CONNECTION = "http://localhost:4000/";

const socket = io(CONNECTION, {
    transports: ["websocket", "polling"]
});

export { socket };