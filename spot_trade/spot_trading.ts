import { 
  DriftClient, 
  initialize,
  OrderType,    
  OrderParams,
  PositionDirection,
  BN,
  DriftEnv,
  MarketType
} from '@drift-labs/sdk';
import { Keypair, Connection } from '@solana/web3.js';
import * as dotenv from 'dotenv';

dotenv.config();

interface SpotTradeParams {
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price?: number;
  orderType?: 'LIMIT' | 'MARKET';
}

class SpotTrader {
  private client: DriftClient;
  private connection: Connection;

  constructor() {
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
  }

  async initialize() {
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }

    const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

    const driftEnv: DriftEnv = 'mainnet-beta';
    
    this.client = await initialize({
      env: driftEnv,
      overrideEnv: {
        connection: this.connection,
        wallet: keypair,
        userStats: true,
        spotMarkets: true,
      }
    });
    
    console.log('Spot trader initialized');
  }

  async placeSpotTrade(params: SpotTradeParams) {
    try {
      const orderParams: OrderParams = {
        marketIndex: await this.getMarketIndex(params.symbol),
        marketType: MarketType.SPOT,
        direction: params.side === 'buy' ? PositionDirection.LONG : PositionDirection.SHORT,
        baseAssetAmount: new BN(params.size * 1e6),
        orderType: params.orderType === 'LIMIT' ? OrderType.LIMIT : OrderType.MARKET,
        price: new BN(params.orderType === 'LIMIT' && params.price ? params.price * 1e6 : 0),
        reduceOnly: false,
        userOrderId: 0,
        postOnly: false,
        immediateOrCancel: false,
        triggerPrice: null,
        triggerCondition: null,
        maxTs: null,
        oraclePriceOffset: 0,
        auctionDuration: 0,
        auctionStartPrice: null,
        auctionEndPrice: null,
      };

      const tx = await this.client.placeSpotOrder(orderParams);
      console.log('Trade placed successfully:', tx);
      return tx;
    } catch (error) {
      console.error('Error placing trade:', error);
      throw error;
    }
  }

  private async getMarketIndex(symbol: string): Promise<number> {
    const markets = {
      'SOL': 0,
      'BTC': 1,
      'ETH': 2,
    };
    
    const index = markets[symbol];
    if (index === undefined) {
      throw new Error(`Market not found for symbol: ${symbol}`);
    }
    
    return index;
  }
}

async function main() {
  try {
    const trader = new SpotTrader();
    await trader.initialize();

    const tradeParams: SpotTradeParams = {
      symbol: 'SOL',
      side: 'buy',
      size: 1,
      price: 100,
      orderType: 'LIMIT'
    };

    await trader.placeSpotTrade(tradeParams);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main(); 