import { Rx, useRxOrThrow } from "@rixio/react";
import { useEffect, useMemo } from "react";
import { from } from "rxjs";
import { createRaribleSdk } from "@rarible/sdk";
import type { ConnectionState, IConnector } from "@rarible/connector";
import { IRaribleSdk } from "@rarible/sdk/build/domain";
import { Maybe } from "../common/maybe";
import { WalletAndAddress } from "./connectors-setup";

export type ConnectorComponentProps = {
  connector: IConnector<string, WalletAndAddress>;
  children: (sdk: IRaribleSdk, walletAddress: Maybe<string>) => JSX.Element;
};

export function SdkWalletConnector({
  connector,
  children,
}: ConnectorComponentProps) {
  const conn = useRxOrThrow(connector.connection);

  if (conn.status === "disconnected" || conn.status === "connecting") {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Options connector={connector} connectionState={conn} />
      </div>
    );
  } else if (conn.status === "initializing") {
    return <p>Initializing...</p>;
  } else {
    const sdk = createRaribleSdk(conn.connection.wallet, "staging");
    return (
      <div>
        {conn.disconnect && (
          <button onClick={conn.disconnect}>disconnect</button>
        )}
        {children(sdk, conn.connection.address)}
      </div>
    );
  }
}

interface OptionsProps<C> {
  connector: IConnector<string, C>;
  connectionState: ConnectionState<C>;
}

function Options<C>({ connector, connectionState }: OptionsProps<C>) {
  const options$ = useMemo(() => from(connector.getOptions()), [connector]);
  return (
    <Rx value$={options$}>
      {(options) => (
        <div>
          {options.map((o) => (
            <div key={o.option}>
              <button
                className="p-2 border-radius border-gray-200 border-2"
                onClick={() => connector.connect(o)}
              >
                Connect to {o.option}
              </button>
              {connectionState.status === "connecting" &&
              connectionState.providerId === o.provider.getId()
                ? "Connecting..."
                : null}
            </div>
          ))}
        </div>
      )}
    </Rx>
  );
}
