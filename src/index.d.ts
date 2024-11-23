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
  sprite: Phaser.GameObjects.Sprite | undefined;
}

interface GrowthStage {
  sunlevel: number;
  waterlevel: number;
  proximity: number;
}

interface JsonPlant {
  name: string;
  grow: {
    seedling: GrowthStage;
    sapling: GrowthStage;
    adult: GrowthStage;
  };
}

interface PlantsData {
  plants: JsonPlant[];
}

interface PlantRequirement {
  ammount: number;
  growthLevel: number;
}

interface LevelRequirement {
  plants: Record<string, PlantRequirement>; // The key is the plant name (e.g., 'Flytrap', 'Wheat')
}

interface Level {
  levelNum: number;
  requirements: LevelRequirement;
}

interface LevelsData {
  levels: Level[];
}
