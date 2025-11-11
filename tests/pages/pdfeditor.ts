import fs from "fs";
import path from "path";
import dotenv from "dotenv";
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

// Load default .env and project-specific config.env
dotenv.config({ quiet: true });
try {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env'), quiet: true });
} catch (_) {}

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
    
    // Check if LibreOffice is installed on the system
    const checkLibreOfficeInstalled = (): boolean => {
      const candidates: string[] = [];
      const pf = process.env["ProgramFiles"]; // C:\\Program Files
      const pfx86 = process.env["ProgramFiles(x86)"];
      if (pf) candidates.push(path.join(pf, 'LibreOffice', 'program', 'soffice.exe'));
      if (pfx86) candidates.push(path.join(pfx86, 'LibreOffice', 'program', 'soffice.exe'));
      candidates.push('/usr/bin/soffice', '/usr/local/bin/soffice');
      
      for (const c of candidates) {
        try {
          if (fs.existsSync(c)) return true;
        } catch { /* continue */ }
      }
      return false;
    };
    
    if (!libreConvert && !checkLibreOfficeInstalled()) {
      throw new Error(
        '❌ LibreOffice is not installed on your system.\n' +
        '📥 Installation Instructions:\n' +
        '   Windows: Download from https://www.libreoffice.org/download/download/\n' +
        '   Or install via Chocolatey: choco install libreoffice\n' +
        '   Or install via winget: winget install LibreOffice.LibreOffice\n' +
        '\n' +
        'After installation, restart your terminal and try again.\n' +
        'If LibreOffice is installed but not detected, set LIBREOFFICE_BIN environment variable to the soffice.exe path.'
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

    let tempPdf: string;
    let useCli = !libreConvert;
    
    // Try using libreoffice-convert npm package first if available
    if (libreConvert && !useCli) {
      console.log('✓ Using libreoffice-convert npm package for conversion');
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

      tempPdf = path.join(path.dirname(resolvedPdfPath), `converted_${Date.now()}.pdf`);
      try {
        const converted: Buffer = await convertToPdf(docxBuffer);
        fs.writeFileSync(tempPdf, converted);
        console.log(`✓ Converted DOCX to PDF (buffer): ${tempPdf}`);
        useCli = false; // Success, don't use CLI
      } catch (err) {
        console.warn(`⚠️ Buffer conversion failed. Falling back to soffice CLI. Reason: ${(err as Error).message}`);
        useCli = true; // Force CLI path
      }
    }
    
    // Use LibreOffice CLI if npm package failed or is not available
    if (useCli) {
      console.log('⚠️ Using LibreOffice CLI (soffice) for conversion');
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
        if (!soffice) {
          // Try to find it in PATH
          soffice = 'soffice';
        }
      }
      
      const outDir = path.dirname(resolvedPdfPath);
      const execFileAsync = require('util').promisify(require('child_process').execFile);
      
      try {
        await execFileAsync(soffice, ['--headless', '--nologo', '--convert-to', 'pdf', '--outdir', outDir, resolvedPdfPath]);
        const cliPdf = path.join(outDir, `${path.basename(resolvedPdfPath, path.extname(resolvedPdfPath))}.pdf`);
        if (!fs.existsSync(cliPdf) || fs.statSync(cliPdf).size === 0) {
          throw new Error(`Soffice CLI did not produce a valid PDF at ${cliPdf}`);
        }
        tempPdf = cliPdf;
        console.log(`✓ Converted DOCX to PDF (CLI): ${cliPdf}`);
      } catch (err) {
        throw new Error(
          `❌ LibreOffice CLI conversion failed: ${(err as Error).message}\n` +
          `   Make sure LibreOffice is installed and 'soffice' is in your PATH, or set LIBREOFFICE_BIN environment variable.`
        );
      }
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

/**
 * Create a new PDF resume document from scratch with provided content
 * Generates random name, email, and phone if not provided
 * Creates a comprehensive, parseable resume with realistic content
 */
export async function createResumePdf(
  name?: string,
  email?: string,
  phone?: string,
  professionalSummary?: string,
  skills?: string,
  experience?: Array<{ company: string; duration: string; description: string }>
): Promise<string> {
  // Generate random values if not provided - ensures unique name and email each time
  const generatedName = name || CommonUtils.generateRandomName();
  const generatedEmail = email || CommonUtils.generateRandomEmail(generatedName);
  const generatedPhone = phone || CommonUtils.generateRandomPhone();
  
  // Save generated values for later steps (search, upload, etc.)
  try {
    const emailTxt = path.resolve(process.cwd(), "generated_email.txt");
    fs.writeFileSync(emailTxt, generatedEmail, "utf8");
    const nameTxt = path.resolve(process.cwd(), "generated_name.txt");
    fs.writeFileSync(nameTxt, generatedName, "utf8");
    const phoneTxt = path.resolve(process.cwd(), "generated_phone.txt");
    fs.writeFileSync(phoneTxt, generatedPhone, "utf8");
  } catch (_) {}
  
  // Create a new PDF document with proper metadata
  const pdfDoc = await PDFDocument.create();
  
  // Set PDF metadata for better parsing
  pdfDoc.setTitle(`Resume - ${generatedName}`);
  pdfDoc.setAuthor(generatedName);
  pdfDoc.setSubject("Professional Resume");
  pdfDoc.setKeywords(["resume", "CV", "professional", "career"]);
  pdfDoc.setProducer("PDF Resume Generator");
  pdfDoc.setCreator("Automated Resume System");
  
  const page = pdfDoc.addPage([612, 792]); // US Letter size (8.5 x 11 inches)
  const { width, height } = page.getSize();
  
  // Define fonts and sizes
  const fontSize = {
    title: 24,
    heading: 16,
    subheading: 14,
    body: 11,
    small: 10
  };
  
  // Define colors
  const colors = {
    primary: rgb(0, 0, 0),
    secondary: rgb(0.3, 0.3, 0.3),
    accent: rgb(0.2, 0.4, 0.8)
  };
  
  // Starting position (top of page with margins)
  let yPosition = height - 50;
  const leftMargin = 50;
  const rightMargin = width - 50;
  const sectionSpacing = 25;
  
  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, size: number, color: any, maxWidth?: number): number => {
    if (maxWidth) {
      // Simple word wrapping with better width calculation
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      const charWidth = size * 0.5; // More accurate character width approximation
      
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = testLine.length * charWidth;
        
        if (textWidth > maxWidth && line) {
          page.drawText(line, { x, y: currentY, size, color });
          currentY -= size + 4; // Line spacing
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, { x, y: currentY, size, color });
        currentY -= size + 4;
      }
      return currentY;
    } else {
      page.drawText(text, { x, y, size, color });
      return y - size - 4;
    }
  };
  
  // Helper function to add section separator
  const addSectionSeparator = (y: number): number => {
    page.drawLine({
      start: { x: leftMargin, y: y },
      end: { x: rightMargin, y: y },
      thickness: 1,
      color: colors.secondary
    });
    return y - sectionSpacing;
  };
  
  // Header Section - Name
  yPosition = addText(generatedName, leftMargin, yPosition, fontSize.title, colors.primary);
  yPosition -= 10;
  
  // Contact Information
  const contactInfo = `${generatedEmail} | ${generatedPhone}`;
  yPosition = addText(contactInfo, leftMargin, yPosition, fontSize.body, colors.secondary);
  yPosition = addSectionSeparator(yPosition - sectionSpacing);
  
  // Professional Summary Section
  const defaultSummary = "Experienced software professional with a proven track record in developing scalable applications and leading technical teams. Strong expertise in full-stack development, cloud infrastructure, and agile methodologies. Passionate about delivering high-quality solutions that drive business value and enhance user experience.";
  const summaryText = professionalSummary || defaultSummary;
  yPosition = addText("PROFESSIONAL SUMMARY", leftMargin, yPosition, fontSize.heading, colors.accent);
  yPosition -= 5;
  yPosition = addText(summaryText, leftMargin, yPosition, fontSize.body, colors.primary, rightMargin - leftMargin);
  yPosition = addSectionSeparator(yPosition - sectionSpacing);
  
  // Skills Section
  const defaultSkills = "Programming Languages: Java, Python, JavaScript, TypeScript, C++, SQL | Frameworks & Libraries: Angular, React, Node.js, Spring Boot, Flask, Express.js | Cloud & DevOps: AWS (EC2, S3, Lambda, RDS), Azure, Docker, Kubernetes, Jenkins, CI/CD | Databases: PostgreSQL, MySQL, MongoDB, Redis | Tools & Technologies: Git, JIRA, Agile/Scrum, REST APIs, GraphQL, Microservices, Test Automation (Cypress, Selenium)";
  const skillsText = skills || defaultSkills;
  yPosition = addText("TECHNICAL SKILLS", leftMargin, yPosition, fontSize.heading, colors.accent);
  yPosition -= 5;
  yPosition = addText(skillsText, leftMargin, yPosition, fontSize.body, colors.primary, rightMargin - leftMargin);
  yPosition = addSectionSeparator(yPosition - sectionSpacing);
  
  // Experience Section
  const defaultExperience: Array<{ company: string; duration: string; description: string }> = [
    {
      company: "Senior Software Engineer - Tech Solutions Inc.",
      duration: "2020 - Present (4 years)",
      description: "Led development of microservices architecture serving 1M+ users. Designed and implemented RESTful APIs using Spring Boot and Node.js. Collaborated with cross-functional teams to deliver features on time. Mentored junior developers and conducted code reviews. Reduced system response time by 40% through optimization."
    },
    {
      company: "Software Developer - Digital Innovations LLC",
      duration: "2017 - 2020 (3 years)",
      description: "Developed full-stack web applications using Angular, React, and Java. Implemented CI/CD pipelines using Jenkins and Docker. Worked on database design and optimization. Participated in agile sprints and daily standups. Contributed to open-source projects and maintained technical documentation."
    },
    {
      company: "Junior Developer - Startup Ventures",
      duration: "2015 - 2017 (2 years)",
      description: "Built responsive web applications using modern JavaScript frameworks. Assisted in database migrations and API integrations. Wrote unit tests and integration tests. Participated in code reviews and learned best practices from senior team members."
    }
  ];
  const experienceList = experience || defaultExperience;
  
  yPosition = addText("PROFESSIONAL EXPERIENCE", leftMargin, yPosition, fontSize.heading, colors.accent);
  yPosition -= 5;
  
  for (const exp of experienceList) {
    // Company name and duration
    const companyLine = `${exp.company} | ${exp.duration}`;
    yPosition = addText(companyLine, leftMargin, yPosition, fontSize.subheading, colors.primary);
    yPosition -= 5;
    
    // Description
    yPosition = addText(exp.description, leftMargin, yPosition, fontSize.body, colors.secondary, rightMargin - leftMargin);
    yPosition -= sectionSpacing;
  }
  
  yPosition = addSectionSeparator(yPosition);
  
  // Education Section
  yPosition = addText("EDUCATION", leftMargin, yPosition, fontSize.heading, colors.accent);
  yPosition -= 5;
  yPosition = addText("Bachelor of Science in Computer Science", leftMargin, yPosition, fontSize.subheading, colors.primary);
  yPosition -= 3;
  yPosition = addText("University of Technology | 2011 - 2015", leftMargin, yPosition, fontSize.body, colors.secondary);
  yPosition -= 5;
  yPosition = addText("Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering, Web Development", leftMargin, yPosition, fontSize.small, colors.secondary, rightMargin - leftMargin);
  yPosition = addSectionSeparator(yPosition - sectionSpacing);
  
  // Certifications Section
  yPosition = addText("CERTIFICATIONS", leftMargin, yPosition, fontSize.heading, colors.accent);
  yPosition -= 5;
  yPosition = addText("AWS Certified Solutions Architect - Associate (2022)", leftMargin, yPosition, fontSize.body, colors.primary);
  yPosition -= 3;
  yPosition = addText("Certified Kubernetes Administrator (CKA) - 2021", leftMargin, yPosition, fontSize.body, colors.primary);
  yPosition -= 3;
  yPosition = addText("Oracle Certified Professional, Java SE Developer - 2019", leftMargin, yPosition, fontSize.body, colors.primary);
  
  // Ensure minimum PDF size for better parsing (add extra content if needed)
  if (yPosition > 100) {
    yPosition -= 20;
    yPosition = addText("Additional Information: Available for relocation and remote work opportunities.", leftMargin, yPosition, fontSize.small, colors.secondary, rightMargin - leftMargin);
  }
  
  // Generate filename first
  const sanitizedResumeName = generatedName
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");
  const dynamicName = `resume_${sanitizedResumeName || Date.now()}.pdf`;
  
  // Save the PDF
  let pdfBytes = await pdfDoc.save();
  
  // Ensure PDF is large enough to be parseable (minimum 5KB)
  if (pdfBytes.length < 5000) {
    // Add a second page with additional content if PDF is too small
    const page2 = pdfDoc.addPage([612, 792]);
    let yPos2 = height - 50;
    
    // Helper function for page2
    const addText2 = (text: string, x: number, y: number, size: number, color: any, maxWidth?: number): number => {
      if (maxWidth) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        const charWidth = size * 0.5;
        
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const textWidth = testLine.length * charWidth;
          
          if (textWidth > maxWidth && line) {
            page2.drawText(line, { x, y: currentY, size, color });
            currentY -= size + 4;
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page2.drawText(line, { x, y: currentY, size, color });
          currentY -= size + 4;
        }
        return currentY;
      } else {
        page2.drawText(text, { x, y, size, color });
        return y - size - 4;
      }
    };
    
    yPos2 = addText2("ADDITIONAL DETAILS", leftMargin, yPos2, fontSize.heading, colors.accent);
    yPos2 -= 20;
    const additionalContent = `Languages: English (Fluent), Spanish (Conversational) | 
Projects: E-commerce Platform (React, Node.js, PostgreSQL) - Led team of 5 developers | 
Open Source Contributions: Contributed to 10+ open source projects on GitHub | 
Awards: Employee of the Year 2021, Innovation Award 2020 | 
References: Available upon request`;
    yPos2 = addText2(additionalContent, leftMargin, yPos2, fontSize.body, colors.primary, rightMargin - leftMargin);
    pdfBytes = await pdfDoc.save();
  }
  
  // Final save with correct filename
  fs.writeFileSync(dynamicName, pdfBytes);
  
  // Update config.env
  try {
    const envPath = path.resolve(process.cwd(), "config.env");
    updateEnvKey(envPath, "PDF_OUTPUT_NAME", dynamicName);
    updateEnvKey(envPath, "UPLOAD_FILE", dynamicName);
    updateEnvKey(envPath, "resume_Name", generatedName);
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
  
  console.log("✅ PDF resume created successfully:", dynamicName);
  console.log("📄 PDF size:", (pdfBytes.length / 1024).toFixed(2), "KB");
  console.log("👉 Resume details:", { name: generatedName, email: generatedEmail, phone: generatedPhone });
  console.log(`resume_Name=${generatedName}`);
  
  return dynamicName;
}

// Allow calling createResumePdf directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === 'create') {
    createResumePdf().catch(console.error);
  } else {
    editPdf();
  }
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