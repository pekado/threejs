import React, { createContext, useReducer, useEffect } from 'react';
import { AppReducer } from "../reducers/AppReducer";
import { GUI } from 'dat.gui';
import Player from '../objects/Player';
import Camera from '../objects/Camera';

const initialState = {
  player: new Player(), // character
  camera: new Camera(),
  gui: new GUI()
}

export const AppStateContext = createContext({ state: initialState });
export const AppDispatchContext = createContext({ dispatch: () => { } });

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state }}>
      <AppDispatchContext.Provider value={{ dispatch }}> 
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}