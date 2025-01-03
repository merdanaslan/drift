interface Contract {
  contract_index: number;
  ticker_id: string;
  base_currency: string;
  quote_currency: string;
  last_price: string;
  base_volume: string;
  quote_volume: string;
  high: string;
  low: string;
  product_type: string;
  open_interest: string;
  index_price: string;
  index_name: string;
  index_currency: string;
  funding_rate: string;
  next_funding_rate: string;
}

async function getContracts(): Promise<Contract[]> {
  const url = 'https://data.api.drift.trade/contracts';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.contracts || !Array.isArray(data.contracts)) {
      throw new Error('Invalid response format: contracts array not found');
    }
    
    return data.contracts;  // Return all contracts without filtering
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
}

async function displayContractInfo(): Promise<void> {
  const contracts = await getContracts();
  console.log(contracts);

  if (contracts.length === 0) {
    console.log('No contracts data received');
    return;
  }

  console.log('\nAll Contracts Information:');
  
  contracts.forEach(contract => {
    try {
      if (!contract.ticker_id || !contract.last_price || !contract.index_price) {
        return;
      }

      const lastPrice = parseFloat(contract.last_price);
      const indexPrice = parseFloat(contract.index_price);
      
      console.log(`\nMarket: ${contract.ticker_id}`);
      console.log(`Market Index: ${contract.contract_index}`);
      console.log(`Type: ${contract.product_type}`);
      
      // Only show funding rate for PERP contracts
      if (contract.product_type === 'PERP' && contract.funding_rate !== 'N/A') {
        const fundingRate = parseFloat(contract.funding_rate);
        console.log(`Funding Rate: ${(fundingRate * 100).toFixed(6)}%`);
      }
      
      // Only show open interest if it exists and isn't 'N/A'
      if (contract.open_interest && contract.open_interest !== 'N/A') {
        const openInterest = parseFloat(contract.open_interest);
        console.log(`Open Interest: ${openInterest.toFixed(2)} ${contract.base_currency}`);
      }
      
      console.log(`Last Price: $${lastPrice.toFixed(3)}`);
      console.log(`Index Price: $${indexPrice.toFixed(3)}`);
      console.log('-------------------');
    } catch (error) {
      console.error('Error processing contract:', contract.ticker_id);
      console.error('Error details:', error);
    }
  });
}

displayContractInfo().catch(error => console.error('An error occurred:', error)); 