import type { NextPage } from 'next';
import React from 'react';
import styles from '../styles/Home.module.css';

const counterContext = React.createContext({});
let count = 0;
const increase = () => count++;
const decrease = () => count--;
const CounterTwoPage: NextPage = () => {
    return (
        <div className={styles.container}>
            <counterContext.Provider value={{ getCounter: () => count, increase, decrease }}>
                <CounterWrap />
            </counterContext.Provider>
        </div>
    );
};

const CounterWrap = () => {
    console.log('idzie render w parencie');
    return <Counter />;
};

const Counter = () => {
    const context: any = React.useContext(counterContext);

    return (
        <>
            <button
                onClick={() => {
                    context.increase();
                    console.log(context.getCounter());
                }}
            >
                Increase
            </button>
            <button onClick={context.decrease}>Decrease</button>
            <span>{context.getCounter()}</span>
        </>
    );
};

export default CounterTwoPage;
