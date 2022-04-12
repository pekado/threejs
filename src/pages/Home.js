import React from 'react';
import {useNavigate} from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    <>
      <button
        className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded ml-6 mt-24'
        onClick={() => navigate('/stage1')}
      >
        Play
      </button>
    </>
  );
}

export default Home;
