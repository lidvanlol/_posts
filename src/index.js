import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'


import './utils/index.scss'

// apollo loading
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'https://graphqlzero.almansi.me/api'
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>,
  document.getElementById('root')
)