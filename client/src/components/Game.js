import React, {useEffect, useReducer} from "react";
import socket from "../services/socket";
import {PACK_OF_CARDS, ACTION_CARDS} from "../utils/packOfCards";
import shuffleArray from "../utils/shuffleArray";
import {useSoundProvider} from "../context/SoundProvider";

//NUMBER CODES FOR ACTION CARDS
//SKIP - 100
//DRAW 2 - 200
//WILD - 500
//DRAW 4 WILD - 400

const checkGameOver = (playerDeck) => {
  return playerDeck.length === 1;
};

const checkWinner = (playerDeck, player) => {
  return playerDeck.length === 1 ? player : "";
};

const initialGameState = {
  gameOver: true,
  winner: "",
  turn: "",
  player1Deck: [],
  player2Deck: [],
  currentColor: "",
  currentNumber: "",
  playedCardsPile: [],
  drawCardPile: [],
  isUnoButtonPressed: false,
  drawButtonPressed: false,
};

const gameReducer = (state, action) => ({...state, ...action});

const Game = ({room, currentUser}) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const {
    gameOver,
    winner,
    turn,
    player1Deck,
    player2Deck,
    currentColor,
    currentNumber,
    playedCardsPile,
    drawCardPile,
    isUnoButtonPressed,
    drawButtonPressed,
  } = gameState;

  //handles the sounds with our custom sound provider
  const {
    playUnoSound,
    playCardPlayedSound,
    playShufflingSound,
    playSkipCardSound,
    playDraw2CardSound,
    playWildCardSound,
    playDraw4CardSound,
    playGameOverSound,
  } = useSoundProvider();

  const playSoundMap = {
    100: playSkipCardSound,
    200: playDraw2CardSound,
    400: playDraw4CardSound,
    500: playWildCardSound,
  };

  //runs once on component mount
  useEffect(() => {
    //shuffle PACK_OF_CARDS array
    const shuffledCards = shuffleArray(PACK_OF_CARDS);

    //extract first 7 elements to player1Deck
    const player1Deck = shuffledCards.splice(0, 7);

    //extract first 7 elements to player2Deck
    const player2Deck = shuffledCards.splice(0, 7);

    //extract random card from shuffledCards and check if its not an action card
    //108-14=94
    let startingCardIndex = Math.floor(Math.random() * 94);

    while (ACTION_CARDS.includes(shuffledCards[startingCardIndex])) {
      startingCardIndex = Math.floor(Math.random() * 94);
    }

    //extract the card from that startingCardIndex into the playedCardsPile
    const playedCardsPile = shuffledCards.splice(startingCardIndex, 1);

    //store all remaining cards into drawCardPile
    const drawCardPile = [...shuffledCards];

    //send initial state to server
    socket.emit("initGameState", {
      gameOver: false,
      turn: "Player 1",
      player1Deck: player1Deck,
      player2Deck: player2Deck,
      currentColor: playedCardsPile[0].charAt(1),
      currentNumber: playedCardsPile[0].charAt(0),
      playedCardsPile: playedCardsPile,
      drawCardPile: drawCardPile,
    });
  }, []);

  useEffect(() => {
    socket.on(
      "initGameState",
      ({
        gameOver,
        turn,
        player1Deck,
        player2Deck,
        currentColor,
        currentNumber,
        playedCardsPile,
        drawCardPile,
      }) => {
        dispatch({type: "SET_GAME_OVER", gameOver});
        dispatch({type: "SET_TURN", turn});
        dispatch({type: "SET_PLAYER1_DECK", player1Deck});
        dispatch({type: "SET_PLAYER2_DECK", player2Deck});
        dispatch({type: "SET_CURRENT_COLOR", currentColor});
        dispatch({type: "SET_CURRENT_NUMBER", currentNumber});
        dispatch({type: "SET_PLAYED_CARDS_PILE", playedCardsPile});
        dispatch({type: "SET_DRAW_CARD_PILE", drawCardPile});
        playShufflingSound();
      }
    );

    socket.on(
      "updateGameState",
      ({
        gameOver,
        winner,
        turn,
        player1Deck,
        player2Deck,
        currentColor,
        currentNumber,
        playedCardsPile,
        drawCardPile,
        drawButtonPressed = false,
      }) => {
        gameOver && dispatch({type: "SET_GAME_OVER", gameOver});
        gameOver && playGameOverSound();
        winner && dispatch({type: "SET_WINNER", winner});
        //check for special card and play their sound else play regular sound
        currentNumber in playSoundMap ? playSoundMap[currentNumber]() : playCardPlayedSound();
        turn && dispatch({type: "SET_TURN", turn});
        player1Deck && dispatch({type: "SET_PLAYER1_DECK", player1Deck});
        player2Deck && dispatch({type: "SET_PLAYER2_DECK", player2Deck});
        currentColor && dispatch({type: "SET_CURRENT_COLOR", currentColor});
        currentNumber && dispatch({type: "SET_CURRENT_NUMBER", currentNumber});
        playedCardsPile && dispatch({type: "SET_PLAYED_CARDS_PILE", playedCardsPile});
        drawCardPile && dispatch({type: "SET_DRAW_CARD_PILE", drawCardPile});
        dispatch({type: "SET_UNO_BUTTON_PRESSED", isUnoButtonPressed: false});
        dispatch({type: "SET_DRAW_BUTTON_PRESSED", drawButtonPressed});
      }
    );
  }, []);

  //remove the played card from player's deck and add it to playedCardsPile (immutably)
  //then update turn, currentColor and currentNumber
  //also checks for the card played and update opponentDeck accordingly
  //also checks for UNO pressed if not add 2 cards to playerDeck as penalty
  //play the relevant sound when particular card is played
  //This is generic helper method and can be used for any player
  const cardPlayedByPlayer = ({
    cardPlayedBy,
    played_card,
    colorOfPlayedCard,
    numberOfPlayedCard,
    isDraw2 = false,
    isDraw4 = false,
    toggleTurn = true,
  }) => {
    //check who is the current player
    const playerDeck = cardPlayedBy === "Player 1" ? player1Deck : player2Deck;
    const opponentDeck = cardPlayedBy === "Player 1" ? player2Deck : player1Deck;

    //remove the played card from player's deck and add it to playedCardsPile and update their deck(immutably)
    const removeIndex = playerDeck.indexOf(played_card);
    const updatedPlayedCardsPile = [...playedCardsPile, played_card];
    let updatedPlayerDeck = [...playerDeck.slice(0, removeIndex), ...playerDeck.slice(removeIndex + 1)];

    //make a drawcardpile copy for managing draw2,draw4 and UNO penalty
    const copiedDrawCardPileArray = [...drawCardPile];
    let opponentDeckCopy = [...opponentDeck];
    // if it is a draw2 or draw4 move pop cards from drawCardPile
    // and add them to opponent's deck (immutably)
    if (isDraw2 || isDraw4) {
      opponentDeckCopy.push(copiedDrawCardPileArray.pop());
      opponentDeckCopy.push(copiedDrawCardPileArray.pop());
      if (isDraw4) {
        opponentDeckCopy.push(copiedDrawCardPileArray.pop());
        opponentDeckCopy.push(copiedDrawCardPileArray.pop());
      }
    }

    //if it is special card which persists turn like skip, draw4 card don't change the turn
    //else change turn after every play
    let turnCopy = cardPlayedBy;
    if (toggleTurn) {
      turnCopy = cardPlayedBy === "Player 1" ? "Player 2" : "Player 1";
    }

    //did player press UNO when 2 cards were remaining in their deck
    //if not then add 2 cards as penalty else continue
    if (playerDeck.length === 2 && !isUnoButtonPressed) {
      alert("Oops! You forgot to press UNO. You drew 2 cards as penalty.");
      //pull out last two cards from dracard pile and add them to player1's deck
      updatedPlayerDeck.push(copiedDrawCardPileArray.pop());
      updatedPlayerDeck.push(copiedDrawCardPileArray.pop());
    }

    //Atlast, send new state to server
    socket.emit("updateGameState", {
      gameOver: checkGameOver(playerDeck),
      winner: checkWinner(playerDeck, cardPlayedBy),
      turn: turnCopy,
      playedCardsPile: updatedPlayedCardsPile,
      player1Deck: cardPlayedBy === "Player 1" ? updatedPlayerDeck : opponentDeckCopy,
      player2Deck: cardPlayedBy === "Player 2" ? updatedPlayerDeck : opponentDeckCopy,
      currentColor: colorOfPlayedCard,
      currentNumber: numberOfPlayedCard,
      drawCardPile: copiedDrawCardPileArray,
    });
  };

  //driver functions
  const onCardPlayedHandler = (played_card) => {
    //extract player who played the card
    const cardPlayedBy = turn;
    switch (played_card) {
      //if card played was a skip card
      case "skipR":
      case "skipG":
      case "skipB":
      case "skipY": {
        //extract color of played skip card
        const colorOfPlayedCard = played_card.charAt(4);
        const numberOfPlayedCard = 100;
        //check for color match or number match
        if (currentColor === colorOfPlayedCard || currentNumber === numberOfPlayedCard) {
          cardPlayedByPlayer({
            cardPlayedBy,
            played_card,
            colorOfPlayedCard,
            numberOfPlayedCard,
            toggleTurn: false,
          });
        }
        //if no color or number match, invalid move - do not update state
        else {
          alert("Invalid Move!");
        }
        break;
      }
      //if card played was a draw 2 card
      case "D2R":
      case "D2G":
      case "D2B":
      case "D2Y": {
        //extract color of played skip card
        const colorOfPlayedCard = played_card.charAt(2);
        const numberOfPlayedCard = 200;
        //check for color match or number match
        if (currentColor === colorOfPlayedCard || currentNumber === numberOfPlayedCard) {
          cardPlayedByPlayer({
            cardPlayedBy,
            played_card,
            colorOfPlayedCard,
            numberOfPlayedCard,
            isDraw2: true,
            toggleTurn: false,
          });
        }
        //if no color or number match, invalid move - do not update state
        else {
          alert("Invalid Move!");
        }
        break;
      }
      //if card played was a wild card
      case "W": {
        //ask for new color
        const colorOfPlayedCard = prompt("Enter first letter of new color (r/g/b/y)")?.toUpperCase();
        if (!colorOfPlayedCard) return;

        cardPlayedByPlayer({cardPlayedBy, played_card, colorOfPlayedCard, numberOfPlayedCard: 500});
        break;
      }
      //if card played was a draw four wild card
      case "D4W": {
        //ask for new color
        const colorOfPlayedCard = prompt("Enter first letter of new color (r/g/b/y)")?.toUpperCase();
        if (!colorOfPlayedCard) return;
        cardPlayedByPlayer({
          cardPlayedBy,
          played_card,
          colorOfPlayedCard,
          numberOfPlayedCard: 400,
          isDraw4: true,
          toggleTurn: false,
        });
        break;
      }
      default: {
        //extract number and color of played card
        const numberOfPlayedCard = played_card.charAt(0);
        const colorOfPlayedCard = played_card.charAt(1);

        //check for color match or number match
        if (currentColor === colorOfPlayedCard || currentNumber === numberOfPlayedCard) {
          cardPlayedByPlayer({cardPlayedBy, played_card, colorOfPlayedCard, numberOfPlayedCard});
        }
        //if no color or number match, invalid move - do not update state
        else {
          alert("Invalid Move!");
        }
        break;
      }
    }
  };

  return <div className={`backgroundColor${currentColor}`}>GameScreen</div>;
};

export default Game;
