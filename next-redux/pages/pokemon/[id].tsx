import type { NextPage } from 'next';
import styles from '../../styles/Home.module.css';
import Pokemon from '../../component/Pokemon';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    return (
        <div className={styles.container}>
            {id
                ? (Array.isArray(id) ? id : id.split(',')).map((name, i) => <Pokemon key={name + i} name={name} />)
                : null}
        </div>
    );
};

export default Home;
