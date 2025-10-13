"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPdf = editPdf;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv = __importStar(require("dotenv"));
const pdf_lib_1 = require("pdf-lib");
const Selectors_1 = require("./Selectors");
const CommonUtils_1 = require("./CommonUtils");
dotenv.config();
// Random generators moved to CommonUtils
async function editPdf() {
    // Generate new values
    const name = CommonUtils_1.CommonUtils.generateRandomName();
    const email = CommonUtils_1.CommonUtils.generateRandomEmail(name);
    const phone = CommonUtils_1.CommonUtils.generateRandomPhone();
    // Load PDF
    const pdfPath = CommonUtils_1.CommonUtils.getEnvVar("PDF_PATH");
    const resolvedPdfPath = path_1.default.resolve(pdfPath);
    if (!fs_1.default.existsSync(resolvedPdfPath)) {
        console.error(`❌ PDF not found at: ${resolvedPdfPath}. Set PDF_PATH env var or update default path.`);
        process.exit(1);
    }
    const existingPdfBytes = fs_1.default.readFileSync(resolvedPdfPath);
    const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    // Cover old text area
    firstPage.drawRectangle({
        x: Selectors_1.PDF_EDITOR.COVER_RECTANGLE.x,
        y: Selectors_1.PDF_EDITOR.COVER_RECTANGLE.y,
        width: Selectors_1.PDF_EDITOR.COVER_RECTANGLE.width,
        height: Selectors_1.PDF_EDITOR.COVER_RECTANGLE.height,
        color: (0, pdf_lib_1.rgb)(1, 1, 1),
    });
    // Insert new values
    firstPage.drawText(`Name: ${name}`, { x: Selectors_1.PDF_EDITOR.TEXT_POSITIONS.NAME.x, y: Selectors_1.PDF_EDITOR.TEXT_POSITIONS.NAME.y, size: Selectors_1.PDF_EDITOR.DEFAULT_FONT_SIZE, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
    firstPage.drawText(`Email: ${email}`, { x: Selectors_1.PDF_EDITOR.TEXT_POSITIONS.EMAIL.x, y: Selectors_1.PDF_EDITOR.TEXT_POSITIONS.EMAIL.y, size: Selectors_1.PDF_EDITOR.DEFAULT_FONT_SIZE, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
    firstPage.drawText(`Phone: ${phone}`, { x: Selectors_1.PDF_EDITOR.TEXT_POSITIONS.PHONE.x, y: Selectors_1.PDF_EDITOR.TEXT_POSITIONS.PHONE.y, size: Selectors_1.PDF_EDITOR.DEFAULT_FONT_SIZE, color: (0, pdf_lib_1.rgb)(0, 0, 0) });
    // Save as new PDF each time
    const pdfBytes = await pdfDoc.save();
    const outputName = process.env.PDF_OUTPUT_NAME || "resume_1147.pdf";
    fs_1.default.writeFileSync(outputName, pdfBytes);
    console.log("✅ PDF updated successfully:", outputName);
    console.log("👉 Values:", { name, email, phone });
}
// Allow running directly via `npm run pdf:edit`
if (require.main === module) {
    editPdf();
}
//# sourceMappingURL=pdfeditor.js.map