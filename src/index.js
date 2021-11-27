import { vfs, fonts, createPdf } from "pdfmake/build/pdfmake";
import { pdfMake } from "pdfmake/build/vfs_fonts";
import axios from "axios";

const compressPDF = async (filename, file) => {
  try {
    progressBarData(10, 0);
    //authenicate
    let response = await axios({
      method: "post",
      url: "https://api.ilovepdf.com/v1/auth",
      headers: {},
      data: { public_key: process.env.PUBLICKEY },
    });
    const { token } = response.data;

    progressBarData(10, 0);

    document.querySelector(".pdf-download-loading").classList.add("start");
    document.querySelector("body").classList.add("pdf-ganrate-start");
    document.querySelector(".floating").classList.add("pdf-start");
    document.querySelector(".pdf-dwonload-message").innerHTML =
      "Your PDF is being compressed and will be downloaded shortly.";

    //start compress
    response = await axios({
      method: "get",
      url: "https://api.ilovepdf.com/v1/start/compress",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    progressBarData(10, 0);
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

    progressBarData(25, 0);

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
    progressBarData(5, 0);
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

    document.querySelector(".pdf-download-loading").classList.remove("start");
    document.querySelector("body").classList.remove("pdf-ganrate-start");
    document.querySelector(".floating").classList.remove("pdf-start");
    progressBarData(0, 1);

    return true;
  } catch (error) {
    throw Error(error);
  }
};

const generatePDF = async (id, printOnly) => {
  progressBarData(10, 0);
  return new Promise(async (resolve, reject) => {
    try {
      var url =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;

      const endpoint = `${process.env.API}${id}`;
      const { data } = await axios.get(endpoint);
      const { data: limitations } = await axios("./public/limitations.txt");
      const { inspection, inspector, layout } = data;
      const { client, address } = inspection;
      const { street, city, state, zipcode } = address;

      vfs = pdfMake.vfs;
      fonts = {
        Montserrat: {
          bold: `${url}/public/fonts/Montserrat-SemiBold.ttf`,
          normal: `${url}/public/fonts/Montserrat-Light.ttf`,
        },
      };

      if (typeof inspection.house.cover.downloadURL === "object") {
        var coverImage = inspection.house.cover.downloadURL.hd;
      } else {
        var coverImage = inspection.house.cover.downloadURL;
      }

      const dd = {
        pageSize: "LETTER",
        pageMargins: [40, 100, 40, 40],
        header: {
          columns: [
            { image: "logo", width: 150 },
            {
              text: `${inspector.fname} ${inspector.lname}\n${inspector.licence_number}\n${inspector.phone} \n${inspector.email}`,
              alignment: "right",
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
          {
            columns: [
              {
                text: `${client.name}\n${street}\n${city} ${state} ${zipcode}`,
              },
              { text: `\n\n${inspection.date.started}`, alignment: "right" },
            ],
          },
          { image: "cover", width: 530, margin: [0, 20] },
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
          logo: `${url}/public/images/HDMK.png`,
          cover: coverImage || `${url}/public/images/cover.png`,
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
          margin: [20, 0],
          table: {
            widths: "*",
            body: [
              [
                { text: "DATE OF INSPECTION:", style: ["subHeader"] },
                { text: inspection.date.started, margin: [0, 3] },
              ],
              [
                { text: "START TIME:", style: ["subHeader"] },
                { text: inspection.time.started, margin: [0, 3] },
              ],
              [
                { text: "END TIME:", style: ["subHeader"] },
                { text: inspection.time.ended, margin: [0, 3] },
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
                      margin: [0, 3],
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
                      margin: [0, 3],
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
                      margin: [0, 3],
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
                      margin: [0, 3],
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
                              if (images[key].downloadURL.hd) {
                                dd.images[images[key].name] =
                                  images[key].downloadURL.hd;
                                selectedImages.push(images[key]);
                              }
                            } else {
                              if (images[key].downloadURL) {
                                dd.images[images[key].name] =
                                  images[key].downloadURL;
                                selectedImages.push(images[key]);
                              }
                            }
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
            dd.content.push({
              text: item,
              style: ["subHeader"],
              margin: [10, 0],
            });

            // let columns = [];
            fields.forEach(({ name: field, value, images }) => {
              let columns = [];
              dd.content.push({
                stack: [
                  { text: field, margin: [20, 5, 0, 5] },
                  { text: value, margin: [20, 5, 0, 5] },
                ],
              });

              images.forEach((image, index) => {
                columns.push({
                  image: image.name,
                  width: 150,
                  height: 150,
                  margin: [10, 0],
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
                let imagesArry = [];
                Object.keys(images).forEach((key) => {
                  if (!dd.images[images[key].name]) {
                    if (typeof images[key].downloadURL === "object") {
                      if (images[key].downloadURL.hd) {
                        dd.images[images[key].name] =
                          images[key].downloadURL.hd;
                        imagesArry.push(images[key]);
                      }
                    } else if (images[key].downloadURL) {
                      dd.images[images[key].name] = images[key].downloadURL;
                      imagesArry.push(images[key]);
                    }
                  }
                  // return images[key];
                });

                imagesArry.forEach((image, index) => {
                  columns.push({
                    image: image.name,
                    width: 150,
                    height: 150,
                    margin: [10, 4],
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
      progressBarData(10, 0);
      const doc = createPdf(dd);
      progressBarData(10, 0);

      doc.getBlob((blob) => {
        resolve(compressPDF(`${street} ${city} ${state} ${zipcode}`, blob));
      });
      // console.log('ssa');
      // progressBarData('20');

      // console.log('0');
      // progressBarData('0',1);
      // doc.download();

      // document.querySelector(".pdf-download-loading").classList.remove("start");
      // document.querySelector("body").classList.remove("pdf-ganrate-start");
      // document.querySelector(".floating").classList.remove("pdf-start");
    } catch (error) {
      reject(error);
    }
  });
};

//full inspection report

const onCreateFullInspectionReport = async () => {
  progressBarData(0, 1);
  const id = document.getElementById("full-report-pdf").getAttribute("data");
  const printOnly = "full";

  document.querySelector(".pdf-download-loading").classList.add("start");
  document.querySelector("body").classList.add("pdf-ganrate-start");
  document.querySelector(".floating").classList.add("pdf-start");
  document.querySelector(".pdf-dwonload-message").innerHTML =
    "Your PDF is being created. This process may take up to 2 minutes. Next we will compress your PDF. Please don’t click the button multiple times.";
  document.querySelector(".wrapper input").checked = false;
  await generatePDF(id, printOnly);
};

//summery report

const onCreateSummaryInspectionReport = async () => {
  progressBarData(0, 1);
  const id = document.getElementById("summary-report-pdf").getAttribute("data");
  const printOnly = "summary";
  document.querySelector(".pdf-download-loading").classList.add("start");
  document.querySelector("body").classList.add("pdf-ganrate-start");
  document.querySelector(".floating").classList.add("pdf-start");
  document.querySelector(".pdf-dwonload-message").innerHTML =
    "Your PDF is being created. This process may take up to 2 minutes. Next we will compress your PDF. Please don’t click the button multiple times.";
  document.querySelector(".wrapper input").checked = false;
  await generatePDF(id, printOnly);
};

var fullReport = document.querySelector("#full-report-pdf");
if (fullReport) {
  fullReport.addEventListener("click", onCreateFullInspectionReport);
}

var summaryReport = document.querySelector("#summary-report-pdf");
if (summaryReport) {
  summaryReport.addEventListener("click", onCreateSummaryInspectionReport);
}

function progressBarData(value, clear = 0) {
  setTimeout(function () {
    if (clear) {
      $("#report-progress-bar").val(value);
    } else {
      let oldValue = $("#report-progress-bar").val();
      let newValue = oldValue + value;
      console.log(newValue);
      $("#report-progress-bar").val(newValue);
    }
  }, 200);
}