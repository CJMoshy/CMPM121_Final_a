interface Cell {
  readonly i: number;
  readonly j: number;
  planterBox: PlanterBox;
}

interface PlanterBox {
  waterLevel: number;
  sunLevel: number;
  plant: Plant;
}

type PlantSpecies = "something" | "something else" | "A third thing";

declare enum growthLevel {
  seedling,
  sapling,
  adult,
}

interface Plant {
  species: PlantSpecies;
  growthLevel: number;
}
