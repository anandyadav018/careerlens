const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const AppError = require('./AppError');

/**
 * Parses a local PDF file and extracts raw text.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} Extracted plain text
 */
const parsePdf = async (filePath) => {
  let parser = null;
  try {
    const dataBuffer = fs.readFileSync(filePath);
    parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    
    // Basic cleanup: remove extra newlines, multiple spaces
    const cleanText = data.text
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with a single newline
      .replace(/[ \t]+/g, ' ')   // Replace multiple spaces/tabs with single space
      .trim();
      
    if (!cleanText || cleanText.length < 50) {
      throw new AppError('Could not extract meaningful text from the PDF. It might be an image-based PDF or empty.', 400);
    }
    
    return cleanText;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to parse PDF: ${error.message}`, 500);
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy();
    }
  }
};

module.exports = { parsePdf };
