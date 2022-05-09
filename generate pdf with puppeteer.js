const firebase = require("firebase-admin");

const fs = require("fs-extra");
const { tmpdir } = require("os");
const { join, resolve } = require("path");

const Puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");

const createReport = async (data) => {
  try {
    const url = process.env.FUNCTIONS_EMULATOR
      ? `http://localhost:5001/hdmk-inspection/us-central1/app/report/${data.id}`
      : `https://hdmk-inspection.web.app/app/report/${data.id}`;
    const { street, city, state } = data.address;
    const filename = `${street} ${city} ${state}.pdf`;
    const workingDir = join(tmpdir(), "reports"); // the temporary directory to store pdf file
    const filepath = join(workingDir, filename);

    // 1. Ensure directory exists
    await fs.ensureDir(workingDir);

    const browser = await Puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      headless: true,
    });
    const options = { path: filepath, printBackground: true };
    const page = await browser.newPage();
    const bucket = firebase.storage().bucket();

    await page.goto(url, { waitUntil: "networkidle0" });
    await page.pdf(options);
    await browser.close();
    const result = await bucket.upload(filepath, {
      destination: `reports/${filename}`,
      public: true,
      metadata: {
        contentType: "application/pdf",
        firebaseStorageDownloadTokens: uuidv4(),
      },
    });
    // 2.  Cleanup, remove working directory from filesystem
    fs.remove(workingDir);
    return result;
  } catch (error) {
    throw error;
  }
};
