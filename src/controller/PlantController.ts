import GAME_CONFIG from "../util/GameConfig.ts";

export default class PlantManager {
  private scene: Phaser.Scene;
  private plantableCellsBuffer: ArrayBuffer; // updated storage mech
  private plantableCellsView: DataView; // used to set,get from array buffer

  constructor(scene: Phaser.Scene) {
    this.scene = scene; // copy scene ref
    this.plantableCellsBuffer = new ArrayBuffer( // init a new buffer
      GAME_CONFIG.STORAGE.CELL_SIZE_IN_BYTES *
        GAME_CONFIG.STORAGE.CELLS_IN_GRID,
    );
    this.plantableCellsView = new DataView(this.plantableCellsBuffer); // tie view to buffer
  }

  // getter for buffer
  getPlantableCellBuffer() {
    return this.plantableCellsBuffer;
  }

  // setter
  setPlantableCellBuffer(buf: ArrayBuffer) {
    this.plantableCellsBuffer = buf;
    this.plantableCellsView = new DataView(buf);
  }

  // works on cell type, must be deserialized from arraybuf
  updatePlantGrowth(cell: Cell) {
    const { plant, sunLevel, waterLevel } = cell.planterBox; // destructure from main obj
    if (plant.species === "none") return; // if there isnt a plant here then move on

    const plantRules = this.scene.cache.json.get(
      "plantGrowthReq",
    ) as PlantsData;
    const rule = plantRules.plants.find((p) => p.name === plant.species); // get the specific growth rule for this plant type

    if (!rule) return; // if we didnt find a rule then dip

    // find which stage of the rule to query the plant wiht
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

    // query the plants
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

  // helper to get plants near the current plant
  getNearbyPlants(): number {
    return this.getAllPlantableCells().filter((cell) =>
      cell.planterBox.plant.species !== "none"
    ).length - 1; // 'this' plant shouldnt be counted TODO FIX
  }

  addPlantableCell(index: number, cell: Cell) {
    const offset = index *
      GAME_CONFIG.STORAGE.CELL_SIZE_IN_BYTES;
    let byteOffset = offset;

    // helpers to step through the array
    const incrementByteOffset = (val: number) => byteOffset += val;

    // i and j
    this.plantableCellsView.setFloat64(byteOffset, cell.i);
    incrementByteOffset(8);
    this.plantableCellsView.setFloat64(byteOffset, cell.j);
    incrementByteOffset(8);

    // water and sun levels
    this.plantableCellsView.setUint8(
      byteOffset,
      cell.planterBox.waterLevel,
    );
    incrementByteOffset(1);
    this.plantableCellsView.setUint8(byteOffset, cell.planterBox.sunLevel);
    incrementByteOffset(1);

    // growth level
    this.plantableCellsView.setUint8(
      byteOffset,
      cell.planterBox.plant.growthLevel,
    );
    incrementByteOffset(1);

    // map the plant names to numbers for less storage space
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
    incrementByteOffset(1);
  }

  // deserialization method for a given cell
  getPlantableCell(index: number): Cell {
    const offset = index * GAME_CONFIG.STORAGE.CELL_SIZE_IN_BYTES; // where in the buffer we at
    let byteOffset = offset;

    const incrementByteOffset = (val: number) => byteOffset += val;
    // Deserialize fields in order
    const i = this.plantableCellsView.getFloat64(byteOffset);
    incrementByteOffset(8);
    const j = this.plantableCellsView.getFloat64(byteOffset);
    incrementByteOffset(8);

    const waterLevel = this.plantableCellsView.getUint8(byteOffset);
    incrementByteOffset(1);
    const sunLevel = this.plantableCellsView.getUint8(byteOffset);
    incrementByteOffset(1);

    const growthLevel = this.plantableCellsView.getUint8(byteOffset);
    incrementByteOffset(1);

    const speciesIndex = this.plantableCellsView.getUint8(byteOffset);
    const plantSpeciesEnumReverse: PlantSpecies[] = [
      "none",
      "Flytrap",
      "Wheat",
      "Aloe Vera",
    ];

    const species = plantSpeciesEnumReverse[speciesIndex];
    incrementByteOffset(1);

    // returns a cell associated with the given index
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

  // get all indexes as a Cell[]
  getAllPlantableCells() {
    const plantableCells: Cell[] = [];
    for (let x = 0; x < 8; x++) {
      plantableCells.push(this.getPlantableCell(x));
    }
    return plantableCells;
  }
}
