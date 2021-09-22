export const calculateATReductionByQuality = (quality: number): number => {
  if (quality <= 0) {
    return 0;
  }
  return Math.round(quality / 5);
};
