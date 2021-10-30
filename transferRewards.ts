// Import the API, Keyring and some utility functions
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { shidenPhases } from "../../secret.json";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";

const fileName = `sumedRewardTest.csv`;

interface rewardInfo {
  address: string;
  amount: number;
}

let address_reward = new Map<string, number>();
let api: ApiPromise;
let officialAccount: KeyringPair;

function handleRow(rawRow: any) {
  const row: rewardInfo = {
    address: String(rawRow[0]),
    amount: Number.parseFloat(rawRow[1]),
  };

  // Create a extrinsic, transferring 12345 units to Bob
  const transfer = api.tx.balances.transfer(
    row.address,
    BigInt((row.amount * 1000000).toFixed(0)) * BigInt(1000000000000)
  );

  console.log(`sending row: ${row.address}, ${row.amount}`);
  // Sign and send the transaction using our account
  transfer
    .signAndSend(officialAccount)
    .catch((e) => console.error("transfer error, ", e))
    .then((hash) => {
      if (hash) {
        console.log(`sended row: ${row.address}, ${row.amount}`);
      } else {
        console.log("nothing");
      }
    });
  //   console.log('Transfer sent with hash', hash)
}

async function main() {
  // Instantiate the API
  const wsProvider = new WsProvider("wss://shiden.api.onfinality.io/public-ws");
  console.log("get provider");
  api = await ApiPromise.create({ provider: wsProvider });
  console.log("connect endpoint");

  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ ss58Format: 5, type: "sr25519" });
  officialAccount = keyring.addFromUri(shidenPhases);
  console.log(
    `${officialAccount.meta.name}: has address ${officialAccount.address}`
  );

  console.log("ended ");
}

main()
  .catch((e) => console.error("wss error, ", e))
  .then(() => {
    fs.createReadStream(path.resolve(__dirname, "assets", fileName))
      .pipe(csv.parse({ headers: false }))
      .on("error", (error) => {
        console.error(error);
      })
      .on("data", (row) => handleRow(row))
      .on("end", (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
      });
  });
