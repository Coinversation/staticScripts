import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';


const era = 12
const claimedReward:number = 2252;
const totalStaked:number = 1193400;

const rewardPerShare = claimedReward / 2.0 / totalStaked;
const fileName = `dApp staking copy ${era}.csv`;

fs.createReadStream(path.resolve(__dirname, 'assets', fileName))
    .pipe(csv.parse({ headers: false }))
    .on('error', error => console.error(error))
    .on('data', row => handleRow(row))
    .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        printAll();
    });

interface userDepositInfo{
    address:string;
    amount:number;
}

let address_reward = new Map<string, number>();

interface staticRow{
    address:string; 
    amount:number; 
    unit:string;
}

function handleRow(rawRow:any){
    const row:staticRow = {
        address: String(rawRow[0]),
        amount: Number.parseFloat(rawRow[1]),
        unit: String(rawRow[2]),
    }

    const realAmount = +row.amount * (row.unit === 'kSDN' ? 1000 : 1);
    const prevAmount = address_reward.get(row.address);
    // console.log(realAmount);
    // console.log(prevAmount);
    if(prevAmount){
        address_reward.set(row.address, (+realAmount + +prevAmount) * rewardPerShare );
    }else{
        address_reward.set(row.address, +realAmount * +rewardPerShare);
    }
}

function printAll(){
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(process.stdout).on('end', () => process.exit());

    let sum:number = 0;
    address_reward.forEach((_value:number, _address:string) => {
        // console.log("address %s, quantity: %f ",address, value);
        csvStream.write({ address: _address, quantity: _value });
        sum += _value;
    })

    console.log("");
    console.log("total: ", sum);

    csvStream.end();
}



