import { SHIP_CELL, HIT_CELL, MISS_CELL } from './constants';
import shipController from './shipController';

export default function getUpdatedBoard(boardObject, [row, col]) {
  const { board, fleet } = boardObject;
  let newFleet = fleet.slice(),
    newBoard = board.slice();
  const targetCell = newBoard[row][col];
  targetCell.value = getCellValueAfterHit(targetCell);
  targetCell.hidden = false;

  const ship = shipController.getShipByPoint(boardObject, [row, col]);

  if (ship) {
    if (ship.isDestroyed()) {
      newBoard = ship.reveal();
      newFleet = getUpdatedFleetAfterShipDestroyed(fleet, ship.currentShip);
      return { board: newBoard, fleet: newFleet };
    }
  }

  newBoard = board.slice();

  return { board: newBoard, fleet: newFleet };
}

export function isWinner({ fleet }, winner) {
  if (isGameOver(fleet)) {
    return {
      winner,
      modalVisible: true
    };
  }
  return { winner: '' };
}

export function getNewRecommendationPool(boardObject, cell, oldPool, lastCpuHit) {
  const [row, col] = cell;
  const ship = shipController.getShipByPoint(boardObject, [row, col]);

  if (!ship && oldPool.length === 0) return [];
  else if (!ship && oldPool.length > 0) {
    return oldPool.filter(point => cell);
  }
  if (ship) if (ship.isDestroyed()) return [];

  const { board } = boardObject;
  const poolRaw = formNewRecommendationPool(oldPool, [row, col], lastCpuHit);
  return poolRaw.filter(
    point =>
      point[0] >= 0 && point[1] >= 0 && point[0] <= board.length - 1 && point[1] <= board.length - 1
  );
}

export function getCpuHitPoint({ board }, [row, col], lastCpuHit) {
  if (board[row][col].value === HIT_CELL) return [row, col];
  return lastCpuHit;
}

export function shipHit({ board }, [row, col]) {
  return board[row][col].value === SHIP_CELL;
}

export function getUpdatedFleetAfterShipDestroyed(initialFleet, ship) {
  return initialFleet.filter(s => s !== ship);
}

export function isGameOver(fleet) {
  return fleet.length === 0;
}

export function formNewRecommendationPool(oldPool, cell, lastCpuHit) {
  const [row, col] = cell;

  if (oldPool.length === 0) {
    return [[row - 1, col], [row, col - 1], [row + 1, col], [row, col + 1]];
  }

  if (pointsHorizontal(cell, lastCpuHit)) {
    return [...oldPool.filter(point => point[0] === row), [row, col + 1], [row, col - 1]];
  } else {
    return [...oldPool.filter(point => point[1] === col), [row + 1, col], [row - 1, col]];
  }
}

export function pointsHorizontal(cellA, cellB) {
  return cellA[0] === cellB[0];
}

export function getCellValueAfterHit(cell) {
  return cell.value === SHIP_CELL ? HIT_CELL : MISS_CELL;
}
