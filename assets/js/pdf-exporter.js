/**
 * PDF Exporter Module
 * Converts HTML documents to downloadable PDF files
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * PDFExporter class
 * Handles conversion of HTML document elements to PDF format using jsPDF
 */
export class PDFExporter {
  constructor() {
    this.options = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm'
    };
  }

  /**
   * Set PDF generation options
   * @param {object} options - Configuration options for PDF generation
   */
  setPDFOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Generate filename with format: {type}_YYYYMMDD_{id}.pdf
   * @param {string} type - Document type ('bilty' or 'invoice')
   * @param {string|number} id - Document ID
   * @returns {string} Formatted filename
   */
  generateFilename(type, id) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    return `${type}_${dateStr}_${id}.pdf`;
  }

  /**
   * Export HTML document element to PDF
   * @param {HTMLElement} documentElement - The HTML element to convert to PDF
   * @param {string} filename - The filename for the downloaded PDF
   * @returns {Promise<void>} Promise that resolves when PDF is generated and downloaded
   */
  async exportToPDF(documentElement, filename) {
    // Wrap PDF generation in try-catch
    try {
      // Validate inputs
      if (!documentElement) {
        throw new Error('Document element is required');
      }
      
      if (!filename) {
        throw new Error('Filename is required');
      }

      // Check if jsPDF is available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error('jsPDF library is not loaded');
      }

      // Create new jsPDF instance
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: this.options.orientation,
        unit: this.options.unit,
        format: this.options.format
      });

      // Convert HTML to PDF using html() method
      await pdf.html(documentElement, {
        callback: function(doc) {
          // Trigger browser download
          doc.save(filename);
        },
        x: 10,
        y: 10,
        width: 190, // A4 width in mm minus margins
        windowWidth: 800, // Virtual window width for rendering
        html2canvas: {
          scale: 0.5, // Scale for better quality
          useCORS: true, // Enable CORS for images
          logging: false
        }
      });

    } catch (error) {
      // On PDF error, log and throw with user-friendly message
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF. Please try again. ${error.message}`);
    }
  }

  /**
   * Export multiple documents as separate PDF files
   * @param {Array<{element: HTMLElement, filename: string}>} documents - Array of document objects
   * @returns {Promise<void>} Promise that resolves when all PDFs are generated
   */
  async exportMultipleToPDF(documents) {
    try {
      // Validate input
      if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error('Documents array is required and must not be empty');
      }

      // Export each document sequentially to avoid browser issues
      for (const doc of documents) {
        if (!doc.element || !doc.filename) {
          console.warn('Skipping invalid document:', doc);
          continue;
        }

        // Add a small delay between downloads to prevent browser blocking
        await this.exportToPDF(doc.element, doc.filename);
        
        // Wait a bit before next download
        if (documents.indexOf(doc) < documents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } catch (error) {
      console.error('Multiple PDF generation error:', error);
      throw new Error(`Failed to generate multiple PDFs: ${error.message}`);
    }
  }
}

// Default export for convenience
export default PDFExporter;
