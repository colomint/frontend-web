import { useCall } from "@usedapp/core";

export default function ColorNFT({ tokenId, colorNFTContract }) {
  function intRgbToHex(intRgb) {
    const _r = Math.floor(intRgb / 256 ** 2);
    const _g = Math.floor((intRgb - _r * 256 ** 2) / 256);
    const _b = intRgb - _r * 256 ** 2 - _g * 256;
    console.log(_r, _g, _b);

    return _r.toString(16) + _g.toString(16) + _b.toString(16);
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
    value && console.log("smart contract value", value);
    return value ? intRgbToHex(parseInt(value[0]["_hex"], 16)) : undefined;
  }

  const color = useTokenToColor(colorNFTContract, tokenId);

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
      This is your color NFT!<br />
      Index: {tokenId}<br />
      Color: #{color}
    </div>
  ) : (
    "Loading NFT..."
  );
}
