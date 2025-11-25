import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import './App.css';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
  }),
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

interface SearchResult {
  id: string;
  name: string;
  category: string;
}

interface SearchData {
  search: SearchResult[];
}

function SearchComponent() {
  const { loading, error, data } = useQuery<SearchData>(SEARCH_QUERY, {
    variables: {
      filter: { byCategory: 'Electronics' }
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>Search Results (Electronics)</h2>
      <ul>
        {data.search.map((item) => (
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
