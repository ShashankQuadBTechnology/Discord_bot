export interface Config {
    OPENAI_API_KEY?: string;
    PERPLEXITY_API_KEY?: string;
    ETHEREUM_PRIVATE_KEY?: string;
  }

  export interface OrderParams {
    quantity: number;
    side: string;
    price: number;
  }

export interface BatchOrderPattern {
  side: "Buy" | "Sell";
  totalQuantity?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  spacing?: {
    type: "percentage" | "fixed";
    value: number;
  };
  numberOfOrders?: number;
  individualQuantity?: number;
}