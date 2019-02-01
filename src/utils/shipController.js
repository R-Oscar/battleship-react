export default {
  currentShip: null,
  board: null,

  getShipByPoint(board, point) {
    this.board = board;
    const { fleet } = this.board;

    this.currentShip = fleet.filter(({ coords }) => {
      for (const p of coords) {
        if (p[0] === point[0] && p[1] === point[1]) return true;
      }
    })[0];

    if (!this.currentShip) return false;

    return this;
  },

  isDestroyed() {
    const { board } = this.board;

    if (this.currentShip) {
      return this.currentShip.coords.every(([row, col]) => board[row][col].value === 2);
    }
  },

  reveal() {
    const board = this.board.board.slice();
    for (const [row, col] of this.currentShip.halo) {
      board[row][col].value = 3;
      board[row][col].hidden = false;
    }

    return board;
  }
};
