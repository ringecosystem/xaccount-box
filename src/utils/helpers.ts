import { keccak256, toUtf8Bytes } from 'ethers';

/**
 * Pauses the execution for a specified number of milliseconds.
 * @param ms The number of milliseconds to pause.
 * @returns A promise that resolves after the specified number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Generates a keccak256 hash of any serializable object or value.
 *
 * @param data The data to hash (any serializable object or value)
 * @param stringify Custom stringify function (default: JSON.stringify)
 * @returns The keccak256 hash of the input data formatted according to options
 */
export function generateHash<T>(data: T, stringify?: (data: T) => string): string {
  try {
    const dataString = stringify ? stringify(data) : JSON.stringify(data);
    // Generate keccak256 hash
    const hash = keccak256(toUtf8Bytes(dataString));
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
    return '';
  }
}
