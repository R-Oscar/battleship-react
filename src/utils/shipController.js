/**
 * Контроллер для управления кораблем в рамках игрового поля
 */
export default {
  currentShip: null,
  board: null,

  /**
   * Устанавливает в свойство currentShip массив с данными о корабле и его ареале
   * и возвращает this
   * @param {Object} board
   * @param {Cell} cell
   * @returns {Object}
   */
  getShipByPoint(board, cell) {
    this.board = board;
    const { fleet } = this.board;

    this.currentShip = fleet.filter(({ coords }) => {
      for (const p of coords) {
        if (p[0] === cell[0] && p[1] === cell[1]) return true;
      }
    })[0];

    if (!this.currentShip) return false;

    return this;
  },

  /**
   * Проверяет, уничтожен ли корабль
   * @returns {Boolean}
   */
  isDestroyed() {
    const { board } = this.board;

    if (this.currentShip) {
      return this.currentShip.coords.every(([row, col]) => board[row][col].value === 2);
    }
  },

  /**
   * Отображает корабль и возвращает игровое поле
   * @returns {Object}
   */
  reveal() {
    const board = this.board.board.slice();
    for (const [row, col] of this.currentShip.halo) {
      board[row][col].value = 3;
      board[row][col].hidden = false;
    }

    return board;
  }
};
