// const express = require("express");
// const app = express();
// const port = 3000;
// app.use(express.static("public"));
// app.get("/api", (req, res) => {
//   res.send("endpoint");
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
import puppeteer from "puppeteer";
import * as fs from "fs";
import path from "path"
import Handlebars from "handlebars";
import asyncHelpers from "handlebars-async-helpers";
import axios from "axios";
import dotenv from "dotenv"
import { DateTime } from "luxon"
import sharp from "sharp"

const hbs = asyncHelpers(Handlebars)
dotenv.config()

async function getReport(id) {
  var config = {
    method: 'get',
    url: `https://hdmk-inspection.web.app/app/api/report/${id}`,
    headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
  };

  try {
    let response = await axios(config)
    return response.data
  } catch (error) {
    console.log("There was an error getting inspection record", error.message);
  }

}

/**
 * Handlebars custom helpers
 */

//Datetime helpers
hbs.registerHelper("date", (context) => {
  let date = DateTime.fromJSDate(new Date(context))
  return new hbs.SafeString(`<time>${date.toLocaleString(DateTime.DATE_SHORT)}</time>`)
})
hbs.registerHelper("time", (context) => {
  let date = DateTime.fromJSDate(new Date(context))
  return new hbs.SafeString(`<time>${date.toLocaleString(DateTime.TIME_SIMPLE)}</time>`)
})

//Image gallery helper
hbs.registerHelper("gallery", (context) => {

  let gallery = "<div class='gallery'>"

  for (let i = 0; i < context.length; i++) {
    if (context[i].type === "image/jpeg" && context[i].uploaded) {
      gallery += `<div class="image"><img src="${context[i].url}" alt="${context[i].name}" /></div>`
    }


  }

  return `${gallery} </div>`
})

hbs.registerHelper("image", async function () {
  const [url, width, height] = Array.prototype.slice.call(arguments, 0, arguments.length - 1)
  const { data: input } = await axios({ url, responseType: "arraybuffer" })

  const output = await sharp(input).resize(width, height).jpeg().toBuffer()
  const base64 = `data:image/jpeg;base64,${output.toString('base64')}`
  
  return new hbs.SafeString(`<img src="${base64}"/>`)

})
async function createReport(data, options) {
  const source = path.resolve(`templates/${options?.template || "report@1.0.hbs"}`)
  const html = await hbs.compile(fs.readFileSync(source, "utf-8"))(data)
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ]
  })
  const page = await browser.newPage()
  const config = { format: "A4", printBackgroud: true, path: `report1.pdf`, margin: { top: "0.5cm", right: "1cm", bottom: "0.8cm", left: "1cm" } }
  await page.setContent(html)
  await page.pdf(config)
  await browser.close()
}

await createReport(JSON.parse(fs.readFileSync("./record_16185.json")))
