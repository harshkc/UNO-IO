import React from "react";

const MainPlayerView = ({
  turn,
  playerDeck,
  onCardPlayedHandler,
  mainPlayer,
  isSkipButtonDisabled,
  onSkipButtonHandler,
}) => {
  return (
    <>
      <div className={`${mainPlayer === "Player 1" ? "player1" : "player2"}Deck`}>
        <p className='playerDeckText'>You</p>
        {playerDeck.map((item, i) => (
          <img
            style={turn !== mainPlayer ? {pointerEvents: "none"} : null}
            key={item + i}
            alt={`cards-front ${item}`}
            className={`Card ${turn === mainPlayer ? "glow" : ""}`}
            onClick={() => onCardPlayedHandler(item)}
            src={require(`../assets/cards-front/${item}.png`).default}
          />
        ))}
      </div>
      <div style={{display: "flex", justifyContent: "center"}}>
        <button
          className='game-button orange'
          disabled={isSkipButtonDisabled}
          onClick={onSkipButtonHandler}
          style={isSkipButtonDisabled ? {pointerEvents: "none"} : null}
        >
          Skip
        </button>
      </div>
    </>
  );
};

export default MainPlayerView;
