import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/colomint/frontend-web" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 ColoMint"
        subTitle="Every Jackpot has a winner"
        style={{ backgroundImage:'url("Backgroud.jpeg")' }}
      />
    </a>
  );
}
