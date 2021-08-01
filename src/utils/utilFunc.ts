export const clamp = (min: number, max: number, num: number): number => {
    return Math.min(Math.max(num, min), max);
};
