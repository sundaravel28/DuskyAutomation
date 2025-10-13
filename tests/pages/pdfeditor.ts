import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";
import { PDFDocument, rgb } from "pdf-lib";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const libre: any = (() => {
  try {
    return require("libreoffice-convert");
  } catch {
    return null;
  }
})();
import { PDF_EDITOR } from "./Selectors";
import { execFile } from "child_process";
import { promisify } from "util";
import { CommonUtils } from "./CommonUtils";

dotenv.config();

export async function editPdf() {
  // Generate new values
  const name = CommonUtils.generateRandomName();
  const email = CommonUtils.generateRandomEmail(name);
  const phone = CommonUtils.generateRandomPhone();

  // Save generated values for later steps (search, upload, etc.)
  try {
    const emailTxt = path.resolve(process.cwd(), "generated_email.txt");
    fs.writeFileSync(emailTxt, email, "utf8");
    const nameTxt = path.resolve(process.cwd(), "generated_name.txt");
    fs.writeFileSync(nameTxt, name, "utf8");
    const phoneTxt = path.resolve(process.cwd(), "generated_phone.txt");
    fs.writeFileSync(phoneTxt, phone, "utf8");
  } catch (_) {}

  // Resolve PDF path
  const pdfPath = CommonUtils.getEnvVar("PDF_PATH");
  let resolvedPdfPath = path.resolve(pdfPath);

  if (!fs.existsSync(resolvedPdfPath)) {
    try {
      const isDir = fs.existsSync(pdfPath) && fs.statSync(pdfPath).isDirectory();
      const dir = isDir ? pdfPath : path.dirname(resolvedPdfPath);
      const base = isDir
        ? "resume_1148"
        : path.basename(resolvedPdfPath, path.extname(resolvedPdfPath));
      const tryPaths = [
        path.join(dir, `${base}.docx`),
        path.join(dir, `${base}.pdf`),
      ];
      let found: string | null = null;
      for (const p of tryPaths) {
        if (fs.existsSync(p) && fs.statSync(p).size > 0) {
          found = p;
          break;
        }
      }
      if (!found) {
        const all = fs
          .readdirSync(dir)
          .filter((f) => /resume_.*\.docx$/i.test(f))
          .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
          .sort((a, b) => b.t - a.t);
        if (all.length) found = path.join(dir, all[0].f);
      }
      if (found) {
        console.log(`✓ Auto-corrected PDF_PATH to: ${found}`);
        resolvedPdfPath = found;
      }
    } catch (_) {}
  }

  // Convert DOCX → PDF if needed
  if (resolvedPdfPath.toLowerCase().endsWith(".docx")) {
    const libreConvert: any = libre ? libre.convert || libre : null;
    if (!libreConvert) {
      throw new Error(
        '❌ libreoffice-convert is not available. Run "npm install libreoffice-convert" and ensure LibreOffice is installed.'
      );
    }

    // Ensure file exists and not empty
    if (!fs.existsSync(resolvedPdfPath)) {
      throw new Error(`❌ DOCX not found: ${resolvedPdfPath}`);
    }
    const stat = fs.statSync(resolvedPdfPath);
    if (!stat.isFile() || stat.size <= 0) {
      throw new Error(`❌ DOCX file is empty or invalid: ${resolvedPdfPath}`);
    }

    const docxBuffer = fs.readFileSync(resolvedPdfPath);

    // ✅ Safe wrapper for callback & promise API
    const convertToPdf = (input: Buffer) =>
      new Promise<Buffer>((resolve, reject) => {
        if (libreConvert.length > 3) {
          // callback API
          libreConvert(input, ".pdf", undefined, (err: Error, done: Buffer) => {
            if (err)
              return reject(
                new Error(`❌ LibreOffice conversion failed: ${err.message}`)
              );
            if (!done || !done.length)
              return reject(new Error("❌ LibreOffice returned empty PDF."));
            resolve(done);
          });
        } else {
          // promise API
          Promise.resolve(libreConvert(input, ".pdf", undefined))
            .then((done: Buffer) => {
              if (!done || !done.length) {
                return reject(
                  new Error("❌ LibreOffice returned empty PDF.")
                );
              }
              resolve(done);
            })
            .catch((err: Error) =>
              reject(
                new Error(`❌ LibreOffice conversion failed: ${err.message}`)
              )
            );
        }
      });

    let tempPdf = path.join(path.dirname(resolvedPdfPath), `converted_${Date.now()}.pdf`);
    try {
      const converted: Buffer = await convertToPdf(docxBuffer);
      fs.writeFileSync(tempPdf, converted);
      console.log(`✓ Converted DOCX to PDF (buffer): ${tempPdf}`);
    } catch (err) {
      console.warn(`⚠️ Buffer conversion failed. Falling back to soffice CLI. Reason: ${(err as Error).message}`);
      // Find LibreOffice binary cross-platform
      let soffice = process.env.LIBREOFFICE_BIN || '';
      if (!soffice) {
        const candidates: string[] = [];
        const pf = process.env["ProgramFiles"]; // C:\\Program Files
        const pfx86 = process.env["ProgramFiles(x86)"];
        if (pf) candidates.push(path.join(pf, 'LibreOffice', 'program', 'soffice.exe'));
        if (pfx86) candidates.push(path.join(pfx86, 'LibreOffice', 'program', 'soffice.exe'));
        candidates.push('/usr/bin/soffice', '/usr/local/bin/soffice');
        for (const c of candidates) {
          try { if (fs.existsSync(c)) { soffice = c; break; } } catch { /* noop */ }
        }
        if (!soffice) soffice = 'soffice';
      }
      const outDir = path.dirname(resolvedPdfPath);
      const execFileAsync = require('util').promisify(require('child_process').execFile);
      await execFileAsync(soffice, ['--headless', '--nologo', '--convert-to', 'pdf', '--outdir', outDir, resolvedPdfPath]);
      const cliPdf = path.join(outDir, `${path.basename(resolvedPdfPath, path.extname(resolvedPdfPath))}.pdf`);
      if (!fs.existsSync(cliPdf) || fs.statSync(cliPdf).size === 0) {
        throw new Error(`Soffice CLI did not produce a valid PDF at ${cliPdf}`);
      }
      tempPdf = cliPdf;
      console.log(`✓ Converted DOCX to PDF (CLI): ${cliPdf}`);
    }

    resolvedPdfPath = tempPdf;
  }

  if (!fs.existsSync(resolvedPdfPath)) {
    console.error(`❌ PDF not found at: ${resolvedPdfPath}`);
    process.exit(1);
  }

  const existingPdfBytes = fs.readFileSync(resolvedPdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Clear metadata to remove authoring info/xmp props
  try {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");
  } catch (_) {}

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Insert new values (avoid heavy overlays; just overlay small text box)
  firstPage.drawText(`Name: ${name}`, {
    x: PDF_EDITOR.TEXT_POSITIONS.NAME.x,
    y: PDF_EDITOR.TEXT_POSITIONS.NAME.y,
    size: PDF_EDITOR.DEFAULT_FONT_SIZE,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`Email: ${email}`, {
    x: PDF_EDITOR.TEXT_POSITIONS.EMAIL.x,
    y: PDF_EDITOR.TEXT_POSITIONS.EMAIL.y,
    size: PDF_EDITOR.DEFAULT_FONT_SIZE,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`Phone: ${phone}`, {
    x: PDF_EDITOR.TEXT_POSITIONS.PHONE.x,
    y: PDF_EDITOR.TEXT_POSITIONS.PHONE.y,
    size: PDF_EDITOR.DEFAULT_FONT_SIZE,
    color: rgb(0, 0, 0),
  });

  // Save as new PDF
  let pdfBytes = await pdfDoc.save();
  // If the updated file is suspiciously small, fallback to original content
  if (!pdfBytes || pdfBytes.length < 40 * 1024) {
    console.warn(`⚠️ Generated PDF is small (${pdfBytes?.length || 0} bytes). Using base PDF without overlays to ensure parsability.`);
    pdfBytes = existingPdfBytes;
  }
  const sanitizedResumeName = name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");
  const dynamicName = `resume_${sanitizedResumeName || Date.now()}.pdf`;
  fs.writeFileSync(dynamicName, pdfBytes);

  // Update config.env
  try {
    const envPath = path.resolve(process.cwd(), "config.env");
    updateEnvKey(envPath, "PDF_OUTPUT_NAME", dynamicName);
    updateEnvKey(envPath, "UPLOAD_FILE", dynamicName);
    updateEnvKey(envPath, "resume_Name", name);
  } catch (e) {
    console.warn("⚠️ Could not update config.env:", e);
  }

  // Cleanup legacy PDF if present
  try {
    const legacyPdf = path.resolve(process.cwd(), "resume_1148.pdf");
    if (fs.existsSync(legacyPdf)) {
      fs.unlinkSync(legacyPdf);
      console.log("🧹 Removed old PDF:", legacyPdf);
    }
  } catch (e) {
    console.warn("⚠️ Could not remove legacy resume_1148.pdf:", e);
  }

  console.log("✅ PDF updated successfully:", dynamicName);
  console.log("👉 Values:", { name, email, phone });
  console.log(`resume_Name=${name}`);
}

if (require.main === module) {
  editPdf();
}

function updateEnvKey(envFilePath: string, key: string, value: string) {
  try {
    let content = fs.existsSync(envFilePath)
      ? fs.readFileSync(envFilePath, "utf8")
      : "";
    const keyRegex = new RegExp(`^${key}=.*$`, "m");
    if (keyRegex.test(content)) {
      content = content.replace(keyRegex, `${key}=${value}`);
    } else {
      if (content.length && !content.endsWith("\n")) content += "\n";
      content += `${key}=${value}\n`;
    }
    fs.writeFileSync(envFilePath, content);
  } catch (err) {
    throw err;
  }
}