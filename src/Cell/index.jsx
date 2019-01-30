import React from 'react';

import './style.css';

export default function Cell({ id, value, hidden, reveal }) {
  let c = 'cell';

  if (!hidden && (value === 1 || value === 2)) c = 'cell ship';

  let AIElement;

  if (value === 2 && !hidden) {
    AIElement = <div className="on" />;
  } else if (value === 3 && !hidden) {
    AIElement = <div className="off" />;
  }

  return (
    <div id={id} onClickCapture={reveal} className={c}>
      {AIElement}
    </div>
  );
}
