import { useCartStore } from "./apps/web/src/stores/index";
import type { Product } from "@warkop-yareh/types";

const productA: Product = {
  id: "coffee-1",
  name: "Es Kopi Susu Yareh",
  slug: "es-kopi-susu-yareh",
  description: "Signature palm sugar iced coffee",
  price: 25000,
  image: "",
  category: "coffee",
  isActive: true,
  isPopular: true,
  isNew: false,
  rating: 4.8,
  reviewCount: 120,
  preparationTime: 5,
};

async function main() {
  console.log("--- TESTING ZUSTAND CART STORE GROUPING ---");

  const store = useCartStore;
  
  // Clear cart first
  store.getState().clearCart();
  console.log("Initial Cart items count:", store.getState().items.length);

  // Add product A with { ice: 'less' }
  console.log("\n[1] Adding Product A with { ice: 'less' }");
  store.getState().addItem(productA, 1, { ice: "less" });

  // Add product A with { ice: 'normal' }
  console.log("[2] Adding Product A with { ice: 'normal' }");
  store.getState().addItem(productA, 1, { ice: "normal" });

  const items = store.getState().items;
  console.log("\nCart items after additions:", items.length);
  
  items.forEach((item, idx) => {
    console.log(`Item ${idx + 1}:`);
    console.log(`  - Product ID: ${item.product.id}`);
    console.log(`  - Product Name: ${item.product.name}`);
    console.log(`  - Customizations:`, item.customizations);
    console.log(`  - Quantity: ${item.quantity}`);
  });

  if (items.length === 2) {
    console.log("\n✅ SUCCESS: Zustand cart successfully kept the items separate based on customizations!");
    process.exit(0);
  } else {
    console.log("\n❌ FAILED: Zustand cart merged the items instead of keeping them separate.");
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Test Error:", err);
  process.exit(1);
});
