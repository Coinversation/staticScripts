import { ApiPromise, WsProvider } from '@polkadot/api';
import {decodeAddress} from "@polkadot/util-crypto";

let api:ApiPromise

const kacTotalReward = 10000;
async function main() {

    // Instantiate the API
    //wss://rpc.shiden.plasmnet.io
    //wss://shiden.api.onfinality.io/public-ws
    // const wsProvider = new WsProvider("wss://rpc.shiden.plasmnet.io");
    const wsProvider = new WsProvider(
      "wss://shiden.api.onfinality.io/public-ws",
      24000
    );
    console.log("get provider");
    api = await ApiPromise.create({ provider: wsProvider });
    console.log("connect endpoint");

    for(let i = 33; i < 40; i++) {
        await getRewardData(i, 0.1);
    }
    console.log(JSON.stringify(sdnRewardMap));

    const sum = sumOfRewards();
    console.log(`SDN user rewards sum: ${sum}`);

    // let KACSum:number = 0;
    // for(const [key, value] of Object.entries(sdnRewardMap)){
    //     const publicKey = "0x" + Buffer.from(decodeAddress(key)).toString("hex");
    //     kacRewardMap[publicKey] = (value / sum * kacTotalReward) + (kacRewardMap[publicKey] ? kacRewardMap[publicKey] : 0);
    //     KACSum += kacRewardMap[publicKey];
    // }
    // console.log(JSON.stringify(kacRewardMap));
    // console.log(`KAC user rewards sum: ${KACSum}`);
}

const kacoContractAddress = "0xcd8620889c1dA22ED228e6C00182177f9dAd16b7";
async function getRewardData(era:number, userRatio:number){
    const data = await api.query.dappsStaking.contractEraStake({Evm: kacoContractAddress}, era);
    // const data = await api.query.dappsStaking.eraRewardsAndStakes(33);
    // console.log(typeof data);
    
    const stringData = JSON.stringify(data);
    const jsonData:RewardsData = JSON.parse(stringData, (key, value) => {
        // console.log(`key: ${key}, value: ${value}`);
        if(typeof value === "string" && value.startsWith("0x")){
            return parseInt(value, 16) / 1000000000000000000;
        }else{
            return value;
        }
    });

    for(const [key, value] of Object.entries(jsonData.stakers)){
        sdnRewardMap[key] = (value / jsonData.total * jsonData.claimedRewards * userRatio) + (sdnRewardMap[key] ? sdnRewardMap[key] : 0);
    }
}

function sumOfRewards():number{
    let sum = 0;
    for(const [key, value] of Object.entries(sdnRewardMap)){
        sum += value;
    }
    return sum;
}

const kacRewardMap:{[key in string]: number} = {};
const sdnRewardMap:{[key in string]: number} = {};
interface RewardsData{
    total: number,
    stakers: {[key in string]: number},
    formerStakedEra: number,
    claimedRewards: number
}

main();