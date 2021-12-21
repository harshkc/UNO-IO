import io from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_API_URL;

const connectionOptions = {
  forceNew: true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};
const socket = io.connect(ENDPOINT, connectionOptions);

export default socket;
