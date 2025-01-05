import fetch from 'node-fetch';

interface MakerResponse {
  authority: string;  // Maker's address
}

class DriftOrderbookAnalyzer {
  private baseUrl: string;

  constructor(network: 'mainnet-beta' | 'devnet' = 'mainnet-beta') {
    this.baseUrl = network === 'mainnet-beta' 
      ? 'https://dlob.drift.trade' 
      : 'https://master.dlob.drift.trade';
  }

  async getTopMakers(
    marketName: string,
    side: 'bid' | 'ask',
    limit?: number,
    includeUserStats: boolean = false
  ): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        marketName,
        side,
        ...(limit && { limit: limit.toString() }),
        ...(includeUserStats && { includeUserStats: 'true' })
      });

      const url = `${this.baseUrl}/topMakers?${params}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const makers = await response.json();
      
      if (!Array.isArray(makers)) {
        console.log('Invalid response format - expected array of maker addresses');
        return [];
      }

      return makers;
    } catch (error) {
      console.error('Error fetching top makers:', error);
      return [];
    }
  }

  async displayTopMakers(
    marketName: string,
    limit: number = 5
  ): Promise<void> {
    console.log(`\nTop Makers for ${marketName}:`);
    
    try {
      console.log('\nBID SIDE:');
      const bidMakers = await this.getTopMakers(marketName, 'bid', limit, true);
      
      if (bidMakers.length === 0) {
        console.log('No bid makers found');
      } else {
        bidMakers.forEach((makerAddress, index) => {
          console.log(`\n#${index + 1} Maker:`);
          console.log(`Address: ${makerAddress}`);
          console.log('-------------------');
        });
      }

      console.log('\nASK SIDE:');
      const askMakers = await this.getTopMakers(marketName, 'ask', limit, true);
      
      if (askMakers.length === 0) {
        console.log('No ask makers found');
      } else {
        askMakers.forEach((makerAddress, index) => {
          console.log(`\n#${index + 1} Maker:`);
          console.log(`Address: ${makerAddress}`);
          console.log('-------------------');
        });
      }
    } catch (error) {
      console.error('Error displaying makers:', error);
    }
  }
}

async function main() {
  try {
    const analyzer = new DriftOrderbookAnalyzer('mainnet-beta');
    
    // Example: Get top 5 makers for SOL-PERP
    await analyzer.displayTopMakers('SOL-PERP', 5);
    
    // Example: Get top 5 makers for JTO-PERP
    await analyzer.displayTopMakers('JTO-PERP', 5);
    
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main(); 