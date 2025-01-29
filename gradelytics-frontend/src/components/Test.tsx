import React from 'react';

const Test:React.FC = () => {
  return (
    <div className="text-center bg-white p-8 rounded-lg shadow-lg">
    <h1 className="text-2xl font-bold mb-4">Guess Heads or Tails</h1>
    <div className="flex justify-center gap-4 mb-6">
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Heads
      </button>
      <button
        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
      >
        Tails
      </button>
    </div>
    <p id="guessMessage" className="text-lg font-semibold text-gray-700"></p>
  </div>
  );
}

export default Test;