import { render } from 'react-dom';
import React, { Component } from 'react';

import Board from './Board';
import Modal from './Modal';

import BoardGenerator from './utils/BoardGenerator';
import getRandomPoint from './utils/getRandomPoint';

import getUpdatedBoard, {
  shipHit,
  isWinner,
  getNewRecommendationPool,
  getCpuHitPoint
} from './utils/other';

import { HIT_CELL, MISS_CELL } from './utils/constants';

const initialState = {
  cpuBoard: {
    board: [],
    fleet: []
  },
  playerBoard: {
    board: [],
    fleet: []
  },
  cpuRecommendationPool: [],
  lastCpuHit: [],
  winner: '',
  modalVisible: false
};

class App extends Component {
  state = initialState;

  componentDidMount() {
    this.startGame();
  }

  cpuTurn() {
    const { playerBoard, cpuRecommendationPool, lastCpuHit } = this.state;
    const { board } = playerBoard;
    const [row, col] = getRandomPoint(board, cpuRecommendationPool);
    const isHit = shipHit(playerBoard, [row, col]);

    const updatedBoard = getUpdatedBoard(playerBoard, [row, col]);

    const updatedState = {
      playerBoard: {
        ...updatedBoard
      },
      ...isWinner(updatedBoard, 'Компьютер'),
      cpuRecommendationPool: getNewRecommendationPool(
        playerBoard,
        [row, col],
        cpuRecommendationPool,
        lastCpuHit
      ),
      lastCpuHit: getCpuHitPoint(playerBoard, [row, col], lastCpuHit)
    };

    this.setState(updatedState, () => isHit && this.cpuTurn());
  }

  revealHandler = e => {
    const [row, col] = e.target.id ? e.target.id.split('-') : e.target.parentElement.id.split('-');
    const { cpuBoard } = this.state;

    const cellValue = cpuBoard.board[row][col].value;

    const isHit = shipHit(cpuBoard, [+row, +col]);
    if (cellValue === HIT_CELL || cellValue === MISS_CELL) return;

    const updatedBoard = getUpdatedBoard(cpuBoard, [+row, +col]);
    const updatedState = {
      cpuBoard: { ...updatedBoard },
      ...isWinner(updatedBoard, 'Игрок')
    };

    this.setState(updatedState, () => !isHit && this.cpuTurn());
  };

  generateBoard(boardName, hidden) {
    let [board, fleet] = new BoardGenerator().generate();

    this.setState({
      [boardName]: {
        board: board.map((row, rowIndex) =>
          row.map((cell, cellIndex) => ({
            hidden,
            value: cell,
            id: `${rowIndex}-${cellIndex}`
          }))
        ),
        fleet
      }
    });
  }

  startGame() {
    this.generateBoard('cpuBoard', true);
    this.generateBoard('playerBoard', false);
  }

  render() {
    const { cpuBoard, playerBoard, modalVisible, winner } = this.state;
    return (
      <>
        <Modal
          visible={modalVisible}
          winner={winner}
          closeHandler={() => this.setState(() => ({ modalVisible: false }))}
          retryHandler={() => {
            this.setState(() => ({ modalVisible: false }));
            this.newGame();
          }}
        />
        <Board data={cpuBoard.board} reveal={this.revealHandler} />
        <Board data={playerBoard.board} />
      </>
    );
  }
}

render(<App />, document.querySelector('#root'));

if (module.hot) module.hot.accept();
