// Import the API, Keyring and some utility functions
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { shidenPhases } from '../../secret.json';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

const fileName = `sumedRewardTest.csv`;

interface rewardInfo{
    address:string;
    amount:number;
}

let address_reward = new Map<string, number>();
let api:ApiPromise;
let officialAccount:KeyringPair;

fs.createReadStream(path.resolve(__dirname, 'assets', fileName))
.pipe(csv.parse({ headers: false }))
.on('error', error => {console.error(error)})
.on('data', row => handleRow(row))
.on('end', (rowCount: number) => {
    console.log(`Parsed ${rowCount} rows`);
});

function handleRow(rawRow:any){
    const row:rewardInfo = {
        address: String(rawRow[0]),
        amount: Number.parseFloat(rawRow[1]),
    }

  // Create a extrinsic, transferring 12345 units to Bob
  const transfer = api.tx.balances.transfer(row.address, row.amount * 1000000000000000000);

  console.log('sending row: ', row);
  // Sign and send the transaction using our account
  transfer.signAndSend(officialAccount)
    .catch(console.error)
    .then(hash => console.log('Transfer sent with hash', hash));
}
