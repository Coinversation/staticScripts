import { ApiPromise, WsProvider } from '@polkadot/api';
// import '../interfaces/augment-api-query';

let api:ApiPromise

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

    await getCurrentEra();
}

async function getCurrentEra(){
    const data = await api.query.dappsStaking.contractEraStake({Evm: "0xcd8620889c1dA22ED228e6C00182177f9dAd16b7"}, 33);
    // const data = await api.query.dappsStaking.eraRewardsAndStakes(33);
    console.log(typeof data);
    console.log(JSON.stringify(data));
}

main();
