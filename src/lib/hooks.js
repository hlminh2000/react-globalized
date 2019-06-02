import React from 'react';


export const createStore = () => {
    const states = [];
    const stateHooks = {};
    const actions = [];
    const playbackState = {
        playbackTimeout: undefined,
        isPlayingEffect: false,
    }
    const stopPlayback = () => {
        clearTimeout(playbackState.playbackTimeout)
        playbackState.playbackTimeout = undefined
    }
    const playBack = (actionIndex = 0) => {
        stopPlayback()
        const action = actions[actionIndex]
        const {id, newState} = action
        stateHooks[id].reactSetState(newState)
        const nextAction = actions[actionIndex+1]
        if(nextAction) {
            playbackState.playbackTimeout = setTimeout(() => {
                playBack(actionIndex+1)
            }, nextAction.timeStamp - action.timeStamp + 10)
        } else {
            stopPlayback()
        }
    }
    return {
        states,
        stateHooks,
        actions,
        playbackState,
        playBack,
        stopPlayback
    }
}

const StoreContext = React.createContext(createStore())

export const useStateWithId = (id, initial) => {
    const store = useStore()
    const {
        states,
        stateHooks,
        actions,
        playbackState,
    } = store;
    const [state, reactSetState] = React.useState(initial)
    if(!id) {
        throw new Error('useStateWithId must be provided a state id ')
    }
    React.useEffect(() => {
        const isPlayingback = playbackState.playbackTimeout !== undefined
        if(stateHooks[id] && !isPlayingback) {
            throw new Error(`DUPLICATE ID: ${id}`)
        }
        stateHooks[id] = {state, reactSetState}
        if(!isPlayingback) {
            actions.push({
                id,
                newState: initial,
                timeStamp: Date.now()
            })
        }
        return () => delete stateHooks[id]
    }, [])
    const setState = (newState) => {
        if(!store.playbackState.isPlayingEffect) {
            actions.push({
                id,
                newState,
                timeStamp: Date.now()
            })
            states.push(
                Object.entries(stateHooks).map(
                    ([key, {state}]) => ({
                        id:key, 
                        state: key === id ? newState : state
                    })
                )
            )
            return reactSetState(newState)
        }
    }
    return [state, setState]
}

export const useReducerWithId = (id, reducer, initial, init) => {
    const [state, reactDispatch] = React.useReducer(reducer, initial)
    const store = useStore()
    const dispatch = (reducerAction) => {
        const newState = reducer(state, reducerAction)
        store.actions.push({
            id,
            newState,
            timeStamp: Date.now(),
            reducerAction
        })
        return reactDispatch(reducerAction)
    }
    return [state, dispatch]
}

export const useEffect = (effect, watch) => {
    const store = useStore()
    React.useEffect(() => {
        effect()
        if(store.playbackState.playbackTimeout) {
            store.playbackState.isPlayingEffect = true
        }
        return () => store.playbackState.isPlayingEffect = false
    }, watch)
}

export const StoreProvider = StoreContext.Provider
export const useStore = () => React.useContext(StoreContext)