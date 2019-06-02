import React from 'react';

export const createStore = () => {
    const states = [];
    const stateHooks = {};
    const actions = [];
    const playbackState = {
        playbackTimeout: undefined,
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

export const StoreProvider = StoreContext.Provider
export const useStore = () => React.useContext(StoreContext)

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
        reactSetState(newState)
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
    }
    return [state, setState]
}

export const useEffect = (effect, watch) => {
    const store = useStore()
    React.useEffect(() => {
        if(!store.playbackState.playbackTimeout) {
            effect()
        }
    }, watch)
}
