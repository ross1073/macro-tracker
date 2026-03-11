export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "USDA API key not configured" }), { status: 500 });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "query required" }), { status: 400 });
    }

    // Search branded foods first, then fall back to SR Legacy / Foundation
    const results = [];
    for (const dataType of ["Branded", "SR Legacy,Foundation"]) {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&dataType=${encodeURIComponent(dataType)}&pageSize=5`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.foods && data.foods.length > 0) {
        for (const food of data.foods) {
          const nutrients = {};
          for (const n of food.foodNutrients || []) {
            const name = n.nutrientName;
            if (name === "Energy") nutrients.calories = n.value;
            else if (name === "Protein") nutrients.protein = n.value;
            else if (name === "Total lipid (fat)") nutrients.fat = n.value;
            else if (name === "Carbohydrate, by difference") nutrients.carbs = n.value;
            else if (name === "Sugars, total including NLEA") nutrients.sugar = n.value;
            else if (name === "Fiber, total dietary") nutrients.fiber = n.value;
            else if (name === "Cholesterol") nutrients.cholesterol = n.value;
          }
          results.push({
            fdcId: food.fdcId,
            description: food.description,
            brand: food.brandName || food.brandOwner || null,
            dataType: food.dataType,
            servingSize: food.servingSize || null,
            servingSizeUnit: food.servingSizeUnit || "g",
            householdServingText: food.householdServingFullText || null,
            nutrients,
          });
        }
        break; // Use first dataType that returns results
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};

export const config = {
  path: "/api/usda-search",
};
