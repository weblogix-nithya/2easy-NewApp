// utils/autocomplete.ts

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function fetchSuggestions(input: string, signal?: AbortSignal) {
  if (!GOOGLE_API_KEY || !input) return [];

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places:autocomplete?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          languageCode: "en",
          regionCode: "AU",
          includedRegionCodes: ["AU"],
        }),
        signal,
      }
    );

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    if ((error as Error).name !== "AbortError") {
      console.error("Autocomplete fetch error:", error);
    }
    return [];
  }
}

export async function fetchPlaceDetails(placeId: string) {
  if (!GOOGLE_API_KEY || !placeId) return null;

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_API_KEY}&fields=formattedAddress,location,addressComponents,displayName`
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Place details fetch error:", error);
    return null;
  }
}

export function getAddressComponent(components: any[], type: string): string {
  return (
    components.find((c: any) => c.types?.includes(type))?.longText || ""
  );
}
