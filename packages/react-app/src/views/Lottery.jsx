import { Button } from "antd";
import React, { useState } from "react";
// import { utils } from "ethers";
// import { SyncOutlined } from "@ant-design/icons";

// import { Address, Balance, Events } from "../components";

export default function Lottery({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 700, margin: "auto", marginTop: 64, backgroundBlendMode:"gradient", background:'url("Backgroud.jpeg")',backgroundRepeat:"no-repeat", backgroundSize:"contain",opacity:0.6  }}>
        <div style={{ color: "White", fontSize: "60px"}}>Welcome to ColoMint</div>
        <div style={{ color: "White", fontSize: "36px"}}>A JackPot that will always have a winner</div>
        <h4 style={{ color: "White", fontSize: "64px"}}>MinT it 2 Win iT</h4>
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}>
            Connect Your Wallet !
          </Button>
        </div>
      </div>
    </div>
  );
}
