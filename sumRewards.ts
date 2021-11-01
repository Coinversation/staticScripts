import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

const fileName = `rewardStatic.csv`;

fs.createReadStream(path.resolve(__dirname, 'assets', fileName))
    .pipe(csv.parse({ headers: false }))
    .on('error', error => console.error(error))
    .on('data', row => handleRow(row))
    .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        printAll();
    });

interface rewardInfo{
    address:string;
    amount:number;
}

let address_reward = new Map<string, number>();

function handleRow(rawRow:any){
    const row:rewardInfo = {
        address: String(rawRow[0]),
        amount: Number.parseFloat(rawRow[1]),
    }

    const prevAmount = address_reward.get(row.address);
    // console.log(realAmount);
    // console.log(prevAmount);
    if(prevAmount){
        address_reward.set(row.address, +row.amount + +prevAmount);
    }else{
        address_reward.set(row.address, +row.amount);
    }
}

function printAll(){
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(process.stdout).on('end', () => process.exit());

    let sum:number = 0;
    let counter:number = 0;
    address_reward.forEach((_value:number, _address:string) => {
        // console.log("address %s, quantity: %f ",address, value);
        csvStream.write({ address: _address, quantity: _value });
        sum += _value;
        counter++;
    })

    console.log("");
    console.log("total: ", sum);
    console.log("count: ", counter);

    csvStream.end();
}



