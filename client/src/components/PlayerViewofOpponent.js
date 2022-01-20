import React from "react";
import MemoizedSpinner from "./Spinner";

const PlayerViewofOpponent = ({opponentDeck, turn, opponent}) => {
  return (
    <div className={`${opponent === "Player 1" ? "player1" : "player2"}Deck`}>
      <p className='playerDeckText'>opponent</p>
      {opponentDeck.map((item, i) => (
        <img
          style={{pointerEvents: "none"}}
          key={item + i}
          alt={`opponent-cards-back`}
          className={`Card ${turn === opponent ? "glow" : ""}`}
          src={require(`../assets/card-back.png`).default}
        />
      ))}
      {turn === opponent ? <MemoizedSpinner /> : null}
    </div>
  );
};

export default PlayerViewofOpponent;
