import dotenv from "dotenv";
import { existsSync, statSync, writeFileSync } from "fs";
import { DateTime } from "luxon";
import maxmind from "maxmind";
import { basename } from "path";
import { gunzipSync } from "zlib";
import tar from "tar-stream";
import { PassThrough } from "stream";

dotenv.config();

let hasLoggedError = false;

const FILENAME = "GeoLite2-Country.mmdb";
const SRC_URL = process.env.MAXMIND_GEOLITE2_COUNTRY_URL;
const DEST_PATH = (process.env.DATA_DIR || "/tmp") + "/" + FILENAME;

const debug = (...args: any[]) => {
  if (process.env.DEBUG) console.log("[DEBUG]", ...args);
};

const untar = (tarball: Buffer, filename: string) =>
  new Promise<Buffer>((resolve, reject) => {
    const extract = tar.extract();
    const chunks: Buffer[] = [];

    extract.on("entry", (header, stream, next) => {
      if (basename(header.name) === filename) {
        stream.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
      }
      stream.on("end", next);
      stream.resume();
    });

    extract.on("finish", () => {
      if (chunks.length) {
        const data = Buffer.concat(chunks);
        resolve(data);
      }
    });

    extract.on("error", reject);

    const stream = new PassThrough();
    stream.pipe(extract);
    stream.end(tarball);
  });

const download = async () => {
  if (!SRC_URL) throw "Cannot download Maxmind DB: Missing env var";

  const res = await fetch(SRC_URL);
  if (res.ok) {
    const buf = await res.arrayBuffer();
    const gzippedData = gunzipSync(buf);
    const data = await untar(gzippedData, FILENAME);
    writeFileSync(DEST_PATH, data);
    console.log(`Wrote ${DEST_PATH} (${data.length} bytes)`);
    debug(`stat ${DEST_PATH}: ${JSON.stringify(statSync(DEST_PATH), null, 2)}`);
  } else {
    throw `Failed to download Maxmind DB: ${res.status} ${res.statusText}`;
  }
};

export const getCountryForIP = async (ip: string) => {
  if (existsSync(DEST_PATH)) {
    debug("Maxmind DB exists", DEST_PATH);
    const maxAge = DateTime.now().minus({ weeks: 1 });
    debug("Maxmind DB maxAge", maxAge.toISO());
    const lastModified = DateTime.fromJSDate(statSync(DEST_PATH).mtime);
    debug("Maxmind DB lastModified", lastModified.toISO());
    if (lastModified < maxAge) {
      console.log("Maxmind DB is older than 1 week - redownloading");
      await download();
    }
  } else {
    if (!SRC_URL) {
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
    const lookup = await maxmind.open(DEST_PATH);
    const result = lookup.get(ip) as any;
    const code = result?.country?.iso_code || null;
    debug(`Maxmind lookup for ${ip}: ${code}`);
    return code;
  } catch (err: any) {
    console.error(`Error using Maxmind: ${err}`);
    return null;
  }
};
