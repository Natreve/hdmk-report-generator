import { vfs, fonts, createPdf } from "pdfmake/build/pdfmake";
import { pdfMake } from "pdfmake/build/vfs_fonts";
import axios from "axios";
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
    link.setAttribute("download", filename);
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
      const endpoint = `${process.env.API}${id}`;
      const { data } = await axios.get(endpoint);
      const { data: limitations } = await axios("/limitations.txt");
      const { inspection, inspector, layout } = data;
      const { client, address } = inspection;
      const { street, city, state, zipcode } = address;
      vfs = pdfMake.vfs;
      fonts = {
        Montserrat: {
          bold: `${window.location.href}/fonts/Montserrat-SemiBold.ttf`,
          normal: `${window.location.href}/fonts/Montserrat-Regular.ttf`,
        },
      };

      const dd = {
        pageSize: "LETTER",
        pageMargins: [20, 100, 20, 40],
        header: {
          columns: [
            { image: "logo", width: 150 },
            {
              text: `${inspector.fname} ${inspector.lname}\n${inspector.licence_number}\n${inspector.phone} \n${inspector.email}`,
              alignment: "right",
            },
          ],
          margin: [20, 20],
        },
        footer: function (currentPage, pageCount) {
          return {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: "center",
            margin: [0, 20, 0, 5],
          };
        },
        content: [
          {
            columns: [
              {
                text: `${client.name}\n${street}\n${city} ${state} ${zipcode}`,
              },
              { text: `\n\n${inspection.date.started}`, alignment: "right" },
            ],
          },
          { image: "cover", width: 570, margin: [0, 20] },
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
          title: { fontSize: 30, bold: true, margin: [0, 5] },
          header: { fontSize: 18, bold: true, margin: [0, 5] },
          subHeader: { fontSize: 14, bold: true, margin: [0, 5] },
          limitation: { fontSize: 7 },
        },
        defaultStyle: {
          font: "Montserrat",
        },
        images: {
          logo: `${window.location.href}/images/HDMK.png`,
          cover:
            inspection?.house?.cover?.downloadURL ||
            `${window.location.href}/images/cover.png`,
        },
      };

      const createConditionsPage = () => {
        if (!inspection.house) return {};
        const { conditions } = inspection.house;
        if (!conditions) return {};
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
          table: {
            widths: "*",
            body: [
              [
                { text: "DATE OF INSPECTION:", style: ["subHeader"] },
                { text: inspection.date.started, margin: [0, 5] },
              ],
              [
                { text: "START TIME:", style: ["subHeader"] },
                { text: inspection.time.started, margin: [0, 5] },
              ],
              [
                { text: "END TIME:", style: ["subHeader"] },
                { text: inspection.time.ended, margin: [0, 5] },
              ],
              [
                { text: "CLIENT NAME:", style: ["subHeader"] },
                { text: client.name, margin: [0, 5] },
              ],
              [
                { text: "CITY & STATE:", style: ["subHeader"] },
                {
                  text: `${city}, ${state} ${zipcode}`,
                  margin: [0, 5],
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
                { text: `$${inspection.fee}`, margin: [0, 5] },
              ],
              //   ["SIGNATURE:", { image: signature, width: 100 }],
            ],
          },
        });
        if (conditions.climate) {
          dd.content.push({ text: layout.climate.name, style: ["header"] });
          layout.climate.fields.forEach((field) => {
            if (!conditions.climate[field]) return;
            dd.content.push({
              layout: "noBorders",
              table: {
                widths: "*",
                body: [
                  [
                    { text: field, style: ["subHeader"] },
                    {
                      text: conditions.climate[field]?.value || "",
                      margin: [0, 5],
                    },
                  ],
                ],
              },
            });
          });
        }
        if (conditions.building) {
          dd.content.push({ text: layout.building.name, style: ["header"] });
          layout.building.fields.forEach((field) => {
            if (!conditions.building[field]) return;
            dd.content.push({
              layout: "noBorders",
              table: {
                widths: "*",
                body: [
                  [
                    { text: field, style: ["subHeader"] },
                    {
                      text: conditions.building[field]?.value || "",
                      margin: [0, 5],
                    },
                  ],
                ],
              },
            });
          });
        }
        if (conditions.utility) {
          dd.content.push({ text: layout.utility.name, style: ["header"] });
          layout.utility.fields.forEach((field) => {
            if (!conditions.utility[field]) return;
            dd.content.push({
              layout: "noBorders",
              table: {
                widths: "*",
                body: [
                  [
                    { text: field, style: ["subHeader"] },
                    {
                      text: conditions.utility[field]?.value || "",
                      margin: [0, 5],
                    },
                  ],
                ],
              },
            });
          });
        }
        if (conditions.other) {
          dd.content.push({ text: layout.other.name, style: ["header"] });
          layout.other.fields.forEach((field) => {
            if (!conditions.other[field]) return;
            dd.content.push({
              layout: "noBorders",
              table: {
                widths: "*",
                body: [
                  [
                    { text: field, style: ["subHeader"] },
                    {
                      text: conditions.other[field]?.value || "",
                      margin: [0, 5],
                    },
                  ],
                ],
              },
            });
          });
        }
      };
      const createLimitationsPage = () => {
        dd.content.push({
          text: "REPORT LIMITATIONS:",
          pageBreak: "before",
          tocItem: true,
          style: ["title"],
        });
        dd.content.push({ text: limitations, style: ["limitation"] });
      };
      const createSummaryPage = () => {
        if (!inspection.house) return {};
        const { house } = inspection;
        const sections = [];

        layout.sections.forEach(({ name: section, items }) => {
          const selectedItems = [];

          if (house[section]) {
            items.forEach(({ name: item, fields }) => {
              const selectedFields = [];
              if (house[section][item]) {
                fields.forEach((field) => {
                  if (house[section][item][field]) {
                    if (house[section][item][field]?.summary) {
                      const { summary, images } = house[section][item][field];
                      const selectedImages = [];

                      if (images) {
                        Object.keys(images).forEach((key) => {
                          if (images[key].summary) {
                            if (typeof images[key].downloadURL === "object") {
                              dd.images[images[key].name] =
                                images[key].downloadURL.hd;
                            } else {
                              dd.images[images[key].name] =
                                images[key].downloadURL;
                            }
                            selectedImages.push(images[key]);
                          }
                        });
                      }
                      selectedFields.push({
                        name: field,
                        value: summary,
                        images: selectedImages,
                      });
                    }
                  }
                });
                if (selectedFields.length > 0)
                  selectedItems.push({ name: item, fields: selectedFields });
              }
            });
            if (selectedItems.length > 0)
              sections.push({ name: section, items: selectedItems });
          }
        });
        if (sections.length < 1) return;

        dd.content.push({
          text: `REPORT SUMMARY`,
          pageBreak: "before",
          tocItem: true,
          style: ["title"],
        });
        sections.forEach(({ name: section, items }) => {
          dd.content.push({ text: section, style: ["header"] });

          items.forEach(({ name: item, fields }) => {
            dd.content.push({ text: item, style: ["subHeader"] });

            // let columns = [];
            fields.forEach(({ name: field, value, images }) => {
              let columns = [];
              dd.content.push({
                stack: [
                  { text: field, margin: [10, 5, 0, 5] },
                  { text: value, margin: [10, 5, 0, 5] },
                ],
              });

              images.forEach((image, index) => {
                columns.push({
                  image: image.name,
                  width: 150,
                  height: 150,
                });
                if (!images[index + 1])
                  return dd.content.push({ columns: columns, columnGap: 8 });
                if (!(columns.length % 3)) {
                  dd.content.push({ columns: columns, columnGap: 8 });
                  columns = [];
                }
              });
            });
          });
        });
      };
      const createSectionsPage = () => {
        if (!inspection.house) return {};
        const { house } = inspection;

        layout.sections.forEach(({ name: section, items }) => {
          if (!house[section]) return;
          dd.content.push({
            text: section,
            pageBreak: "before",
            tocItem: true,
            style: ["title"],
          });
          items.forEach(({ name: item, fields }) => {
            if (!house[section][item]) return;
            dd.content.push({ text: item, style: ["header"] }); //Item

            fields.forEach((field) => {
              let columns = [];
              if (!house[section][item][field]) return;
              const { value, images } = house[section][item][field];

              dd.content.push({
                stack: [
                  { text: field, style: ["subHeader"], margin: [10, 5, 0, 5] },
                  { text: value, margin: [10, 5, 0, 5] },
                ],
              });
              if (images) {
                let imagesArry = Object.keys(images).map((key) => {
                  if (!dd.images[images[key].name]) {
                    if (typeof images[key].downloadURL === "object") {
                      dd.images[images[key].name] = images[key].downloadURL.hd;
                    } else
                      dd.images[images[key].name] = images[key].downloadURL;
                  }
                  return images[key];
                });

                imagesArry.forEach((image, index) => {
                  columns.push({
                    image: image.name,
                    width: 150,
                    height: 150,
                  });
                  if (!imagesArry[index + 1])
                    return dd.content.push({ columns: columns, columnGap: 8 });
                  if (!(columns.length % 3)) {
                    dd.content.push({
                      columns: columns,
                      columnGap: 8,
                      margin: [0, 4],
                    });
                    columns = [];
                  }
                });
              }
            });
          });
        });
      };

      createConditionsPage();
      createLimitationsPage();
      if (printOnly === "summary") {
        createSummaryPage();
      } else if (printOnly === "sections") {
        createSectionsPage();
      } else {
        createSummaryPage();
        createSectionsPage();
      }
      const doc = createPdf(dd);

      doc.getBlob((blob) => {
        resolve(compressPDF(`${street} ${city} ${state} ${zipcode}`, blob));
      });
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
