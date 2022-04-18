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
      
        <BrowserRouter>
          <Routes>
            <Route
              path=''
              element={
                <Home setIsSoundOn={setIsSoundOn} isSoundOn={isSoundOn} />
              }
            />
            <Route
              path='stage1'
              element={
                <Stage1 setIsSoundOn={setIsSoundOn} isSoundOn={isSoundOn} />
              }
            />
            <Route path='stage2' element={<Stage2 />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </React.Fragment>
  );
}
