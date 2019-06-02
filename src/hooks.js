import React from 'react';

export const createStore = () => {
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
        actions.push({
            id,
            newState,
            timeStamp: Date.now()
        })
        reactSetState(newState)
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
