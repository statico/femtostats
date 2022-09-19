import dotenv from "dotenv";
import maxmind from "maxmind";
import {
  createReadStream,
  existsSync,
  statSync,
  writeFile,
  writeFileSync,
} from "fs";
import { DateTime } from "luxon";
import tar from "tar-stream";
import { createGunzip } from "zlib";
import { get } from "https";
import { basename } from "path";

dotenv.config();

let hasLoggedError = false;

const filename = "GeoLite2-Country.mmdb";
const path = (process.env.DATA_DIR || "/tmp") + "/" + filename;
const url = process.env.MAXMIND_GEOLITE2_COUNTRY_URL;

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
      }
    });

    console.log(`Downloading ${filename}...`);
    get(url, (res) => {
      res.pipe(createGunzip()).pipe(extract);
    });
  });
};

export const getCountryForIP = async (ip: string) => {
  if (existsSync(path)) {
    const maxAge = DateTime.now().minus({ weeks: 1 });
    const lastModified = DateTime.fromJSDate(statSync(path).mtime);
    if (lastModified < maxAge) await download();
  } else {
    if (!url) {
      if (!hasLoggedError) {
        console.error("Cannot lookup IP - Need MAXMIND_GEOLITE2_COUNTRY_URL");
        hasLoggedError = true;
      }
      return;
    }
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
