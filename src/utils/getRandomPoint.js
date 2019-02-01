import randomItem from 'random-item';
import { MISS_CELL, HIT_CELL } from './constants';

/**
 * Возвращает случайную нетронутую точку на поле board
 * с учетом рекомендательного пула recommendationPool
 * @param {Object} board Поле боя
 * @param {Array} recommendationPool Рекомендательный пул. Пустой массив по умолчанию
 * @returns {Array} Случайная точка
 */
export default function getRandomPoint(board, recommendationPool = []) {
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
