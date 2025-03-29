import { OrderParams } from "../../types";
import { generateOrdersFromPattern } from "../../tools/0x";
import { Tool } from "langchain/tools";
import { EvmAgentKit } from "../../agent";

export class EthereumBatchOrderTool extends Tool {
  name = "evm_batch_order";
  description = `Places multiple limit orders using the 0x Protocol Limit Order system. Orders can be submitted as a list or a pattern:

  1. List format:
  {
    "orders": [
      { "quantity": 1, "price": 200, "side": "Buy" },
      { "quantity": 0.5, "price": 205, "side": "Sell" }
    ]
  }

  2. Pattern format:
  {
    "pattern": {
      "side": "Buy",
      "totalQuantity": 100,
      "priceRange": { "max": 1.0 },
      "spacing": { "type": "percentage", "value": 1 },
      "numberOfOrders": 5
    }
  }

  Examples:
  - "Place 5 buy orders totaling 100 tokens, 1% apart below $1"
  - "Create 3 sell orders of 10 tokens each between $50-$55"
  - "Place buy orders worth 50 tokens, $0.10 spacing from $0.80"

  Important: All orders must be created and signed in a single execution. Combine buy and sell orders into a single pattern or list.`;

  constructor(private evmKit: EvmAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      let ordersToPlace: OrderParams[] = [];

      if (parsedInput.pattern) {
        ordersToPlace = generateOrdersFromPattern(parsedInput.pattern);
      } else if (Array.isArray(parsedInput.orders)) {
        ordersToPlace = parsedInput.orders;
      } else {
        throw new Error("Either pattern or orders array is required");
      }

      if (ordersToPlace.length === 0) {
        throw new Error("No orders generated or provided");
      }

      ordersToPlace.forEach((order: OrderParams, index: number) => {
        if (
          typeof order.quantity !== "number" ||
          typeof order.price !== "number" ||
          !order.side ||
          (order.side !== "Buy" && order.side !== "Sell")
        ) {
          throw new Error(
            `Invalid order at index ${index}: quantity, price, and side ("Buy" or "Sell") are required`,
          );
        }
      });

      const txHashes = await this.evmKit.batchOrder(ordersToPlace);

      return JSON.stringify({
        status: "success",
        message: "Batch order submitted successfully",
        transactions: txHashes,
        orders: ordersToPlace
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR"
      });
    }
  }
}
