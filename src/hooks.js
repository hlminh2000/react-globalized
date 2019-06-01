import React from 'react';

export const createStore = () => {
    const states = window.states = {};
    const actions = window.actions = [];
    const playbackState = window.playbackState = {
        playbackTimeout: undefined,
    }
    return {
        states,
        actions,
        playbackState,
    }
}

export const StoreContext = React.createContext(createStore())
export const useStore = () => React.useContext(StoreContext)

export const useStateWithId = ({initial, id}) => {
    const store = useStore()
    const {
        states,
        actions,
        playbackState,
    } = store;
    const [state, reactSetState] = React.useState(initial)
    if(!id) {
        throw new Error('useStateWithId must be provided a state id ')
    }
    React.useEffect(() => {
        states[id] = {state, reactSetState}
        if(playbackState.playbackTimeout === undefined) {
            actions.push({
                id,
                newState: initial,
                timeStamp: Date.now()
            })
        }
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

export const playBack = (store) => (actionIndex = 0) => {
    const {
        states,
        actions,
        playbackState,
    } = store;
    const action = actions[actionIndex]
    const {id, newState} = action
    states[id].reactSetState(newState)
    const nextAction = actions[actionIndex+1]
    if(nextAction) {
        playbackState.playbackTimeout = setTimeout(() => {
            playBack(store)(actionIndex+1)
        }, nextAction.timeStamp - action.timeStamp + 10)
    } else {
        stopPlayback(store)()
    }
}

export const stopPlayback = store => () => {
    const {playbackState} = store
    clearTimeout(playbackState.playbackTimeout)
    playbackState.playbackTimeout = undefined
}

window.playBack = playBack
