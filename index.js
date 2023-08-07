import express from "express";
import fs from "fs";
import wkhtmltopdf from "wkhtmltopdf";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const targetDir = "out";

const app = express();
app.use(express.json());

// Serve static files from the "images" folder
app.use('/images', express.static(path.join(__dirname, "images")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/convert", async (req, res) => {
  const { html } = req.body;
  const filename = `${uuidv4()}.pdf`;
  const filepath = path.join(__dirname, targetDir, filename);
  const options = {
    pageSize: "A4",
  };

  wkhtmltopdf(html, options, (err, stream) => {
    if (err) {
      console.log("Error generating PDF: ", err);
      res.status(500).send("Error generating PDF");
    } else {
      res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
      res.setHeader("Content-Type", "application/pdf");
      stream.pipe(res);
    }
  }).pipe(fs.createWriteStream(filepath));
});

app.listen(5000, () => {
  console.log("Listening on port 5000");
});
