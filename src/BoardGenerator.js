Array.prototype.choice = function() {
  return this[Math.floor(Math.random() * this.length)];
};

export default class BoardGenerator {
  constructor(n = 10) {
    this.size = n;
    this.board = Array(n)
      .fill()
      .map(el => Array(n).fill(0));
    this.ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    this.fleet = [];
  }

  generate() {
    const shipsCopy = this.ships.slice();

    while (shipsCopy.length > 0) {
      const ship = new Ship(shipsCopy[0]);
      try {
        this.place(ship);
        shipsCopy.shift();
      } catch (e) {
        continue;
      }
    }

    this.board = this.board.map(row => row.map(cell => (cell === 2 ? 0 : cell)));
    return [this.board, this.fleet];
  }

  place(ship, point) {
    const boardCopy = this.board.map(row => row.slice());

    point = point || [
      Math.floor(Math.random() * (this.size - ship.height + 3)),
      Math.floor(Math.random() * (this.size - ship.width + 3))
    ];

    let [row, col] = [point[0] - 1, point[1] - 1];

    if (row === -1) {
      ship.trimRow();
      row = 0;
    }

    if (col === -1) {
      ship.trimCol();
      col = 0;
    }

    if (row + ship.height - 1 === this.size) {
      ship.trimRow(false);
    }

    if (col + ship.width - 1 === this.size) {
      ship.trimCol(false);
    }

    if (row + ship.height > this.size || col + ship.width > this.size)
      throw new Error("out of game's board");

    for (let i = row; i < row + ship.height; i++) {
      for (let j = col; j < col + ship.width; j++) {
        if (boardCopy[i][j] === 1) throw new Error('collision!');
        else boardCopy[i][j] = ship.get(i - row)[j - col];
      }
    }

    this.fleet.push(ship.toObject([row, col]));

    this.board = boardCopy;
  }
}

class Ship {
  constructor(n, horizontal = Math.random() >= 0.5) {
    this._ship = Array(horizontal ? 3 : n + 2)
      .fill()
      .map(el => Array(horizontal ? n + 2 : 3).fill(2));

    if (horizontal) {
      for (let i = 1; i <= n; i++) {
        this.ship[1][i] = 1;
      }
    } else {
      for (let i = 1; i <= n; i++) {
        this.ship[i][1] = 1;
      }
    }
  }

  get ship() {
    return this._ship;
  }

  set ship(ship) {
    this._ship = ship;
  }

  get length() {
    return this.ship.length;
  }

  get width() {
    return this.ship[0].length;
  }

  get height() {
    return this.length;
  }

  get(n) {
    return this.ship[n];
  }

  trimCol(first = true) {
    this._ship = this.ship.map(row =>
      row.filter((cell, index) => index !== (first ? 0 : row.length - 1))
    );
  }

  trimRow(first = true) {
    this._ship = this.ship.filter((row, index) => index !== (first ? 0 : this.ship.length - 1));
  }

  toObject([row, col]) {
    const coords = [];
    const halo = [];

    this._ship.forEach((r, rIndex) => {
      r.forEach((c, cIndex) => {
        if (c === 1) coords.push([rIndex + row, cIndex + col]);
        if (c === 2) halo.push([rIndex + row, cIndex + col]);
      });
    });

    return {
      coords,
      halo
    };
  }
}
