import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';


const masterChefAddress = "0x81b71d0bc2de38e37978e6701c342d0b7aa67d59";
const fileName = "export-address-token-0x81b71D0bC2De38e37978E6701C342d0b7AA67D59.csv";

fs.createReadStream(path.resolve(__dirname, 'assets', fileName))
    .pipe(csv.parse({ headers: true }))
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

let token_address_amount = new Map<string, Map<string, number>>();

function handleRow(row: any){
    let quantity:number = row.Quantity;
    let to:string = row.To;
    let from:string = row.From;

    if(to === masterChefAddress){
        let fromQuantity:number = token_address_amount.get(from)
        if(fromQuantity){
            token_address_amount.set(from, +quantity + +fromQuantity);
        }else{
            token_address_amount.set(from, +quantity);
        }
        // if(from === "0xfb83a67784f110dc658b19515308a7a95c2ba33a"){
        //     console.log("deposit %d", quantity);
        // }
    }else if(from === masterChefAddress){
        let toQuantity:number = token_address_amount.get(to)
        if(toQuantity){
            token_address_amount.set(to, +quantity * -1 + +toQuantity);
        }else{
            token_address_amount.set(to, +quantity * -1);
        }
        // if(to === "0xfb83a67784f110dc658b19515308a7a95c2ba33a"){
        //     console.log("withdraw %d", quantity);
        // }
    }else{
        console.log("from: %s, to: %s", from, to)
    }
}

function printAll(){
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(process.stdout).on('end', () => process.exit());

    token_address_amount.forEach((_value:number, _address:string) => {
        // console.log("address %s, quantity: %f ",address, value);
        if(_value > 49.9999){
            csvStream.write({ address: _address, quantity: _value });
        }
    })

    csvStream.end();
}



