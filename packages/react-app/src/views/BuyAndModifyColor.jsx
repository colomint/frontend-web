import { Button, Divider, } from "antd";
import React from "react";
import { ethers } from "ethers";
import { useContractFunction, useCall } from "@usedapp/core";
export default function BuyAndModifyColor({
    address,
    userSigner,
    colorModifiersContract,
    colorModifiersAddress,
    colorNFTContract,
    colorsNFTAddress

}) {


    const { send: mintERC1155Send } = useContractFunction(colorModifiersContract, "mint", userSigner)
    const { send: mintERC721Send } = useContractFunction(colorNFTContract, "mint", userSigner)

    const { send: safeTransferFromSend } = useContractFunction(colorModifiersContract, "safeTransferFrom", userSigner)



    function useTotalWhitePaint() {
        const { value, error } = useCall(colorModifiersAddress && {
            contract: colorModifiersContract,
            method: 'getBalanceWhitePaint',
            args: [address],
        }) ?? {}
        if (error) {
            console.error(error.message)
            return undefined
        }
        return value?.[0]
    }

    function useTotalDarkPaint() {
        const { value, error } = useCall(colorModifiersAddress && {
            contract: colorModifiersContract,
            method: 'getBalanceWhitePaint',
            args: [address],
        }) ?? {}
        if (error) {
            console.error(error.message)
            return undefined
        }
        return value?.[0]
    }

    function useTotalListTokensERC721() {
        const { value, error } = useCall(colorsNFTAddress && {
            contract: colorNFTContract,
            method: 'getColorsByOwner',
            args: [address],
        }) ?? {}
        if (error) {
            console.error(error.message)
            return undefined
        }
        return value?.[0]
    }


    function useColorList() {
        const { value, error } = useCall(colorsNFTAddress && {
            contract: colorNFTContract,
            method: '_colorTokenList',
            args: [],
        }) ?? {}
        if (error) {
            console.error(error.message)
            return undefined
        }
        return value?.[0]
    }



    const totalListTokensERC271User = useTotalListTokensERC721();

    const totalColorList = useColorList();


    const colorsPerUser = [];

    for (let i = 0; i < totalListTokensERC271User?.length; i++) {
        colorsPerUser.push({
            id: parseInt(totalListTokensERC271User[i]?._hex),
            colorValue: parseInt(totalColorList[totalListTokensERC271User[i]])

            // Transform to RGB to show at web page 

            //          R = C / (256 ^ 2);

            //         G = (C / 256) % 256;

            //         B = C % 256
        });
    }

    console.log(colorsPerUser);


    const TotalWhitePaintInt = parseInt(useTotalWhitePaint()?._hex, 16)

    const TotalDarkPaintInt = parseInt(useTotalDarkPaint()?._hex, 16)



    function mintERC721() {
        let valueInEther = ethers.utils.parseEther("" + 0.00001);
        return mintERC721Send(1, 1, 1, { value: valueInEther });
    }

    function getPaint() {
        return mintERC1155Send();
    }



    function addPaint(id, tokenId) {


        const byteNumber = "0x" + ("0".repeat(64) + id).slice(-64) + "";

        safeTransferFromSend(address, colorsNFTAddress, tokenId, 1, byteNumber);

    }


    return (
        <>
            <div style={{ maxWidth: 100, margin: "auto", marginTop: 32, marginBottom: 32 }}>
                GET NFT COLOR
                <div>
                    <Button
                        onClick={mintERC721}
                        type="primary"
                    >
                        Confirm
                    </Button>
                </div>

            </div>

            <div style={{ maxWidth: 400, margin: "auto", marginTop: 32, marginBottom: 32 }}>
                <h4> Your color NFTs</h4>
                <ul>
                    {colorsPerUser.map(userTable => (
                        <>
                            <li style={{ display: "flex", margin: "auto" }} key={userTable.id} >
                                <Button size="small"
                                    onClick={() => addPaint(userTable.id, 1)}
                                >
                                    White Paint
                                </Button>
                                &nbsp;
                                &nbsp;
                                {/* <h6 style={{ color: `rgb(${userTable.R}, ${userTable.G},${userTable.B})` }}>
                                    {userTable.R} = {userTable.G} = {userTable.B}
                                </h6> */}
                                <h1> {userTable.colorValue}</h1>
                                &nbsp;
                                &nbsp;
                                <Button size="small"
                                    onClick={() => addPaint(userTable.id, 0)}
                                >
                                    dark paint
                                </Button>
                            </li>
                        </>

                    ))}

                </ul>

            </div>


            <Divider />

            <div>
                <h4>Your dark paints {TotalDarkPaintInt}</h4>

                <h4>Your white paints {TotalWhitePaintInt}</h4>
            </div>
            <Button size="small"
                onClick={() => getPaint()}
            >
                GET PAINT
            </Button>



        </>
    );
}
