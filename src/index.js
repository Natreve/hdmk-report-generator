import { vfs, fonts, createPdf } from "pdfmake/build/pdfmake";
import { pdfMake } from "pdfmake/build/vfs_fonts";
import axios from "axios";
import { DateTime } from "luxon";
const compressPDF = async (filename, file) => {
  try {
    //authenicate
    let response = await axios({
      method: "post",
      url: "https://api.ilovepdf.com/v1/auth",
      headers: {},
      data: { public_key: process.env.PUBLICKEY },
    });

    const { token } = response.data;

    //start compress
    response = await axios({
      method: "get",
      url: "https://api.ilovepdf.com/v1/start/compress",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { server, task } = response.data;
    let data = new FormData();
    data.append("file", file, "report.pdf");
    data.append("task", task);
    // upload file
    response = await axios({
      method: "post",
      url: `https://${server}/v1/upload`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data,
    });

    const { server_filename } = response.data;
    //process file
    response = await axios({
      method: "post",
      url: `https://${server}/v1/process`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        task,
        tool: "compress",
        files: [
          {
            server_filename,
            filename,
          },
        ],
      },
    });

    response = await axios({
      method: "get",
      url: `https://${server}/v1/download/${task}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.pdf`);
    document.body.appendChild(link);
    link.click();
    return true;
  } catch (error) {
    throw Error(error);
  }
};
const generatePDF = async (id, printOnly) => {
  return new Promise(async (resolve, reject) => {
    try {
      var url =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;

      var config = {
        method: "get",
        url: `${process.env.ZAPI}/${id}`,
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      };

      const { data } = await axios(config);
      const { data: limitations } = await axios("./limitations.txt");
      const { inspection, inspector, sections, conditions } = data;
      const { sectionSummary, conditionsSummary } = data;
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

      vfs = pdfMake.vfs;
      fonts = {
        Montserrat: {
          bold: `${url}/fonts/Montserrat-SemiBold.ttf`,
          normal: `${url}/fonts/Montserrat-Light.ttf`,
        },
      };

      const dd = {
        pageSize: "LETTER",
        pageMargins: [40, 100, 40, 40],
        header: {
          columns: [
            { image: "logo", width: 150 },
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
                text: `\n\n${inspection.date.started}`,
                alignment: "right",
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
        images: {
          logo: `${url}/images/HDMK.png`,
          cover: inspection.cover,
          // signature: inspector.signature,
        },
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
            comment.images.forEach((image, index) => {
              columns.push({
                image: image.name,
                width: 150,
                height: 150,
                margin: [10, 0],
              });
              if (!comment.images[index + 1])
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
      sections.forEach((section) => {
        dd.content.push({
          text: section.name,
          pageBreak: "before",
          tocItem: true,
          style: ["title"],
        });
        section.items.forEach((item) => {
          dd.content.push({ text: item.name, style: ["header"] });
          item.comments.forEach((comment) => {
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
            comment.images.forEach((image, index) => {
              if (image) {
                dd.images[image.name] = image.url;
                columns.push({
                  image: image.name,
                  width: 150,
                  height: 150,
                  margin: [10, 4],
                });
                if (!comment.images[index + 1]) {
                  return dd.content.push({ columns: columns, columnGap: 8 });
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
            });
          });
        });
      });

      const doc = createPdf(dd);

      doc.getBlob((blob) => {
        resolve(compressPDF(`${street} ${city} ${state} ${zipcode}`, blob));
      });

      // doc.download();
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

const onCreateReport = async () => {
  const id = document.querySelector('input[name="id"').value;
  const printOnly = document.querySelector(
    'input[name="printOnly"]:checked'
  ).value;
  document.querySelector("#create-report").setAttribute("disabled", true);
  document.querySelector("#create-report").innerHTML = "Generating PDF";
  await generatePDF(id, printOnly);
  document.querySelector("#create-report").removeAttribute("disabled");
  document.querySelector("#create-report").innerHTML = "Create Report";
};
document
  .querySelector("#create-report")
  .addEventListener("click", onCreateReport);
