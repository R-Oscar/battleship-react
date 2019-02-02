/** Класс для генерирования поля боя */
export default class BoardGenerator {
  /**
   * Создает доску размером n x n
   * @param {Number} n
   */
  constructor(n = 10) {
    this.size = n;
    this.board = Array(n)
      .fill()
      .map(el => Array(n).fill(0));
    this.ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    this.fleet = [];
  }

  generate() {
    /**
     * Метод генерирования
     * @returns {Object} Объект сгенерированной доски, состоящей из
     * массива координат всего игрового поля и массива с флотом
     */
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
    /**
     * Размещает корабль ship на точке point, где point - ареал корабля
     * в левой верхней точке. Выбрасывает ошибку, если размещение
     * невозможно (по причине коллизии с другим кораблем или
     * выхода за границы игрового поля)
     */
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
        else boardCopy[i][j] = ship.get()[i - row][j - col];
      }
    }

    this.fleet.push(ship.toObject([row, col]));

    this.board = boardCopy;
  }
}

/** Класс, соответствующий сущности корабля в модели данных */
class Ship {
  /**
   * Создает корабль длиной n и горизонтальной ориентацией isHorizontal
   * @param {Number} n
   * @param {Boolean} isHorizontal
   */
  constructor(n, isHorizontal = Math.random() >= 0.5) {
    this._ship = Array(isHorizontal ? 3 : n + 2)
      .fill()
      .map(el => Array(isHorizontal ? n + 2 : 3).fill(2));

    if (isHorizontal) {
      for (let i = 1; i <= n; i++) {
        this._ship[1][i] = 1;
      }
    } else {
      for (let i = 1; i <= n; i++) {
        this._ship[i][1] = 1;
      }
    }
  }

  /**
   * Возвращает корабль
   * @returns {Array} матрицу соответствующую положению корабля и его ареала на игровом поле
   */
  get() {
    return this._ship;
  }

  /**
   * Возвращает ширину корабля
   * @returns {Number}
   */
  get width() {
    return this._ship[0].length;
  }

  /**
   * Возвращает высоту корабля
   * @returns {Number}
   */
  get height() {
    return this._ship.length;
  }

  /**
   * Обрезает первый столбец корабля (его ареала), если first = true
   * иначе обрезает последний столбец
   * @param {Boolean} first
   */
  trimCol(first = true) {
    this._ship = this._ship.map(row =>
      row.filter((cell, index) => index !== (first ? 0 : row.length - 1))
    );
  }

  /**
   * Обрезает первую строку корабля (его ареала), если first = true
   * иначе обрезает последнюю строку
   * @param {Boolean} first
   */
  trimRow(first = true) {
    this._ship = this._ship.filter((row, index) => index !== (first ? 0 : this._ship.length - 1));
  }

  /**
   * Конвертирует корабль в объект, содержащий координаты непосредственно
   * самого корабля на игровом поле и его ареала с учетом клетки cell,
   * куда он поставлен
   * @param {Array} cell
   * @returns {Object} Объект со свойствами coords и halo
   */
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
