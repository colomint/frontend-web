import { useCall, useContractFunction } from "@usedapp/core";

export default function ColorNFT({ tokenId, colorNFTContract, colorModifiersContract, address }) {
  function intRgbToHex(intRgb) {
    const _r = Math.floor(intRgb / 256 ** 2);
    const _g = Math.floor((intRgb - _r * 256 ** 2) / 256);
    const _b = intRgb - _r * 256 ** 2 - _g * 256;

    return padString(_r.toString(16)) + padString(_g.toString(16)) + padString(_b.toString(16));
  }

  function padString(str) {
    return str.length === 1 ? "0" + str : str;
  }

  function useTokenToColor(tokenContract, _tokenId) {
    const { value, error } =
      useCall(
        tokenContract && {
          contract: tokenContract,
          method: "tokenToColor",
          args: [_tokenId],
        },
      ) ?? {};
    if (error) {
      console.error(error.message);
      return undefined;
    }
    return value ? intRgbToHex(parseInt(value[0]["_hex"], 16)) : undefined;
  }

  const color = useTokenToColor(colorNFTContract, tokenId);

  const { send: safeTransferFromSend } = useContractFunction(colorModifiersContract, "safeTransferFrom");

  function addPaint(id, paintId) {
    const byteNumber = "0x" + ("0".repeat(64) + id.slice(2)).slice(-64) + "";
    console.log(address, colorNFTContract.address, paintId, 1, byteNumber);
    safeTransferFromSend(address, colorNFTContract.address, paintId, 1, byteNumber);
  }

  return color ? (
    <div
      style={{
        color: "white",
        width: "300px",
        height: "140px",
        borderRadius: "8px",
        margin: "5px 0",
        padding: "12px",
        background: `#${color}`,
      }}
    >
      This is your color NFT!
      <br />
      Index: {tokenId}
      <br />
      Color: #{color}
      <div
        style={{
          color: "black",
        }}
      >
        <button onClick={() => addPaint(tokenId, 0)}>Darker</button>
        <button onClick={() => addPaint(tokenId, 1)}>Lighter</button>
      </div>
    </div>
  ) : (
    "Loading NFT..."
  );
}
