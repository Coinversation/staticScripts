import json1 from './SdnBonus1.json'
import json2 from './SdnBonus2.json'


function main() {
    const j1:SdnBonus = json1;
    for (const [key, value] of Object.entries(json2)){
        j1[key] = value + (j1[key] ? j1[key] : 0);
    }
    console.log(JSON.stringify(j1));

    console.log(`sum: ${sumOfRewards(j1)}`)
}

function sumOfRewards(rewardMap:SdnBonus):number{
    let sum = 0;
    for(const [key, value] of Object.entries(rewardMap)){
        sum += value;
    }
    return sum;
}

main();

interface SdnBonus{
    [key: string]: number;
}