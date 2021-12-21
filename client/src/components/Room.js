import React, {useState, useEffect} from "react";
import Game from "./Game";
import {useParams} from "react-router-dom";
import socket from "../services/socket";
import Header from "./Header";
import CenterInfo from "./CenterInfo";

const Room = () => {
  const {roomid} = useParams();
  //initialize socket state
  const [room] = useState(roomid);
  const [roomFull, setRoomFull] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    socket.emit("join", {room: room}, (error) => {
      if (error) setRoomFull(true);
    });

    //cleanup on component unmount
    return function cleanup() {
      socket.emit("quitRoom");
      socket.off();
    };
  }, [room]);

  useEffect(() => {
    socket.on("roomData", ({users}) => {
      setUsers(users);
    });

    socket.on("currentUserData", ({name}) => {
      setCurrentUser(name);
    });
  }, []);

  return !roomFull ? (
    <div
      className={`Game backgroundColorB`}
      style={{
        height: "100vh",
        width: "100vw",
      }}
    >
      {users.length < 2 ? (
        <>
          <Header roomCode={room} />
          {currentUser === "Player 2" ? (
            <CenterInfo msg='Player 1 has left the game' />
          ) : (
            <CenterInfo msg='Waiting for Player 2 to join' />
          )}
        </>
      ) : (
        <Game room={room} currentUser={currentUser} />
      )}
    </div>
  ) : (
    <CenterInfo msg='Room is full' />
  );
};

export default Room;
