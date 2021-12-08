import jsonData from './KacBonusBeforeEra40_EvmAddress.json'


function main() {
    let sum = 0;
    for(const [key, value] of Object.entries(jsonData)) {
        sum += value;
    }

    console.log(`sum: ${sum}`);
}

main();