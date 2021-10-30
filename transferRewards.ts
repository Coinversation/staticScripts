// Import the API, Keyring and some utility functions
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { shidenPhases } from "../../secret.json";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import { Result } from "@polkadot/types";
import type { ExtrinsicStatus } from "@polkadot/types/interfaces/author";
import BN from "bn.js";
import { CsvFile } from "./rwCsv";

const fileName = `sumedRewardTest.csv`;
const lostFileName = "rewardsLost.csv";

const kaco_dev2 = "ZtbS4kZo6BjjqSPZLo9eFgy7c5q1qeR6WmNZPDtgRd8isb9";

interface rewardInfo {
  address: string;
  amount: number;
}

let address_reward = new Map<string, number>();
let api: ApiPromise;
let officialAccount: KeyringPair;
let rewards: rewardInfo[] = [];
let csvFile: CsvFile;

function cacheRow(rawRow: any) {
  const row: rewardInfo = {
    address: String(rawRow[0]),
    amount: Number.parseFloat(rawRow[1]),
  };

  rewards.push(row);
}

async function handleResults() {
  console.log("len", rewards.length);
  const nonce = (await api.query.system.account(kaco_dev2)).nonce;
  console.log("nonce: ", nonce);
  const one = new BN("1", 2);
  for (let r = 0; r < rewards.length; r++) {
    while (!api.isConnected) {
      console.log(`waitng for connecting`);
      //   try {
      //     await api.connect();
      //   } catch (error) {
      //       console.log("connecting error, ",error);
      //   }
      await sleep(2000);
    }

    const row = rewards[r];
    console.log(`sending row: ${row.address}, ${row.amount}`);
    let isConfirmed: boolean = false;
    // Sign and send the transaction using our account
    let counter: number = 0;

    // Create a extrinsic, transferring 12345 units to Bob
    const transfer = api.tx.balances.transfer(
      row.address,
      BigInt((row.amount * 1000000).toFixed(0)) * BigInt(1000000000000)
    );

    const unsubP = transfer
      .signAndSend(officialAccount, { nonce: nonce.add(one) }, (result) => {
        console.log(`Current status is ${result.status}`);

        if (result.status.isInBlock) {
          console.log(
            `Transaction included at blockHash ${result.status.asInBlock} ${row.address}`
          );
          isConfirmed = true;
        } else if (result.status.isFinalized) {
          console.log(
            `Transaction finalized at blockHash ${result.status.asFinalized} ${row.address}`
          );
          isConfirmed = true;
        } else if (result.status.isBroadcast) {
          counter++;
        }
      })
      .catch((e) => {
        console.error("transfer error, ", e);
        isConfirmed = true;
        csvFile.append([{address: row.address, amout: row.amount}])
      });

    let sleepCounter: number = 0;
    while (!isConfirmed && counter < 2) {
      console.log(`waitng for finalize: ${row.address}`);
      if (sleepCounter === 0) {
        await sleep(18000);
      } else {
        await sleep(2000);
      }
      sleepCounter++;
    }
    unsubP.catch(console.error).then((unsub) => {
      if (unsub) {
        unsub();
      } else {
        console.error(`unsub is void ${row.address}`);
      }
    });
    //   .then((hash) => {
    //     if (hash) {
    //       console.log(`sended row: ${row.address}, ${row.amount}`);
    //     } else {
    //       console.log("nothing");
    //     }
    //   });
  }

  //   console.log('Transfer sent with hash', hash)
}

async function main() {
  csvFile = new CsvFile({
    path: path.resolve(__dirname, lostFileName),
    // headers to write
    headers: ["address", "amount"],
  });

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

  // Constuct the keyring after the API (crypto has an async init)
  const keyring = new Keyring({ ss58Format: 5, type: "sr25519" });
  officialAccount = keyring.addFromUri(shidenPhases);
  console.log(
    `${officialAccount.meta.name}: has address ${officialAccount.address}`
  );

  console.log("ended ");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
  //   Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

main()
  .catch((e) => console.error("wss error, ", e))
  .then(() => {
    fs.createReadStream(path.resolve(__dirname, "assets", fileName))
      .pipe(csv.parse({ headers: false }))
      .on("error", (error) => {
        console.error(error);
      })
      .on("data", (row) => cacheRow(row))
      .on("end", (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        handleResults();
      });
  });
