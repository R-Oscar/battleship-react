import { render } from 'react-dom';
import React, { useState, useEffect } from 'react';

import BoardGenerator from './BoardGenerator';
import Board from './Board';

export default function App() {
  const [playersTurn, setPlayersTurn] = useState(true);
  const [AIBoard, setAIBoard] = useState({ board: [], fleet: [] });
  const [playerBoard, setPlayerBoard] = useState({ board: [], fleet: [] });

  const togglePlayersTurn = () => {
    setPlayersTurn(!playersTurn);
  };

  const revealHandler = e => {
    const [row, col] = e.target.id ? e.target.id.split('-') : e.target.parentElement.id.split('-');

    const { board } = AIBoard;

    if (board[row][col].value === 2 || board[row][col].value === 3) return;

    const stateCopy = board.slice();

    stateCopy[row][col].hidden = false;
    stateCopy[row][col].value = stateCopy[row][col].value === 1 ? 2 : 3;

    if (stateCopy[row][col].value === 2) {
      const cellsToOpen = checkHalo(stateCopy, [+row, +col]);
      if (cellsToOpen) {
        console.log('we shold open it');
        revealHalo(stateCopy, cellsToOpen);
      }
    }

    setAIBoard({ board: stateCopy, fleet: AIBoard.fleet });

    togglePlayersTurn();

    AITurn();
  };

  const AITurn = recommendationPool => {
    let point = null;
    const { board } = playerBoard;
    if (!recommendationPool || recommendationPool.length === 0) {
      point = [Math.floor(Math.random() * board.length), Math.floor(Math.random() * board.length)];
    }

    const [row, col] = point;

    const stateCopy = board.slice();
    stateCopy[row][col].value = stateCopy[row][col].value === 1 ? 2 : 3;
    setPlayerBoard({ board: stateCopy, fleet: playerBoard.fleet });
  };

  const checkHalo = (board, point) => {
    console.log('checkHalo!');
    const res = [];
    const [row, col] = point;

    const halo = [
      {
        value: board[row - 1][col].value,
        row: row - 1,
        col
      },
      {
        value: board[row + 1][col].value,
        row: row + 1,
        col
      },
      {
        value: board[row][col - 1].value,
        row,
        col: col - 1
      },
      {
        value: board[row][col + 1].value,
        row,
        col: col + 1
      }
    ];

    for (const p of halo) {
      if (p.value === 2) {
        return [res, ...checkHalo(board, [p.row, p.col])];
      } else if (p.value === 1) {
        return false;
      } else if (p.value === 0) {
        res.push([p.row, p.col]);
      }
    }

    return res;
  };

  const revealHalo = (board, points) => {
    points.forEach(([row, col]) => {
      board[row][col].value = 3;
      board[row][col].hidden = false;
    });
  };

  useEffect(
    () => {
      if (AIBoard.board.length === 0) {
        const [board, fleet] = new BoardGenerator().generate();

        setAIBoard({
          board: board.map((row, rowIndex) =>
            row.map((cell, cellIndex) => {
              return {
                hidden: true,
                value: cell,
                id: `${rowIndex}-${cellIndex}`
              };
            })
          ),
          fleet
        });
      }
    },
    [AIBoard]
  );

  useEffect(
    () => {
      if (playerBoard.board.length === 0) {
        const [board, fleet] = new BoardGenerator().generate();

        setPlayerBoard({
          board: board.map((row, rowIndex) =>
            row.map((cell, cellIndex) => {
              return { hidden: false, value: cell, id: `${rowIndex}-${cellIndex}` };
            })
          ),
          fleet
        });
      }
    },
    [playerBoard]
  );

  console.log(AIBoard);

  return (
    <div>
      <Board data={AIBoard.board} reveal={revealHandler} />
      <Board data={playerBoard.board} />
    </div>
  );
}

render(<App />, document.querySelector('#root'));

if (module.hot) module.hot.accept();
