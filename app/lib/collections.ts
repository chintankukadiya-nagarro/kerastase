import { gql, type StorefrontApi } from "@shopify/hydrogen";
import type { StorefrontClient } from "@shopify/hydrogen";

import { COLLECTION_CARD_FRAGMENT } from "~/components/CollectionCard";
import { brandConfig } from "~/lib/brand";

export const COLLECTIONS_QUERY = gql(
  `
    query BrandCollection($handle: String!) {
      collection(handle: $handle) {
        ...CollectionCard
      }
    }
  `,
  [COLLECTION_CARD_FRAGMENT],
);

type CollectionsQueryVariables = StorefrontApi.VariablesOf<typeof COLLECTIONS_QUERY>;

export async function loadCollectionsPage({
  storefrontClient,
  request,
}: {
  storefrontClient: StorefrontClient;
  request: Request;
}) {
  const url = new URL(request.url);
  const { data } = await storefrontClient.graphql(COLLECTIONS_QUERY, {
    variables: { handle: brandConfig.collectionHandle },
  });
  const collection = data?.collection ?? null;

  return {
    collections: {
      nodes: collection ? [collection] : [],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
    origin: url.origin,
  };
}
