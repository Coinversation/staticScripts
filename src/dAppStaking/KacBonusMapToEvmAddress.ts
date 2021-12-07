import jsonData from "./KacBonusBeforeEra40.json";
import fetch from "node-fetch";

async function main() {
  let publicKeyAddresses: string[] = [];
  const typedJsonData: kacBonusMap = jsonData as kacBonusMap;
  for (const [key, value] of Object.entries(typedJsonData)) {
    publicKeyAddresses.push(key);
  }
  console.log(publicKeyAddresses);

  const kacBonusEvmAddressMap: { [key in string]: number } = {};
  for (let i = 0; i < publicKeyAddresses.length; i++) {
    const r = await fetch(
      `https://shiden.kaco.finance/bind/sign/address?polkadotKeys=${publicKeyAddresses[i]}`
    );
    const rJson: RawResult = (await r.json()) as RawResult;
    console.log("fetch result: ", JSON.stringify(rJson));

    if (rJson.data) {
      for (const e of rJson.data) {
        const finalNum = typedJsonData[Object.keys(e)[0]];
        if (finalNum > 0) {
          kacBonusEvmAddressMap[Object.values(e)[0]] = finalNum;
        }
      }
    }
  }
  console.log(JSON.stringify(kacBonusEvmAddressMap));
}

main();

interface RawResult {
  status: number;
  msg: string;
  data?: { [key: string]: string }[];
}

interface kacBonusMap {
  [key: string]: number;
}
