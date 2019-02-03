import React from 'react';
import PropTypes from 'prop-types';

import { SHIP_CELL, HIT_CELL, MISS_CELL } from '../../utils/constants';
import './style.css';

export default function Cell({ id, value, hidden, reveal }) {
  let className = 'cell';

  if (!hidden && (value === SHIP_CELL || value === HIT_CELL)) className = 'cell ship';

  let AIElement;

  if (value === HIT_CELL && !hidden) {
    AIElement = <div className="on" />;
  } else if (value === MISS_CELL && !hidden) {
    AIElement = <div className="off" />;
  }

  return (
    <div id={id} onClick={reveal} className={className}>
      {AIElement}
    </div>
  );
}

Cell.propTypes = {
  id: PropTypes.string,
  value: PropTypes.number,
  hidden: PropTypes.bool,
  reveal: PropTypes.func
};
