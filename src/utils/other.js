import randomItem from 'random-item';

import { SHIP_CELL, HIT_CELL, MISS_CELL } from './constants';
import shipController from './shipController';

/**
 * Принимает объект доски и клетку и возвращает обновленный объект доски
 * @param {Object} boardObject
 * @param {Array} cell
 * @returns {Object} Новый объект доски
 */
export function getUpdatedBoard(boardObject, [row, col]) {
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

  return { board: newBoard, fleet: newFleet };
}

/**
 * Принимает объект доски и потенциального победителя.
 * Если игрок победил, возвращает объект с его именем
 * Если нет, возвращает объект с пустой строкой в качестве значения winner
 * @param {Object} boardObject
 * @param {String} winner
 * @returns {Object} Объект с ключом winner
 */
export function isWinner({ fleet }, winner) {
  if (isGameOver(fleet)) {
    return {
      winner,
      modalVisible: true
    };
  }
  return { winner: '' };
}

/**
 * Принимает объект доски, клетку, прежний рекомендательный пул
 * и координаты последнего попадания компьютера. Возвращает
 * новый рекомендательный пул
 * @param {Object} boardObject
 * @param {Array} cell
 * @param {Array} oldPool
 * @param {Array} lastCpuHit
 * @returns {Array} Новый рекомендательный пул
 */
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

/**
 * Обновляет последнее попадание компьютера, если компьютер
 * повредил вражеский корабль. В противном случае возвращает
 * lastCpuHit.
 * @param {Object} boardObject
 * @param {Array} cell
 * @param {Array} lastCpuHit
 * @returns {Array} Последний меткий выстрел компьютера
 */
export function getCpuHitPoint({ board }, [row, col], lastCpuHit) {
  if (board[row][col].value === HIT_CELL) return [row, col];
  return lastCpuHit;
}

/**
 * Определяет, попал ли выстрел в точку cell в игровое поле
 * @param {Object} boardObject
 * @param {Array} cell
 * @returns {Boolean} Есть ли попадание
 */
export function isShipHit({ board }, [row, col]) {
  return board[row][col].value === SHIP_CELL;
}

/**
 * Удаляет уничтоженный корабль ship из исходного флота initialFleet
 * @param {Array} initialFleet
 * @param {Array} ship
 * @returns {Array} Обновленный флот
 */
export function getUpdatedFleetAfterShipDestroyed(initialFleet, ship) {
  return initialFleet.filter(s => s !== ship);
}

/**
 * Проверяет, окончилась ли игра для флота fleet
 * @param {Array} fleet
 * @returns {Boolean} Достигнут ли конец игры
 */
export function isGameOver(fleet) {
  return fleet.length === 0;
}

/**
 * Формирует новый рекомендательный пул, без ограничений на длину доски
 * @param {Array} oldPool прежний рекомендательный пул
 * @param {Array} cell клетка, для которой необходимо сформировать новый рекомендательный пул
 * @param {Array} lastCpuHit последний меткий выстрел компьютера
 * @returns {Array} Новый рекомендательный пул
 */
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

/**
 * Определяет, расположены ли клетки cellA и cellB горизонтально
 * @param {Array} cellA Клетка 1
 * @param {Array} cellB Клетка 2
 * @returns {Boolean} true если клетки формируют горизонтальную прямую, иначе false
 */
export function pointsHorizontal(cellA, cellB) {
  return cellA[0] === cellB[0];
}

/**
 * Получает значение клетки после выстрела в неё
 * @param {Array} cell
 * @returns {Number} 2 если попадание по кораблю, иначе 3
 */
export function getCellValueAfterHit(cell) {
  return cell.value === SHIP_CELL ? HIT_CELL : MISS_CELL;
}

/**
 * Возвращает случайную нетронутую точку на поле board
 * с учетом рекомендательного пула recommendationPool
 * @param {Object} board Поле боя
 * @param {Array} recommendationPool Рекомендательный пул. Пустой массив по умолчанию
 * @returns {Array} Случайная точка
 */
export function getRandomPoint(board, recommendationPool = []) {
  let point = null;

  if (recommendationPool.length > 0) {
    point = randomItem(recommendationPool);
  } else {
    point = [Math.floor(Math.random() * board.length), Math.floor(Math.random() * board.length)];
  }

  const [row, col] = point;

  if (board[row][col].value === MISS_CELL || board[row][col].value === HIT_CELL) {
    return getRandomPoint(
      board,
      recommendationPool.length > 0 ? recommendationPool.filter(p => point !== p) : []
    );
  }

  return [row, col];
}
