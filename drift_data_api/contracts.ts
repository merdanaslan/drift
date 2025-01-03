interface Contract {
  marketIndex: number;
  symbol: string;
  fundingRate: string;
  openInterest: string;
  oiLong: string;
  oiShort: string;
  volume24H: string;
  lastPrice: string;
  oraclePrice: string;
  markPrice: string;
  baseAssetAmountStepSize: string;
  minOrderSize: string;
  maxPositionSize: string;
  imfFactor: string;
  unrealizedPnl: string;
  assetTier: string;
}

async function getContracts(): Promise<Contract[]> {
  const url = 'https://data.api.drift.trade/contracts';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.contracts;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
}

async function displayContractInfo(): Promise<void> {
  const contracts = await getContracts();

  if (contracts.length === 0) {
    console.log('No contracts data received');
    return;
  }

  console.log('\nContract Information:');
  
  contracts.forEach(contract => {
    const fundingRate = parseFloat(contract.fundingRate) / 1e9;
    const openInterest = parseFloat(contract.openInterest) / 1e6;
    const markPrice = parseFloat(contract.markPrice) / 1e6;
    const oraclePrice = parseFloat(contract.oraclePrice) / 1e6;
    const volume24H = parseFloat(contract.volume24H) / 1e6;
    
    console.log(`\nMarket: ${contract.symbol}`);
    console.log(`Funding Rate: ${(fundingRate * 100).toFixed(6)}%`);
    console.log(`Open Interest: ${openInterest.toFixed(2)} ${contract.symbol.split('-')[0]}`);
    console.log(`24h Volume: $${volume24H.toFixed(2)}`);
    console.log(`Mark Price: $${markPrice.toFixed(2)}`);
    console.log(`Oracle Price: $${oraclePrice.toFixed(2)}`);
    console.log('-------------------');
  });
}

displayContractInfo().catch(error => console.error('An error occurred:', error)); 