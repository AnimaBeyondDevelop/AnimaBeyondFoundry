export type WeaponChanges = {
  [key: string]: {
    name: string;
    data: {
      special: number;
      integrity: number;
      breaking: number;
      attack: number;
      block: number;
      damage: number;
      initiative: number;
      critic: {
        primary: string;
        secondary: string;
      };
    };
  };
};
