/**
 * Look up a player's EVE Frontier Character by their wallet address.
 * Uses the PlayerProfile object (owned by the wallet) → Character object chain.
 */

const GQL = "https://graphql.testnet.sui.io/graphql";
const WORLD_PKG = "0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75";

async function gql<T>(query: string): Promise<T | null> {
  try {
    const res = await fetch(GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export async function fetchCharacterByWallet(
  walletAddress: string,
): Promise<{ name: string; characterId: string; tribeId: number } | null> {
  // Step 1: Find PlayerProfile owned by this wallet
  const profileQuery = `{
    address(address: "${walletAddress}") {
      objects(filter: { type: "${WORLD_PKG}::character::PlayerProfile" }, first: 1) {
        nodes { contents { json } }
      }
    }
  }`;

  const profileData: any = await gql(profileQuery);
  const profileNode = profileData?.address?.objects?.nodes?.[0];
  if (!profileNode) return null;

  const characterId: string = profileNode.contents?.json?.character_id;
  if (!characterId) return null;

  // Step 2: Fetch the Character object
  const charQuery = `{
    object(address: "${characterId}") {
      asMoveObject { contents { json } }
    }
  }`;

  const charData: any = await gql(charQuery);
  const charJson = charData?.object?.asMoveObject?.contents?.json;
  if (!charJson) return null;

  return {
    name: charJson.metadata?.name || "",
    characterId: charJson.key?.item_id || "",
    tribeId: charJson.tribe_id || 0,
  };
}
