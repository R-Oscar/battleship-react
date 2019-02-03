import PropTypes from 'prop-types';

import React from 'react';
import Cell from '../Cell';
import './style.css';

export default function Board({ data, reveal }) {
  const cells = data.map(row =>
    row.map(({ hidden, value, id }, cellNum) => (
      <Cell key={id} id={id} value={value} hidden={hidden} reveal={reveal} />
    ))
  );

  return <div className="board">{cells}</div>;
}

Board.propTypes = {
  data: PropTypes.array,
  reveal: PropTypes.func
};
