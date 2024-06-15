import dotenv from "dotenv";
import { existsSync, statSync, writeFileSync } from "fs";
import { get } from "https";
import { DateTime } from "luxon";
import maxmind from "maxmind";
import { basename } from "path";
import tar from "tar-stream";
import { createGunzip } from "zlib";

dotenv.config();

let hasLoggedError = false;

const filename = "GeoLite2-Country.mmdb";
const path = (process.env.DATA_DIR || "/tmp") + "/" + filename;
const url = process.env.MAXMIND_GEOLITE2_COUNTRY_URL;

const debug = (...args: any[]) => {
  if (process.env.DEBUG) console.log("[DEBUG]", ...args);
};

const download = async () => {
  if (!url) throw "Cannot download Maxmind DB: Missing env var";

  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    const chunks: any[] = [];

    extract.on("entry", (header, stream, next) => {
      if (basename(header.name) === filename) {
        stream.on("data", (chunk) => {
          chunks.push(chunk);
        });
      }
      stream.on("end", () => {
        next();
      });
      stream.resume();
    });

    extract.on("finish", () => {
      if (chunks.length) {
        const data = Buffer.concat(chunks);
        writeFileSync(path, data);
        console.log(`Wrote ${path} (${data.length} bytes)`);
        console.log(`stat ${path}: ${JSON.stringify(statSync(path), null, 2)}`);
      }
    });

    console.log(`Downloading ${filename}...`);
    debug(`GET ${url}`);
    get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(createGunzip()).pipe(extract);
      } else {
        reject(
          `Failed to download Maxmind DB: ${res.statusCode} ${res.statusMessage}`,
        );
      }
    });
  });
};

export const getCountryForIP = async (ip: string) => {
  if (existsSync(path)) {
    debug("Maxmind DB exists", path);
    const maxAge = DateTime.now().minus({ weeks: 1 });
    debug("Maxmind DB maxAge", maxAge.toISO());
    const lastModified = DateTime.fromJSDate(statSync(path).mtime);
    debug("Maxmind DB lastModified", lastModified.toISO());
    if (lastModified < maxAge) {
      console.log("Maxmind DB is older than 1 week - redownloading");
      await download();
    }
  } else {
    if (!url) {
      if (!hasLoggedError) {
        console.error("Cannot lookup IP - Need MAXMIND_GEOLITE2_COUNTRY_URL");
        hasLoggedError = true;
      }
      return;
    }
    console.log("Maxmind DB not found - downloading");
    await download();
  }

  try {
    const lookup = await maxmind.open(path);
    const result = lookup.get(ip) as any;
    return result?.country?.iso_code || null;
  } catch (err: any) {
    console.error(`Error using Maxmind: ${err}`);
    return null;
  }
};
