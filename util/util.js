import fs from "fs";
import Jimp from "jimp";
import https from "https";
import http from "http";

// Download an image from a public URL.
// Handles redirects and sends a User-Agent required by some hosts.
function downloadImage(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      return reject(new Error("Too many redirects"));
    }

    const client = url.startsWith("https://") ? https : http;

    const request = client.get(
      url,
      {
        headers: {
          "User-Agent": "UdacityImageFilter/1.0 (https://github.com/udacity/cd12099-Full-Stack-Apps-AWS)",
          "Accept": "image/*"
        }
      },
      (response) => {
        // Follow redirects
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          const nextUrl = new URL(response.headers.location, url).toString();
          response.resume();
          return resolve(downloadImage(nextUrl, redirects + 1));
        }

        if (response.statusCode !== 200) {
          response.resume();
          return reject(
            new Error(`Image download failed: HTTP ${response.statusCode}`)
          );
        }

        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );

    request.on("error", reject);
  });
}

// Download, filter and save image locally
export async function filterImageFromURL(inputURL) {
  const imageBuffer = await downloadImage(inputURL);

  const photo = await Jimp.read(imageBuffer);

  const outpath =
    "/tmp/filtered." + Math.floor(Math.random() * 200000) + ".jpg";

  await photo
    .resize(256, 256)
    .quality(60)
    .greyscale()
    .writeAsync(outpath);

  return outpath;
}

// Delete temporary files
export async function deleteLocalFiles(files) {
  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}