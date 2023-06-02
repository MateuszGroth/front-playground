import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      cacheTime: 0,
    },
  },
})

export default function Query(props: any) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.match ? (
        props.match.params.id.split(',').map((name: string, i: number) => <Pokemon key={'' + i} name={name} />)
      ) : (
        <Example />
      )}
    </QueryClientProvider>
  )
}

const getPokemon = (name: string) => () => fetch('https://pokeapi.co/api/v2/pokemon/' + name).then((res) => res.json())
const Pokemon = (props: { name: string }) => {
  const queryClient = useQueryClient()
  const { data, error, isLoading } = useQuery(['pokemon', props.name], getPokemon(props.name))
  return (
    <>
      <button
        onClick={() => {
          console.log('ile razy to idzie')
          queryClient.invalidateQueries(['pokemon', props.name])
        }}
      >
        Test
      </button>
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
  )
}
const Example = () => {
  const { isLoading, error, data }: { isLoading: boolean; error: any; data: any } = useQuery(['repoData'], () =>
    fetch('https://api.github.com/repos/tannerlinsley/react-query').then((res) => res.json())
  )

  if (isLoading) return <>Loading...</>

  if (error) return <>An error has occurred: {error.message}</>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong> <strong>✨ {data.stargazers_count}</strong>
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
