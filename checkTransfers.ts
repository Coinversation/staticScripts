import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";

const transferHistoryFileName = `sb9TransferHistory.csv`;
const sumedRewardFileName = `sumedReward.csv`;


const sb9 = "ZtbS4kZo6BjjqSPZLo9eFgy7c5q1qeR6WmNZPDtgRd8isb9";
const U3h = "Xrk2Nn1SsHRJxEwV3UqR6oKdfAAVWuN9FvNfCifqHYf3U3h";

fs.createReadStream(path.resolve(__dirname, "assets", transferHistoryFileName))
  .pipe(csv.parse({ headers: false }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => handleTransferHistory(row))
  .on("end", (rowCount: number) => {
    console.log(`Parsed ${rowCount} history rows`);
    fs.createReadStream(path.resolve(__dirname, "assets", sumedRewardFileName))
      .pipe(csv.parse({ headers: false }))
      .on("error", (error) => console.error(error))
      .on("data", (row) => handleRow(row))
      .on("end", (rowCount: number) => {
        console.log(`Parsed ${rowCount} sumed rows`);
        diff();
      });
  });

interface transferHistory {
  // ExtrinsicID:string;
  // time:string;
  // Block:number;
  // Hash:string;
  From: string;
  To: string;
  Value: number;
  Result: boolean;
}

let address_transed = new Map<string, number>();

function handleTransferHistory(rawRow: any) {
  const row: transferHistory = {
    From: String(rawRow[4]),
    To: String(rawRow[5]),
    Value: Number.parseFloat(rawRow[6]),
    Result: new Boolean(rawRow[7]).valueOf(),
  };

  if (row.Result && row.From === sb9) {
    const prevAmount = address_transed.get(row.To);
    // console.log(realAmount);
    // console.log(prevAmount);
    if (prevAmount) {
      address_transed.set(row.To, +row.Value + +prevAmount);
    } else {
      address_transed.set(row.To, +row.Value);
    }
  }
}


interface rewardInfo {
  address: string;
  amount: number;
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


function diff() {
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(process.stdout).on("end", () => process.exit());

  let counter: number = 0;
  let sum: number = 0;
  address_reward.forEach((_value: number, _address: string) => {
    // console.log("address %s, quantity: %f ",address, value);
    const transed = address_transed.get(_address);
    if(!transed || transed <= 0){
        csvStream.write({ address: _address, quantity: _value });
        counter++;
        sum += _value;
    }
  });

  console.log("");
  console.log("count: ", counter);
  console.log("sum: ", sum);

  csvStream.end();
}
