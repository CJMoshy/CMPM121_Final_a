import GAME_CONFIG from "../util/GameConfig.ts";

export default class PlantManager {
  private scene: Phaser.Scene;
  private plantableCellsBuffer: ArrayBuffer;
  private plantableCellsView: DataView;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.plantableCellsBuffer = new ArrayBuffer(
      GAME_CONFIG.STORAGE.CELL_SIZE_IN_BYTES *
        GAME_CONFIG.STORAGE.CELLS_IN_GRID,
    );
    this.plantableCellsView = new DataView(this.plantableCellsBuffer);
  }

  getPlantableCellBuffer() {
    return this.plantableCellsBuffer;
  }

  setPlantableCellBuffer(buf: ArrayBuffer) {
    this.plantableCellsBuffer = buf;
    this.plantableCellsView = new DataView(buf);
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
    }
  }

  getNearbyPlants(): number {
    return this.getAllPlantableCells().filter((cell) =>
      cell.planterBox.plant.species !== "none"
    ).length - 1;
  }

  addPlantableCell(index: number, cell: Cell) {
    const offset = index *
      GAME_CONFIG.STORAGE.CELL_SIZE_IN_BYTES;
    let byteOffset = offset;

    const incrementByteOffset8 = () => byteOffset += 8;
    const incrementByteOffset1 = () => byteOffset += 1;

    // i and j
    this.plantableCellsView.setFloat64(byteOffset, cell.i);
    incrementByteOffset8();
    this.plantableCellsView.setFloat64(byteOffset, cell.j);
    incrementByteOffset8();

    // water and sun levels
    this.plantableCellsView.setUint8(
      byteOffset,
      cell.planterBox.waterLevel,
    );
    incrementByteOffset1();
    this.plantableCellsView.setUint8(byteOffset, cell.planterBox.sunLevel);
    incrementByteOffset1();

    this.plantableCellsView.setUint8(
      byteOffset,
      cell.planterBox.plant.growthLevel,
    );
    incrementByteOffset1();

    const PlantSpeciesEnum = {
      "none": 0,
      "Flytrap": 1,
      "Wheat": 2,
      "Aloe Vera": 3,
    };
    this.plantableCellsView.setUint8(
      byteOffset,
      PlantSpeciesEnum[cell.planterBox.plant.species],
    );
    incrementByteOffset1();
  }

  getPlantableCell(index: number): Cell {
    const offset = index * GAME_CONFIG.STORAGE.CELL_SIZE_IN_BYTES;
    let byteOffset = offset;

    // Deserialize fields in order
    const i = this.plantableCellsView.getFloat64(byteOffset);
    byteOffset += 8;
    const j = this.plantableCellsView.getFloat64(byteOffset);
    byteOffset += 8;

    const waterLevel = this.plantableCellsView.getUint8(byteOffset);
    byteOffset += 1;
    const sunLevel = this.plantableCellsView.getUint8(byteOffset);
    byteOffset += 1;

    const growthLevel = this.plantableCellsView.getUint8(byteOffset);
    byteOffset += 1;

    const speciesIndex = this.plantableCellsView.getUint8(byteOffset);
    const plantSpeciesEnumReverse: PlantSpecies[] = [
      "none",
      "Flytrap",
      "Wheat",
      "Aloe Vera",
    ];

    const species = plantSpeciesEnumReverse[speciesIndex];
    byteOffset += 1;

    return {
      i,
      j,
      planterBox: {
        waterLevel,
        sunLevel,
        plant: {
          species,
          growthLevel,
        },
      },
    };
  }

  getAllPlantableCells() {
    const plantableCells: Cell[] = [];
    for (let x = 0; x < 8; x++) {
      plantableCells.push(this.getPlantableCell(x));
    }
    return plantableCells;
  }
}
