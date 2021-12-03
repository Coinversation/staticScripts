import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';


const masterChefAddress = "0x81b71d0bc2de38e37978e6701c342d0b7aa67d59";
const fileName = "../../export-address-token-0x81b71D0bC2De38e37978E6701C342d0b7AA67D59.csv";

const token_address_amount = new Map<string, Map<string, number>>();
const contractAddress_lpName = new Map<string, string>();

contractAddress_lpName.set("0x23e6c98f69515cab75352a31fed9994a67312b10", "kac-ksm");
contractAddress_lpName.set("0x315f25cea80ac6c039b86e79ffc46ae6b2e30922", "kac-dot");
contractAddress_lpName.set("0x7641cfbc20b1c55485df217e0b81af80e5d9f4ce", "kkac-kac");
contractAddress_lpName.set("0xc17205e5de6735e320f4c59dd31986d9d049051c", "cake-kac");
contractAddress_lpName.set("0x23dc044ff5359a123a857cf5fffaf55323b76528", "alpaca-kac");
contractAddress_lpName.set("0xf96429a7ae52da7d07e60be95a3ece8b042016fb", "kac");

contractAddress_lpName.set("0x69ebc54cf45f6a3b1f5087710bbca61a2cfa890b", "kalpaca-alpaca");
contractAddress_lpName.set("0x3bfba971e3d40f6fc9fcc9571a7e96f55d248ddd", "kcake-cake");
contractAddress_lpName.set("0xa007ac283a4e9c915337d8a6c89fe7c9064e7522", "pha-dot");

fs.createReadStream(path.resolve(__dirname, 'assets', fileName))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => handleRow(row))
    .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        printAll();
    });

interface userDepositInfo{
    From:string;
    To:string;
    Value:number;
    ContractAddress:string;
}

function handleRow(rawRow: any){
    const row:userDepositInfo = {
        From: String(rawRow["From"]),
        To: String(rawRow["To"]),
        Value: Number.parseFloat(rawRow["Value"]),
        ContractAddress: String(rawRow["ContractAddress"]),
    }

    let address_amount = token_address_amount.get(row.ContractAddress);
    if(!address_amount){
        address_amount = new Map<string, number>();
        token_address_amount.set(row.ContractAddress, address_amount);
    }

    if(row.To === masterChefAddress){
        let fromQuantity:number| undefined = address_amount.get(row.From);
        if(fromQuantity){
            address_amount.set(row.From, +row.Value + +fromQuantity);
        }else{
            address_amount.set(row.From, +row.Value);
        }
        // if(from === "0xfb83a67784f110dc658b19515308a7a95c2ba33a"){
        //     console.log("deposit %d", quantity);
        // }
    }else if(row.From === masterChefAddress){
        let toQuantity:number| undefined = address_amount.get(row.To)
        if(toQuantity){
            address_amount.set(row.To, +row.Value * -1 + +toQuantity);
        }else{
            address_amount.set(row.To, +row.Value * -1);
        }
        // if(to === "0xfb83a67784f110dc658b19515308a7a95c2ba33a"){
        //     console.log("withdraw %d", quantity);
        // }
    }
}

function printAll(){
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(process.stdout).on('end', () => process.exit());

    // console.log("token_address_amount: ", token_address_amount);

    token_address_amount.forEach((_value:Map<string, number>, tokenAddress:string) => {
        const lpName = contractAddress_lpName.get(tokenAddress);
        // console.log(`LP: ${lpName}`);
        if(lpName){
            _value.forEach((amount: number, userAddress: string) => {
                if(amount > 0){
                    csvStream.write({ lp: lpName,  address: userAddress, quantity: amount });
                }
            })
        }
    })

    csvStream.end();
}



