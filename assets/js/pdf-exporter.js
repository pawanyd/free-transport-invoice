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
   * Apply computed styles inline to element and its children
   * This ensures styles are preserved when rendering to canvas
   */
  applyComputedStyles(element) {
    if (!element || element.nodeType !== 1) return;

    // Get computed styles
    const computedStyle = window.getComputedStyle(element);
    
    // Apply important styles inline
    const importantStyles = [
      'color', 'backgroundColor', 'fontSize', 'fontWeight', 
      'fontFamily', 'textAlign', 'padding', 'margin',
      'border', 'borderColor', 'borderWidth', 'borderStyle',
      'display', 'width', 'height'
    ];

    importantStyles.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'normal') {
        element.style[prop] = value;
      }
    });

    // Recursively apply to children
    Array.from(element.children).forEach(child => {
      this.applyComputedStyles(child);
    });
  }

  /**
   * Export HTML document element to PDF
   * @param {HTMLElement} documentElement - The HTML element to convert to PDF
   * @param {string} filename - The filename for the downloaded PDF
   * @returns {Promise<void>} Promise that resolves when PDF is generated and downloaded
   */
  async exportToPDF(documentElement, filename) {
    try {
      // Validate inputs
      if (!documentElement) {
        throw new Error('Document element is required');
      }
      
      if (!filename) {
        throw new Error('Filename is required');
      }

      // Check if libraries are available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error('jsPDF library is not loaded. Please refresh the page.');
      }

      if (!window.html2canvas) {
        throw new Error('html2canvas library is not loaded. Please refresh the page.');
      }

      // Clone the element
      const clonedElement = documentElement.cloneNode(true);

      // Convert relative image paths to absolute URLs
      const images = clonedElement.querySelectorAll('img');
      images.forEach(img => {
        if (img.src && !img.src.startsWith('http') && !img.src.startsWith('data:')) {
          const absoluteUrl = new URL(img.src, window.location.href).href;
          img.src = absoluteUrl;
        }
      });

      // Apply computed styles inline
      this.applyComputedStyles(clonedElement);

      // Set wrapper styles
      clonedElement.style.width = '800px';
      clonedElement.style.padding = '20px';
      clonedElement.style.backgroundColor = '#ffffff';
      clonedElement.style.color = '#000000';
      clonedElement.style.fontFamily = 'Arial, sans-serif';

      // Temporarily append to body (hidden)
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      document.body.appendChild(clonedElement);

      try {
        // Capture with html2canvas at lower quality for smaller file size
        const canvas = await window.html2canvas(clonedElement, {
          scale: 1.5, // Reduced from 2 to 1.5 for smaller file size
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 800,
          windowWidth: 800
        });

        // Remove temporary element
        document.body.removeChild(clonedElement);

        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        
        // Convert to JPEG instead of PNG for smaller file size
        const imgData = canvas.toDataURL('image/jpeg', 0.85); // 85% quality
        
        // A4 dimensions
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If content fits on one page, just add it
        if (imgHeight <= (pageHeight - 2 * margin)) {
          pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
        } else {
          // Multiple pages needed - split content properly
          const pageContentHeight = pageHeight - (2 * margin);
          const totalPages = Math.ceil(imgHeight / pageContentHeight);
          
          for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
              pdf.addPage();
            }
            
            // Calculate the Y offset for this page
            const sourceY = page * pageContentHeight;
            const sourceHeight = Math.min(pageContentHeight, imgHeight - sourceY);
            
            // Create a temporary canvas for this page's content
            const pageCanvas = document.createElement('canvas');
            const pageCtx = pageCanvas.getContext('2d');
            
            // Calculate source dimensions in canvas pixels
            const sourceYPixels = (sourceY / imgHeight) * canvas.height;
            const sourceHeightPixels = (sourceHeight / imgHeight) * canvas.height;
            
            pageCanvas.width = canvas.width;
            pageCanvas.height = sourceHeightPixels;
            
            // Draw only this page's portion
            pageCtx.drawImage(
              canvas,
              0, sourceYPixels, canvas.width, sourceHeightPixels,
              0, 0, canvas.width, sourceHeightPixels
            );
            
            // Convert to JPEG and add to PDF
            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, sourceHeight);
          }
        }

        // Save the PDF
        pdf.save(filename);

      } catch (canvasError) {
        if (clonedElement.parentNode) {
          document.body.removeChild(clonedElement);
        }
        throw canvasError;
      }

    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
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
