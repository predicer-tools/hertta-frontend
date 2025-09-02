// src/ApolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { GRAPHQL_ENDPOINT } from './graphql/queries';
import { setContext } from '@apollo/client/link/context';

// If authentication is required, you can set up headers here
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  // Retrieve the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine auth and http links
  cache: new InMemoryCache(),
});

export default client;
