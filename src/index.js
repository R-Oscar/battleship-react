import { render } from 'react-dom';
import React, { Component } from 'react';

import BoardGenerator from './BoardGenerator';
import Board from './Board';
import Modal from './Modal';

import shipController from './shipController';
import randomItem from 'random-item';

import { SHIP_CELL, HIT_CELL, MISS_CELL } from './constants';

class App extends Component {
  state = {
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

  componentDidMount() {
    this.newGame();
  }

  getRandomPoint(board, recommendationPool = []) {
    let point = null;

    if (recommendationPool.length > 0) {
      point = randomItem(recommendationPool);
    } else {
      point = [Math.floor(Math.random() * board.length), Math.floor(Math.random() * board.length)];
    }

    const [row, col] = point;

    console.log('generating random point', [row, col]);

    if (board[row][col].value === MISS_CELL || board[row][col].value === HIT_CELL) {
      return this.getRandomPoint(
        board,
        recommendationPool.length > 0 ? recommendationPool.filter(p => point !== p) : []
      );
    }

    return [row, col];
  }

  turn() {
    const { playerBoard, cpuRecommendationPool, lastCpuHit } = this.state;
    const { board } = playerBoard;

    const [row, col] = this.getRandomPoint(board, cpuRecommendationPool);

    console.info(
      `[CPU] Firing at point ${row}:${col}. ${(board[row][col].value === 1 && 'Hit!') || 'Miss.'}`
    );

    const stateCopy = board.slice();

    stateCopy[row][col].value = stateCopy[row][col].value === SHIP_CELL ? HIT_CELL : MISS_CELL;

    if (stateCopy[row][col].value === HIT_CELL) {
      let newFleet = null;
      const ship = shipController.getShipByPoint(playerBoard, [+row, +col]);
      if (ship.isDestroyed()) {
        ship.reveal();
        newFleet = playerBoard.fleet.filter(s => s !== ship.currentShip);
        if (newFleet.length === 0) {
          this.setState(() => ({ winner: 'Компьютер', modalVisible: true }));
        }
        this.setState(() => ({
          cpuRecommendationPool: []
        }));
      } else {
        if (cpuRecommendationPool.length === 0) {
          const poolBuffer = [];

          if (row - 1 !== -1) poolBuffer.push([row - 1, col]);
          if (col - 1 !== -1) poolBuffer.push([row, col - 1]);
          if (row + 1 !== stateCopy.length) poolBuffer.push([row + 1, col]);
          if (col + 1 !== stateCopy.length) poolBuffer.push([row, col + 1]);

          this.setState(() => ({
            cpuRecommendationPool: poolBuffer,
            lastCpuHit: [row, col]
          }));
        } else {
          if (lastCpuHit[0] === row) {
            this.setState(prevState => ({
              cpuRecommendationPool: [
                ...prevState.cpuRecommendationPool.filter(point => point[0] === row),
                [row, col + 1],
                [row, col - 1]
              ]
            }));
          } else if (lastCpuHit[1] === col) {
            this.setState(prevState => ({
              cpuRecommendationPool: [
                ...prevState.cpuRecommendationPool.filter(point => point[1] === col),
                [row + 1, col],
                [row - 1, col]
              ]
            }));
          }
        }
      }

      this.setState(
        prevState => ({
          playerBoard: { board: stateCopy, fleet: newFleet || prevState.playerBoard.fleet }
        }),
        () => {
          if (this.state.playerBoard.fleet.length !== 0) this.turn();
        }
      );
    } else {
      this.setState(prevState => ({
        playerBoard: { board: stateCopy, fleet: prevState.playerBoard.fleet }
      }));
    }
  }

  revealHandler = e => {
    const [row, col] = e.target.id ? e.target.id.split('-') : e.target.parentElement.id.split('-');

    const { cpuBoard } = this.state;
    const { board } = cpuBoard;

    if (board[row][col].value === HIT_CELL || board[row][col].value === MISS_CELL) return;

    const stateCopy = board.slice();

    stateCopy[row][col].hidden = false;
    stateCopy[row][col].value = stateCopy[row][col].value === 1 ? 2 : 3;

    if (stateCopy[row][col].value === HIT_CELL) {
      let newFleet = null;
      const ship = shipController.getShipByPoint(cpuBoard, [+row, +col]);
      if (ship.isDestroyed()) {
        ship.reveal();
        newFleet = cpuBoard.fleet.filter(s => s !== ship.currentShip);
        if (newFleet.length === 0) {
          this.setState(() => ({
            winner: 'Игрок',
            modalVisible: true
          }));
        }
      }
      this.setState(prevState => ({
        cpuBoard: {
          board: stateCopy,
          fleet: newFleet || prevState.cpuBoard.fleet
        },
        winner: newFleet && newFleet.length === 0 && 'Игрок'
      }));
    } else {
      this.setState(
        prevState => ({
          cpuBoard: {
            board: stateCopy,
            fleet: prevState.cpuBoard.fleet
          }
        }),
        () => this.turn()
      );
    }
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

  newGame() {
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
