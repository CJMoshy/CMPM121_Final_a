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

type PlantSpecies = "Flytrap" | "Wheat" | "Aloe Vera" | "none";

interface Plant {
  species: PlantSpecies;
  growthLevel: number;
}
