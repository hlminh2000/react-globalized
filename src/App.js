import React from 'react';
import logo from './logo.svg';
import './App.css';
import withTreePath from './withTreePath'

import { useStateWithId, createStore, StoreProvider } from './hooks'

const Counter = withTreePath(({ treePath }) => {
  const [num, setNum] = useStateWithId(treePath, 0)
  const [text, settext] = useStateWithId(`${treePath}_text`, "")
  return (
    <>
      <p>
        {num}
      </p>
      <button
        onClick={() => setNum(num+1)}
      >
        Increment
      </button>
      <input value={text} onChange={(e) => settext(e.target.value)} />
    </>
  )
})

const DropDown = withTreePath(({ treePath }) => {
  const [expanded, setExpanded] = useStateWithId(treePath, false)
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>
        Toggle
      </button>
      {
        expanded && (
          <div>
            <Counter id="counter" />
          </div>
        )
      }
    </div>
  )
})

const App = withTreePath(() => {
  const store = window.store = createStore()
  return (
    <StoreProvider value={store}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Counter id="counter1"/>
          <Counter id="counter2"/>
          <DropDown id="myDropDown"/>
        </header>
      </div>
    </StoreProvider>
  )
})

export default App;
