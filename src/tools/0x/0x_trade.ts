import { ethers } from "ethers";
import { BatchOrderPattern, OrderParams, EvmAgentKit } from "../../index";

/**
 * Generates buy/sell orders spaced around a central price point.
 */
export function generateOrdersFromPattern(pattern: BatchOrderPattern): OrderParams[] {
  const orders: OrderParams[] = [];

  // Random number of orders if not specified, max of 8
  const numOrders = pattern.numberOfOrders || Math.ceil(Math.random() * 8);

  // Calculate price points
  const prices: number[] = [];
  if (pattern.priceRange) {
    const { min, max } = pattern.priceRange;
    if (min && max) {
      // Generate evenly spaced prices
      for (let i = 0; i < numOrders; i++) {
        if (pattern.spacing?.type === "percentage") {
          const factor = 1 + pattern.spacing.value / 100;
          prices.push(min * Math.pow(factor, i));
        } else {
          const step = (max - min) / (numOrders - 1);
          prices.push(min + step * i);
        }
      }
    } else if (min) {
      // Generate prices starting from min with specified spacing
      for (let i = 0; i < numOrders; i++) {
        if (pattern.spacing?.type === "percentage") {
          const factor = 1 + pattern.spacing.value / 100;
          prices.push(min * Math.pow(factor, i));
        } else {
          prices.push(min + (pattern.spacing?.value || 0.01) * i);
        }
      }
    }
  }

  // Calculate quantities
  let quantities: number[] = [];
  if (pattern.totalQuantity) {
    const individualQty = pattern.totalQuantity / numOrders;
    quantities = Array(numOrders).fill(individualQty);
  } else if (pattern.individualQuantity) {
    quantities = Array(numOrders).fill(pattern.individualQuantity);
  }

  // Generate orders
  for (let i = 0; i < numOrders; i++) {
    orders.push({
      side: pattern.side,
      price: prices[i],
      quantity: quantities[i],
    });
  }

  return orders;
}

/**
 * Validates that sell orders are not priced below buy orders
 * @param orders Array of order parameters to validate
 * @throws Error if orders are crossed
 */
function validateNoCrossedOrders(orders: OrderParams[]): void {
  let lowestSell = Number.MAX_SAFE_INTEGER;
  let highestBuy = 0;

  orders.forEach((order) => {
    if (order.side === "Sell" && order.price < lowestSell) {
      lowestSell = order.price;
    }
    if (order.side === "Buy" && order.price > highestBuy) {
      highestBuy = order.price;
    }
  });

  if (lowestSell <= highestBuy) {
    throw new Error(
      `Invalid order prices: Sell order at ${lowestSell} is lower than or equal to Buy order at ${highestBuy}. Orders cannot cross.`,
    );
  }
}

/**
 * Executes multiple limit orders using 0x protocol.
 */
export async function batchOrder(
  agent: EvmAgentKit,
  orders: OrderParams[],
  makerToken: string,
  takerToken: string
): Promise<string[]> {
  try {
    validateNoCrossedOrders(orders);

    const txHashes: string[] = [];

    for (const order of orders) {
      const response = await fetch("https://api.0x.org/orderbook/v1/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maker: agent.wallet.address,
          makerToken: makerToken,
          takerToken: takerToken,
          makerAmount: ethers.parseUnits(order.quantity.toString(), 18).toString(),
          takerAmount: ethers
            .parseUnits((order.quantity * order.price).toString(), 18)
            .toString(),
          side: order.side.toLowerCase(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.reason || "Failed to post order");
      }

      txHashes.push(result.metaTransactionHash || "mock-tx-hash");
    }

    return txHashes;
  } catch (error: any) {
    throw new Error(`Batch Order failed: ${error.message}`);
  }
}

