import Redis from "ioredis";
import { customAlphabet } from "nanoid";

let redis: Redis | null = null;

/**
 * Creates a Redis client instance if it doesn't exist.
 * @returns {Redis | undefined} The Redis client instance or undefined if creation failed.
 */

export const createRedisClient = (): Redis | undefined => {
  if (redis) {
      return redis
  };
  try {
    redis = new Redis();
    redis.on("error", (error) => {
      console.error("Redis error == ", error);
    });
    return redis
  } catch (error) {
    console.error("Failed to create Redis client", error);
    return undefined;
  }
}

/**
 * Retrieves the existing Redis client instance.
 * @throws {Error} If the Redis client instance does not exist.
 * @returns {Redis} The Redis client instance.
 */
export const getRedisClient = (): Redis => {
  if (!redis) {
    throw new Error("Redis client does not exist");
  }
  return redis;
};

/**
 * Terminates the Redis client instance if it exists.
 */
export const terminate = (): void => {
  redis?.disconnect();
}

/**
 * Closes the Redis client connection gracefully.
 * @returns {Promise<void>} A promise that resolves when the connection is closed.
 */
export const closeRedisClient = async (): Promise<void> => {
  redis?.quit()
  .then(() => {
    redis = null;
  })
  .catch((error) => {
    console.error("Failed to close Redis client ", error);
    redis?.disconnect();
  });
}

/**
 * Deletes key-value pairs from Redis that match the given pattern.
 * @param {string} pattern - The pattern to match keys against.
 * @returns {Promise<void>} A promise that resolves when the keys are deleted.
 */
export const deleteKeyPairsRedis = async (pattern: string): Promise<void> => {    
  return new Promise((resolve, reject) => {
    const stream = redis?.scanStream({
      match: pattern,
      count: 100,
    })
    stream?.on("data", (keys) => {
      if (keys.length) {
        redis?.mget(keys)
          .then(async (results) => {
            await redis?.unlink(keys);
            const keysDeleted = results.filter((result) => result !== null) as string[];
            if(keysDeleted.length) {
              await redis?.unlink(keysDeleted);
            }
          })
        .catch((error) => {
          console.error("Failed to delete keys from Redis ", error);
        });  
      }
    });

    stream?.on("end", () => {
      resolve();
    });

    stream?.on("error", (error) => {
      reject(error);
    });
  });   
}

/**
 * Generates a unique random ID for email verification.
 * @returns {Promise<string>} A promise that resolves with the unique random ID.
 */
export const createRandomId = async (): Promise<string> => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const generateNanoId = customAlphabet(chars, 12);
  const redisClient = getRedisClient();
  let exists = true;
  let result;
  
  while (exists) {
    result = generateNanoId();
    const id = await redisClient.get(`emailId::${result}`);
    // Keep checking until the ID is unique
    exists = !!id;
  }
  return result as string;  // Return the unique random ID once found
}