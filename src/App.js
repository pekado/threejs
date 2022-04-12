import React, {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Stage1 from './pages/Stage-1';
import Stage2 from './pages/Stage-2';
import Home from './pages/Home';
import Form from './Form';
import {AppProvider} from './contexts/AppContext';

export default function App() {
  const [user, setUser] = useState({});
  const [isSoundOn, setIsSoundOn] = useState(true);
  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  return (
    <React.Fragment>
      <AppProvider>
        {!user.username && <Form setUser={setUser} />}
        <button
          className='bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 absolute rounded m-6'
          onClick={() => setIsSoundOn(!isSoundOn)}
        >
          Sound is {isSoundOn ? 'On' : 'Off'}
        </button>
        <BrowserRouter>
          <Routes>
            <Route path='' element={<Home />} />
            <Route path='stage1' element={<Stage1 isSoundOn={isSoundOn} />} />
            <Route path='stage2' element={<Stage2 />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </React.Fragment>
  );
}
