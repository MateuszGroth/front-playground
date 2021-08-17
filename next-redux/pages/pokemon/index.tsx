import type { NextPage } from 'next';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';
import Pokemon from '../../component/Pokemon';

// export default PokemonTab;

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Pokemon name="bulbasaur" />
        </div>
    );
};

export default Home;
