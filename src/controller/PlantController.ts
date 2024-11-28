export default class PlantManager {
  private scene: Phaser.Scene;
  private plantableCells: Cell[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  updatePlantGrowth(cell: Cell) {
    const { plant, sunLevel, waterLevel } = cell.planterBox;
    if (plant.species === "none") return;

    const plantRules = this.scene.cache.json.get(
      "plantGrowthReq",
    ) as PlantsData;
    const rule = plantRules.plants.find((p) => p.name === plant.species);

    if (!rule) return;

    let _required;
    switch (plant.growthLevel) {
      case 0:
        _required = rule.grow.seedling;
        break;
      case 1:
        _required = rule.grow.sapling;
        break;
      case 2:
        _required = rule.grow.adult;
        break;
      default:
        return;
    }

    if (
      this.getNearbyPlants() >= _required.proximity &&
      sunLevel >= _required.sunlevel &&
      waterLevel >= _required.waterlevel
    ) {
      cell.planterBox.plant.growthLevel++;
      cell.planterBox.sunLevel -= _required.sunlevel;
      cell.planterBox.waterLevel -= _required.waterlevel;
      cell.planterBox.plant.sprite?.setTexture(cell.planterBox.plant.species + "Level" + cell.planterBox.plant.growthLevel);
    }
  }

  getNearbyPlants(): number {
    return this.plantableCells.filter((cell) =>
      cell.planterBox.plant.species !== "none"
    ).length - 1;
  }

  addPlantableCell(cell: Cell) {
    this.plantableCells.push(cell);
  }

  getCells() {
    return this.plantableCells;
  }

  getPlantSprite(): string{
    
    return "player";
  }
}
