import { useState, useMemo } from 'react';
import { useGetPokemonByNameQuery } from '../services/pokemon';

const Pokemon = (props: any) => {
    // pokemon/bulbasaur,charmander,pikachu,bulbasaur
    const [isPolling, setIsPolling] = useState(true);
    const queryData = useMemo(() => {
        const obj: any = {};
        if (isPolling) {
            obj.pollingInterval = 3000;
        }
        return obj;
    }, [isPolling]);
    const { data, error, isLoading } = useGetPokemonByNameQuery(props.name, queryData);

    return (
        <>
            <button onClick={() => setIsPolling(!isPolling)}>test</button>
            {error ? (
                <>Oh no, there was an error</>
            ) : isLoading ? (
                <>Loading...</>
            ) : data ? (
                <>
                    <h3>{data.species.name}</h3>
                    <img src={data.sprites.front_shiny} alt={data.species.name} />
                </>
            ) : null}
        </>
    );
};

export default Pokemon;
