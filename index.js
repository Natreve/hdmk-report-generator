// import express from "express"
// const app = express();
// const port = 3000;
// app.use(express.static("public"));
// app.get("/api", (req, res) => {
//   res.send("endpoint");
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });

import axios from "axios";
import sharp from "sharp"
import { DateTime } from "luxon";
import * as fs from "fs"
import PdfPrinter from "pdfmake";

const optimizeImage = async (url, width, height) => {
  try {
    let response = await axios({ url, responseType: "arraybuffer" })
    let output = await sharp(response.data).resize({ fit: sharp.fit.contain, width }).jpeg({ quality: 100 }).toBuffer()
    return `data:image/jpeg;base64,${output.toString('base64')}`
  } catch (error) {
    throw Error(error.message)
  }
}
const getImage = async (url) => {
  let response = await axios({ url, responseType: "arraybuffer" })
  let output = await sharp(response.data).png().toBuffer()

  return `data:image/png;base64,${output.toString('base64')}`

}
const generatePDF = async (id, printOnly) => {
  return new Promise(async (resolve, reject) => {
    try {

      let record = JSON.parse(fs.readFileSync("./record_16185.json"))
      let limitations = fs.readFileSync("./public/limitations.txt", { encoding: "utf8" })

      const { inspection, inspector, sections, conditions } = record;
      const { sectionSummary, conditionsSummary } = record;
      const { client, address } = inspection;
      const { street, city, state, zipcode } = address;

      const startDate = DateTime.fromJSDate(
        new Date(inspection.date.started)
      ).toLocaleString(DateTime.DATE_SHORT);
      const endDate = DateTime.fromJSDate(
        new Date(inspection.date.ended)
      ).toLocaleString(DateTime.DATE_SHORT);
      const startTime = DateTime.fromJSDate(
        new Date(inspection.date.started)
      ).toLocaleString(DateTime.TIME_SIMPLE);
      const endTime = DateTime.fromJSDate(
        new Date(inspection.date.ended)
      ).toLocaleString(DateTime.TIME_SIMPLE);


      let fonts = {
        Montserrat: {
          bold: `./public/fonts/Montserrat-SemiBold.ttf`,
          normal: `./public/fonts/Montserrat-Light.ttf`,
        },
      };
      let printer = new PdfPrinter(fonts)
      //Get logo, default cover and cover image
      let logo = await getImage(`https://firebasestorage.googleapis.com/v0/b/hdmk-inspection.appspot.com/o/public%2FHDMK.png?alt=media`)
      let cover = await optimizeImage(inspection.cover, 530)

      const dd = {
        pageSize: "LETTER",
        pageMargins: [40, 100, 40, 40],
        header: {
          columns: [
            { image: "logo", width: 100 },
            {
              text: `${inspector.fname} ${inspector.lname}\n${inspector.licence_number}\n${inspector.phone} \n${inspector.email}`,
              alignment: "right",
              fontSize: 12,
              bold: true,
            },
          ],
          margin: [40, 20],
        },
        footer: function (currentPage, pageCount) {
          return {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: "center",
            margin: [0, 0, 0, 50],
          };
        },
        content: [
          { image: "cover", width: 530, margin: [0, 20] },
          {
            columns: [
              {
                text: `${client.name}\n${street}\n${city} ${state} ${zipcode}`,
                bold: true,
              },
              {
                text: `\n\n${startDate}`,
                alignment: "right",
              },
            ],
          },
          {
            toc: {
              title: {
                text: "INSPECTION REPORT INDEX",
                pageBreak: "before",
                style: ["title"],
              },
            },
          },
        ],
        styles: {
          title: { fontSize: 36, bold: true, margin: [0, 5] },
          header: { fontSize: 24, bold: true, margin: [0, 5] },
          subHeader: { fontSize: 14, bold: true, margin: [0, 5] },
          limitation: { fontSize: 7 },
        },
        defaultStyle: {
          font: "Montserrat",
        },
        images: { logo, cover },
      };

      dd.content.push({
        text: `INSPECTION CONDITIONS`,
        pageBreak: "before",
        tocItem: true,
        style: ["title"],
      });
      dd.content.push({
        text: `CLIENT & SITE INFORMATION`,
        style: ["header"],
      });
      dd.content.push({
        layout: "noBorders",
        margin: [20, 0],
        table: {
          widths: "*",
          body: [
            [
              { text: "DATE OF INSPECTION:", style: ["subHeader"] },
              { text: startDate, margin: [0, 3] },
            ],
            [
              { text: "START TIME:", style: ["subHeader"] },
              { text: startTime, margin: [0, 3] },
            ],
            [
              { text: "END TIME:", style: ["subHeader"] },
              { text: endTime, margin: [0, 3] },
            ],
            [
              { text: "CLIENT NAME:", style: ["subHeader"] },
              { text: client.name, margin: [0, 3] },
            ],
            [
              { text: "CITY & STATE:", style: ["subHeader"] },
              {
                text: `${city}, ${state} ${zipcode}`,
                margin: [0, 3],
              },
            ],
          ],
        },
      });
      dd.content.push({ text: "PAYMENT INFORMATION:", style: ["header"] });
      dd.content.push({
        layout: "noBorders",
        table: {
          widths: "*",
          body: [
            [
              { text: "TOTAL FEE:", style: ["subHeader"] },
              { text: `$${inspection.fee}`, margin: [0, 3] },
            ],
            // ["SIGNATURE:", { image: "signature", width: 100 }],
          ],
        },
      });
      //Render conditions
      conditions.forEach((condition) => {
        dd.content.push({ text: condition.name, style: ["header"] });
        condition.comments.forEach((comment) => {
          dd.content.push({
            layout: "noBorders",
            table: {
              widths: "*",
              body: [
                [
                  { text: comment.name, style: ["subHeader"] },
                  {
                    text: comment.text,
                    margin: [0, 3],
                  },
                ],
              ],
            },
          });
        });
      });
      dd.content.push({
        text: "REPORT LIMITATIONS:",
        pageBreak: "before",
        tocItem: true,
        style: ["title"],
      });

      dd.content.push({ text: limitations, style: ["limitation"] });
      //RENDER SUMMARY
      dd.content.push({
        text: `REPORT SUMMARY`,
        pageBreak: "before",
        tocItem: true,
        style: ["title"],
      });
      sectionSummary.forEach((section) => {
        dd.content.push({ text: section.name, style: ["header"] });
        section.items.forEach((item) => {
          dd.content.push({
            text: item.name,
            style: ["subHeader"],
            margin: [10, 0],
          });
          item.comments.forEach((comment) => {
            let columns = [];
            dd.content.push({
              stack: [
                { text: comment.name, margin: [20, 5, 0, 5] },
                { text: comment.text, margin: [20, 5, 0, 5] },
              ],
            });
            comment.media.forEach((media, index) => {
              if (media.type === "image/jpeg" && media.uploaded) {
                columns.push({
                  image: media.name,
                  width: 150,
                  height: 150,
                  margin: [10, 4],
                });
              }
              if (!comment.media[index + 1])
                return dd.content.push({ columns: columns, columnGap: 8 });
              if (!(columns.length % 3)) {
                dd.content.push({ columns: columns, columnGap: 8 });
                columns = [];
              }
            });
          });
        });
      });
      conditionsSummary.forEach((condition) => {
        dd.content.push({ text: condition.name, style: ["header"] });
        condition.comments.forEach((comment) => {
          dd.content.push({
            stack: [
              { text: comment.name, margin: [20, 5, 0, 5] },
              { text: comment.text, margin: [20, 5, 0, 5] },
            ],
          });
        });
      });
      //RENDER SECTIONS
      for (const key in sections) {
        let section = sections[key]

        dd.content.push({
          text: section.name,
          pageBreak: "before",
          tocItem: true,
          style: ["title"],
        });
        for (const key in section.items) {
          let item = section.items[key]
          dd.content.push({ text: item.name, style: ["header"], margin: [10, 0], });
          for (const key in item.comments) {
            let comment = item.comments[key]
            let columns = [];
            dd.content.push({
              stack: [
                {
                  text: comment.name,
                  style: ["subHeader"],
                  margin: [10, 5, 0, 5],
                },
                { text: comment.text, margin: [10, 5, 0, 5] },
              ],
            });
            for (const key in comment.media) {
              let media = comment.media[key] || {}

              if (media?.type === "image/jpeg" && media?.uploaded) {

                let image = await optimizeImage(media.url, 150)
                dd.images[media.name] = image
                columns.push({
                  image: media.name,
                  width: 150,
                  height: 150,
                  margin: [10, 4],
                });

                if (!comment.media[parseInt(key) + 1]) {

                  dd.content.push({ columns: columns, columnGap: 8 });
                  continue
                }

                if (!(columns.length % 3)) {

                  dd.content.push({
                    columns: columns,
                    columnGap: 8,
                    margin: [0, 4],
                  });
                  columns = [];
                }
              }

            }
          }
        }
      }

      const doc = printer.createPdfKitDocument(dd, {})

      doc.pipe(fs.createWriteStream(`${street} ${city} ${state} ${zipcode}.pdf`))
      doc.end()
      resolve(record);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
generatePDF()