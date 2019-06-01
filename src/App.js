import React from 'react';
import logo from './logo.svg';
import './App.css';

import { useStateWithId, createStore, StoreContext } from './hooks'

const Counter = ({ id }) => {
  const [num, setNum] = useStateWithId({id: id, initial: 0})
  return (
    <>
      <p>
        {num}
      </p>
      <button
        className="App-link"
        onClick={() => setNum(num+1)}
      >
        Increment
      </button>
    </>
  ) 
}

const DropDown = ({id}) => {
  const [expanded, setExpanded] = useStateWithId({id, initial: false})
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>
        Toggle
      </button>
      {
        expanded && (
          <div>
            <Counter id={`${id}/counter`} />
          </div>
        )
      }
    </div>
  )
}

const App = () => {
  const store = window.store = createStore()
  return (
    <StoreContext.Provider value={store}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Counter id={"counter1"}/>
          <Counter id={"counter2"}/>
          <DropDown id={"myDropDown"}/>
        </header>
      </div>
    </StoreContext.Provider>
  )
}

export default App;
