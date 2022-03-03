import { Rx, useRxOrThrow } from "@rixio/react";
import { useEffect, useMemo, useState } from "react";
import { from } from "rxjs";
import { createRaribleSdk } from "@rarible/sdk";
import type { ConnectionState, IConnector } from "@rarible/connector";
import { IRaribleSdk } from "@rarible/sdk/build/domain";
import { Maybe } from "../common/maybe";
import { WalletAndAddress } from "./connectors-setup";

export type ConnectorComponentProps = {
  connector: IConnector<string, WalletAndAddress>;
  children: (
    sdk: Maybe<IRaribleSdk>,
    walletAddress: Maybe<string>,
    connection: any,
    buttons: any
  ) => JSX.Element;
};

export function SdkWalletConnector({
  connector,
  children,
}: ConnectorComponentProps) {
  const [buttons, setButtons] = useState({
    Metamask: <div></div>,
    fcl: <div></div>,
  });
  // const [conn, setConn] = useState(connector.connection);
  const conn = useRxOrThrow(connector.connection);

  useEffect(() => {
    getButtons();
  }, []);

  const getButtons = async () => {
    let buttons = await createWalletButtons(connector);
    setButtons(buttons);
  };

  return <div>{children(null, null, conn, buttons)}</div>;
}

async function createWalletButtons(connector) {
  const options = await connector.getOptions();

  let Buttons = {
    Metamask: <div></div>,
    fcl: <div></div>,
  };

  options.forEach((obj) => {
    if (connector.connection.status === "connected") {
      Buttons[obj.option] = (
        <div className="p-2 border-radius border-gray-200 border-2">
          <button onClick={() => connector.connect(obj)} key={obj.option}>
            Connect to {obj.option}
          </button>
        </div>
      );
    } else {
      Buttons[obj.option] = (
        <div className="p-2 border-radius border-gray-200 border-2">
          <button
            onClick={() => connector.connection.disconnect()}
            key={obj.option}
          >
            Disconnect from {obj.option}
          </button>
        </div>
      );
    }
  });

  console.log(Buttons);

  // If we do it like that we'll be able to use it like buttons.Metamask oooh yeah

  return Buttons;
}
