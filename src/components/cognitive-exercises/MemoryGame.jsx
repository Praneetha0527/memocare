import { useState, useEffect } from "react";
import React from "react";
import "./memorygame.css"; // Assuming you have a CSS file for styling
const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const symbols = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...symbols, ...symbols];
    // Shuffle cards
    const shuffled = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false }));

    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardClick = (id) => {
    // Don't allow flipping if already flipped or solved
    if (flipped.length === 2 || solved.includes(id) || flipped.includes(id))
      return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        setSolved([...solved, firstId, secondId]);
        setFlipped([]);

        // Check if game is complete
        if (solved.length + 2 === cards.length) {
          setGameComplete(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="memory-game">
     

      <div className="game-info">
        <span>Moves: {moves}</span>
        <button onClick={initializeGame} className="btn btn-primary">
          Restart Game
        </button>
      </div>

      {gameComplete && (
        <div className="game-complete">
          <h3>Congratulations! You completed the game in {moves} moves!</h3>
        </div>
      )}

      <div className="game-board">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${
              flipped.includes(card.id) || solved.includes(card.id)
                ? "flipped"
                : ""
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-front">{card.symbol}</div>
            <div className="card-back">?</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;
