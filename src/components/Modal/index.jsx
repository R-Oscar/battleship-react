import React from 'react';

import PropTypes from 'prop-types';
import './style.css';

export default function Modal({ visible, winner, retryHandler, closeHandler }) {
  return (
    <>
      {visible && (
        <div className="overlay">
          <div className="modal">
            Игра окончена! Победитель: {winner}
            <div className="button-container">
              <button className="modal__button" onClick={retryHandler}>
                Сыграть заново
              </button>
              <button className="modal__button" onClick={closeHandler}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Modal.propTypes = {
  visible: PropTypes.bool,
  winner: PropTypes.string,
  retryHandler: PropTypes.func,
  closeHandler: PropTypes.func
};
