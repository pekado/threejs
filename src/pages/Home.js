import React from 'react';
import {useNavigate} from 'react-router-dom';

function Home({setIsSoundOn, isSoundOn}) {
  const navigate = useNavigate();
  return (
    <>
      <div>Home</div>
      <button
        className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded m-6'
        onClick={() => navigate('/stage1')}
      >
        Play
      </button>
    </>
  );
}

export default Home;
