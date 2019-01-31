import React from 'react';
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
