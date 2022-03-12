import { useCall } from "@usedapp/core";
import { useEffect, useState } from "react";
import ColorNFT from "./ColorNFT";

function useNFTList(tokenContract, address) {
  const { value, error } =
    useCall(
      tokenContract && {
        contract: tokenContract,
        method: "getColorsByOwner",
        args: [address],
      },
    ) ?? {};
  if (error) {
    console.error(error.message);
    return undefined;
  }
  return value;
}

export default function ColorNFTList({ address, colorNFTContract }) {
  const [nftIds, setNftIds] = useState([]);
  const nftList = useNFTList(colorNFTContract, address);

  useEffect(() => {
    nftList && console.log("NFT list", nftList[0]);
    nftList && setNftIds(nftList[0].map(entry => entry["_hex"]));
  }, [nftList]);

  return nftIds.map(entry => <ColorNFT tokenId={entry} colorNFTContract={colorNFTContract} key={entry} />);
}
