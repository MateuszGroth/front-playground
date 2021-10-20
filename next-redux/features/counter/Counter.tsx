import { useSelector, useDispatch } from 'react-redux';
import { decrement, increment, incrementTwo, decrementTwo } from './counterSlice';
import { RootState } from '../../app/store';

export default function Counter() {
    const count = useSelector((state: RootState) => state?.counterTwo?.value);
    console.log('idzie render tez w parencie', count);
    return (
        <>
            <CounterOne />
            <CounterTwo />
        </>
    );
}
function CounterOne() {
    const count = useSelector((state: RootState) => state?.counter?.value);
    const dispatch = useDispatch();

    return (
        <div>
            <div>
                <button aria-label="Increment value" onClick={() => dispatch(increment())}>
                    Increment
                </button>
                <span>{count}</span>
                <button aria-label="Decrement value" onClick={() => dispatch(decrement())}>
                    Decrement
                </button>
            </div>
        </div>
    );
}
function CounterTwo() {
    const count = useSelector((state: RootState) => state?.counterTwo?.value);
    const dispatch = useDispatch();

    return (
        <div>
            <div>
                <button aria-label="Increment value" onClick={() => dispatch(incrementTwo())}>
                    Increment
                </button>
                <span>{count}</span>
                <button aria-label="Decrement value" onClick={() => dispatch(decrementTwo())}>
                    Decrement
                </button>
            </div>
        </div>
    );
}
