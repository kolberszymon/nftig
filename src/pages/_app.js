import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/index.css";
import { SdkWalletConnector } from "../sdk/sdk-wallet-connector";
import { connector } from "../sdk/connectors-setup";
import { SDKContext } from "../contexts/SDKContext";
import { createRaribleSdk } from "@rarible/sdk";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  return (
    <SdkWalletConnector connector={connector}>
      {(sdk, wallet, connection, buttons) => {
        return (
          <SDKContext.Provider
            value={{ sdk, wallet, connection, BUTTONS: buttons }}
          >
            <Component {...pageProps} />
          </SDKContext.Provider>
        );
      }}
    </SdkWalletConnector>
  );
}

export default MyApp;
