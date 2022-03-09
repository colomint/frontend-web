import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import App from "./App";

import { DAppProvider, Rinkeby } from "@usedapp/core"
import "./index.css";

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

const subgraphUri = "http://localhost:8000/subgraphs/name/scaffold-eth/your-contract";

const client = new ApolloClient({
  uri: subgraphUri,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "light"}>
      <BrowserRouter>
        <DAppProvider config={{
          networks: [Rinkeby],
          notifications: {
            expirationPeriod: 1000,
            checkInterval: 1000
          }
        }}>
          <App subgraphUri={subgraphUri} />
        </DAppProvider>

      </BrowserRouter>
    </ThemeSwitcherProvider>
  </ApolloProvider>,
  document.getElementById("root"),
);
