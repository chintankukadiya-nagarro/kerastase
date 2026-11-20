import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  brandConfig,
  cartHasConfirmedForeignVendor,
  foreignCartLines,
  isAllowedCollectionHandle,
  isAllowedVendor,
  presentBrandCatalog,
  rejectedVariantIds,
  withBrandVendorFilter,
} from "../app/lib/brand.ts";

describe("Kérastase browse scope", () => {
  it("owns the kerastase collection and not kerastase-1", () => {
    assert.equal(brandConfig.vendor, "Kérastase");
    assert.equal(brandConfig.collectionHandle, "kerastase");
    assert.equal(isAllowedCollectionHandle("kerastase"), true);
    assert.equal(isAllowedCollectionHandle("kerastase-1"), false);
    assert.equal(isAllowedCollectionHandle("la-roche-posay"), false);
  });

  it("filters browsing to this vendor and keeps the other approved brand in the cart", () => {
    assert.equal(isAllowedVendor("Kérastase"), true);
    assert.equal(isAllowedVendor("La Roche-Posay"), false);
    assert.deepEqual(withBrandVendorFilter([{ available: true }]), [
      { available: true },
      { productVendor: "Kérastase" },
    ]);
    assert.deepEqual(
      presentBrandCatalog(
        [{ vendor: "La Roche-Posay" }],
        { hasNextPage: true, endCursor: "cursor" },
        1,
      ).products,
      [],
    );

    const lines = [
      { id: "lrp", merchandise: { product: { vendor: "La Roche-Posay" } } },
      { id: "ker", merchandise: { product: { vendor: "Kérastase" } } },
      { id: "other", merchandise: { product: { vendor: "Other" } } },
    ];
    assert.deepEqual(
      foreignCartLines(lines).map((line) => line.id),
      ["other"],
    );
    assert.equal(cartHasConfirmedForeignVendor(lines), true);
    assert.deepEqual(
      rejectedVariantIds(
        ["gid://shopify/ProductVariant/1"],
        [
          {
            __typename: "ProductVariant",
            id: "gid://shopify/ProductVariant/1",
            product: { title: "Toleriane", vendor: "La Roche-Posay" },
          },
        ],
      ),
      [{ id: "gid://shopify/ProductVariant/1", title: "Toleriane" }],
    );
  });
});
