import React from 'react'; // eslint-disable-line

let requestStateContext;

export function getRequestStateContext() {
  if (requestStateContext) return requestStateContext;

  requestStateContext = React.createContext({});

  return requestStateContext;
}
