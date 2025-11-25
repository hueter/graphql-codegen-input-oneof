import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';
import './App.css';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

const SEARCH_QUERY = gql`
  query Search($filter: SearchFilterInput!) {
    search(filter: $filter) {
      id
      name
      category
    }
  }
`;

function SearchComponent() {
  const { loading, error, data } = useQuery(SEARCH_QUERY, {
    variables: {
      filter: { byCategory: 'Electronics' }
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Search Results (Electronics)</h2>
      <ul>
        {data.search.map((item: any) => (
          <li key={item.id}>
            {item.name} - {item.category}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>GraphQL @oneOf Demo</h1>
        <p>Backend: Rails with GraphQL Ruby (full @oneOf support)</p>
        <p>Issue: @oneOf directive lost during introspection</p>
        <SearchComponent />
      </div>
    </ApolloProvider>
  );
}

export default App;
