interface FundingRate {
  txSig: string;
  slot: number;
  ts: string;
  recordId: string;
  marketIndex: number;
  fundingRate: string;
  cumulativeFundingRateLong: string;
  cumulativeFundingRateShort: string;
  oraclePriceTwap: string;
  markPriceTwap: string;
  fundingRateLong: string;
  fundingRateShort: string;
  periodRevenue: string;
  baseAssetAmountWithAmm: string;
  baseAssetAmountWithUnsettledLp: string;
}

async function getFundingRates(marketSymbol: string = 'SOL-PERP'): Promise<FundingRate[]> {
  const url = `https://data.api.drift.trade/fundingRates?marketName=${marketSymbol}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.fundingRates;
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return [];
  }
}

async function main(): Promise<void> {
  const marketSymbol = 'BTC-PERP';
  const rates = await getFundingRates(marketSymbol);
  console.log(rates);
  if (rates.length === 0) {
    console.log('No funding rates data received');
    return;
  }

  console.log(`\nFunding Rates for ${marketSymbol}:`);
  console.log('Latest 10 funding rates:');
  
  // Take the last 10 rates and reverse them to show newest first
  rates.slice(-10).reverse().forEach(rate => {
    // Convert timestamp from seconds to milliseconds
    const timestamp = new Date(parseInt(rate.ts) * 1000).toLocaleString();
    const fundingRate = parseFloat(rate.fundingRate) / 1e9;
    const markPrice = parseFloat(rate.markPriceTwap) / 1e6;
    const oraclePrice = parseFloat(rate.oraclePriceTwap) / 1e6;
    
    console.log(`Time: ${timestamp}`);
    console.log(`Funding Rate: ${(fundingRate * 100).toFixed(6)}%`);
    console.log(`Mark Price: $${markPrice.toFixed(2)}`);
    console.log(`Oracle Price: $${oraclePrice.toFixed(2)}`);
    console.log('-------------------');
  });

  // Calculate average funding rate
  const avgFundingRate = rates.reduce((acc, rate) => {
    return acc + (parseFloat(rate.fundingRate) / 1e9);
  }, 0) / rates.length;

  // Calculate annualized funding rate (assuming hourly funding)
  const annualizedRate = avgFundingRate * 24 * 365;

  console.log('\nSummary:');
  console.log(`Average Funding Rate: ${(avgFundingRate * 100).toFixed(6)}% per hour`);
  console.log(`Annualized Rate: ${(annualizedRate * 100).toFixed(2)}%`);
  console.log(`Number of samples: ${rates.length}`);
}

main().catch(error => console.error('An error occurred:', error)); 