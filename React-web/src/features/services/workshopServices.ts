const GOOGLE_MAPS_API_KEY = 'AIzaSyB8bqefbnONT_D8Iybubgv_DOfkx_w3JQY';

export interface WorkshopListItem {
  id: string;
  title: string;
  location: string;
  img: string;
  rating: number;
  reviews: number;
  priceLevel: number;
  priceText: string;
  isOpen: boolean;
  bookedToday: number;
  displayPrice: number;
}

export const fetchSingaporeWorkshops = async (): Promise<WorkshopListItem[]> => {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const requestBody = {
    textQuery: 'car repair workshops in Singapore',
    locationBias: {
      circle: {
        center: { latitude: 1.3521, longitude: 103.8198 },
        radius: 15000.0
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        // Crucial: regularOpeningHours fixes the "Open Now" status
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.userRatingCount,places.photos,places.regularOpeningHours'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!data.places) return [];

    return data.places.map((place: any): WorkshopListItem => {
      const priceLabels: Record<number, string> = { 1: "Inexpensive", 2: "Moderate", 3: "Premium", 4: "Luxury" };
      
      // FIX: Changed maxWidthProp to maxWidthPx to resolve 403 error
      const photoName = place.photos?.[0]?.name;
      const imageUrl = photoName 
        ? `https://places.googleapis.com/v1/${photoName}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthPx=800`
        : `https://loremflickr.com/800/450/car,workshop?lock=${place.id}`;

      return {
        id: place.id,
        title: place.displayName.text,
        location: place.formattedAddress.split(', Singapore')[0],
        img: imageUrl,
        rating: place.rating || 0,
        reviews: place.userRatingCount || 0,
        priceLevel: place.priceLevel || 2,
        priceText: priceLabels[place.priceLevel] || "Fair Price",
        isOpen: place.regularOpeningHours?.openNow ?? true,
        // Mocking a "booked today" count based on reviews for UI depth
        bookedToday: Math.floor((place.userRatingCount || 10) / 20) + 1,
        displayPrice: (place.priceLevel || 2) * 45 + 15 
      };
    });
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};