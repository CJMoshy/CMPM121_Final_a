// Universal game config for project

const GAME_CONFIG = {
  UI: {
    BORDER_PADDING: 50,
    TEXT_PADDING: 65,
  },
  TIME: {
    IN_GAME_HOUR: 50,
    timeStamps: [
      "12:00AM",
      "1:00AM",
      "2:00AM",
      "3:00AM",
      "4:00AM",
      "5:00AM",
      "6:00AM",
      "7:00AM",
      "8:00AM",
      "9:00AM",
      "10:00AM",
      "11:00AM",
      "12:00PM",
      "1:00PM",
      "2:00PM",
      "3:00PM",
      "4:00PM",
      "5:00PM",
      "6:00PM",
      "7:00PM",
      "8:00PM",
      "9:00PM",
      "10:00PM",
      "11:00PM",
    ],
  },
  STORAGE: {
    CELL_SIZE_IN_BYTES: 24,
    CELLS_IN_GRID: 8,
  },
} as const;

export const enum plantGrowthLevel {
  seedling,
  sapling,
  adult,
}

export default GAME_CONFIG;
