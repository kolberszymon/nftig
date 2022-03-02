import { NetworkType as TezosNetwork } from "@airgap/beacon-sdk";
import Web3 from "web3";
import {
  BlockchainWallet,
  FlowWallet,
  TezosWallet,
  EthereumWallet,
} from "@rarible/sdk-wallet";
import { Web3Ethereum } from "@rarible/web3-ethereum";
import {
  Connector,
  IConnectorStateProvider,
  ConnectionProvider,
  InjectedWeb3ConnectionProvider,
  AbstractConnectionProvider,
  EthereumProviderConnectionResult,
} from "@rarible/connector";
import {
  FclConnectionProvider,
  FlowProviderConnectionResult,
} from "@rarible/connector-fcl";
import { MEWConnectionProvider } from "@rarible/connector-mew";
import {
  BeaconConnectionProvider,
  TezosProviderConnectionResult,
} from "@rarible/connector-beacon";
import { TorusConnectionProvider } from "@rarible/connector-torus";
import { WalletLinkConnectionProvider } from "@rarible/connector-walletlink";
import { WalletConnectConnectionProvider } from "@rarible/connector-walletconnect";
import { Blockchain } from "@rarible/api-client";

// import { FortmaticConnectionProvider } from "@rarible/connector-fortmatic"
// import { PortisConnectionProvider } from "@rarible/connector-portis"

export type WalletAndAddress = {
  wallet: BlockchainWallet;
  address: string;
};

function mapEthereumWallet<O>(
  provider: AbstractConnectionProvider<O, EthereumProviderConnectionResult>
): ConnectionProvider<O, WalletAndAddress> {
  return provider.map((state) => ({
    wallet: new EthereumWallet(
      new Web3Ethereum({ web3: new Web3(state.provider), from: state.address }),
      Blockchain.ETHEREUM
    ),
    address: state.address,
  }));
}

function mapFlowWallet<O>(
  provider: AbstractConnectionProvider<O, FlowProviderConnectionResult>
): ConnectionProvider<O, WalletAndAddress> {
  return provider.map((state) => ({
    wallet: new FlowWallet(state.fcl),
    address: state.address,
  }));
}

const injected = mapEthereumWallet(new InjectedWeb3ConnectionProvider());

const fcl = mapFlowWallet(
  new FclConnectionProvider({
    accessNode: "https://access-testnet.onflow.org",
    walletDiscovery: "https://flow-wallet-testnet.blocto.app/authn",
    network: "testnet",
    applicationTitle: "Rari Test",
    applicationIcon: "https://rarible.com/favicon.png?2d8af2455958e7f0c812",
  })
);

const state: IConnectorStateProvider = {
  async getValue(): Promise<string | undefined> {
    return undefined;
  },
  async setValue(value: string | undefined): Promise<void> {},
};

export const connector = Connector.create(injected, state).add(fcl);
