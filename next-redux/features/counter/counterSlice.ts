import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
    name: 'counter',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: (state) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
    },
});
export const counterSliceTwo = createSlice({
    name: 'counterTwo',
    initialState: {
        value: 0,
    },
    reducers: {
        increment: (state) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
const increment = counterSlice.actions.increment;
const decrement = counterSlice.actions.increment;
const incrementByAmount = counterSlice.actions.incrementByAmount;
const incrementTwo = counterSliceTwo.actions.increment;
const decrementTwo = counterSliceTwo.actions.increment;
const incrementByAmountTwo = counterSliceTwo.actions.incrementByAmount;
const counterReducer = counterSlice.reducer;
const counterTwoReducer = counterSliceTwo.reducer;
export {
    increment,
    decrement,
    incrementByAmount,
    incrementTwo,
    decrementTwo,
    incrementByAmountTwo,
    counterReducer,
    counterTwoReducer,
};
// export const { increment, decrement, incrementByAmount } = counterSlice.actions;
