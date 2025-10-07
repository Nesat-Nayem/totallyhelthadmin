/**
 * Thermal Receipt Download Utility
 * Creates direct thermal format files without browser print dialog
 */

export interface ThermalDownloadOptions {
  width?: number; // in mm
  fontSize?: number;
  lineHeight?: number;
  format?: 'html' | 'png' | 'txt' | 'pdf';
}

export const downloadThermalReceipt = (
  content: string,
  options: ThermalDownloadOptions = {}
) => {
  const {
    width = 40, // 40mm narrow thermal width
    fontSize = 8,
    lineHeight = 1.0,
    format = 'html'
  } = options;

  try {
    switch (format) {
      case 'html':
        downloadThermalHTML(content, width, fontSize, lineHeight);
        break;
      case 'png':
        downloadThermalPNG(content, width, fontSize, lineHeight);
        break;
      case 'txt':
        downloadThermalTXT(content);
        break;
      case 'pdf':
        downloadThermalPDF(content, width, fontSize, lineHeight);
        break;
      default:
        downloadThermalHTML(content, width, fontSize, lineHeight);
    }
  } catch (error) {
    console.error('Thermal download failed:', error);
    // Fallback to text download
    downloadThermalTXT(content);
  }
};

const downloadThermalHTML = (content: string, width: number, fontSize: number, lineHeight: number) => {
  const thermalHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: ${width}mm auto;
            margin: 0;
            padding: 0;
          }
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          html, body {
            width: ${width}mm !important;
            max-width: ${width}mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          body {
            font-family: 'Courier New', 'Courier', monospace !important;
            font-size: ${fontSize}px !important;
            line-height: ${lineHeight} !important;
            width: ${width}mm !important;
            max-width: ${width}mm !important;
            margin: 0 !important;
            padding: 0.5mm !important;
            background: white !important;
            color: black !important;
            white-space: pre-wrap !important;
            overflow: hidden !important;
          }
          * {
            max-width: ${width - 1}mm !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            white-space: pre-wrap !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Force single page thermal format */
          .thermal-content {
            width: ${width}mm !important;
            max-width: ${width}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: ${fontSize}px !important;
            line-height: ${lineHeight} !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Prevent any page breaks */
          * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="thermal-content">
          ${content}
        </div>
      </body>
    </html>
  `;
  
  const blob = new Blob([thermalHTML], { type: 'text/html' });
  downloadBlob(blob, 'thermal-receipt.html');
};

const downloadThermalPNG = (content: string, width: number, fontSize: number, lineHeight: number) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas not supported');
  }
  
  // Set canvas size for thermal format
  const pixelWidth = Math.round(width * 3.779527559); // mm to pixels
  canvas.width = pixelWidth;
  canvas.height = 3000; // Tall enough for content
  
  // Set thermal format styling
  ctx.font = `${fontSize}px Courier New`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  // Split content into lines and draw
  const lines = content.replace(/<[^>]*>/g, '').split('\n');
  let y = 10;
  
  lines.forEach(line => {
    if (line.trim()) {
      // Handle long lines by wrapping
      const maxWidth = pixelWidth - 10;
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine !== '') {
          ctx.fillText(currentLine, 5, y);
          y += fontSize * lineHeight;
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        ctx.fillText(currentLine, 5, y);
        y += fontSize * lineHeight;
      }
    } else {
      y += fontSize * lineHeight / 2; // Empty line
    }
  });
  
  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, 'thermal-receipt.png');
    }
  }, 'image/png');
};

const downloadThermalTXT = (content: string) => {
  const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const blob = new Blob([textContent], { type: 'text/plain' });
  downloadBlob(blob, 'thermal-receipt.txt');
};

const downloadThermalPDF = (content: string, width: number, fontSize: number, lineHeight: number) => {
  // Create HTML with thermal format and let browser handle PDF conversion
  const thermalHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: ${width}mm auto;
            margin: 0;
            padding: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: ${fontSize}px;
            line-height: ${lineHeight};
            width: ${width}mm;
            max-width: ${width}mm;
            margin: 0;
            padding: 1mm;
            background: white;
            color: black;
            white-space: pre-wrap;
          }
          * {
            max-width: ${width - 2}mm;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
  
  const blob = new Blob([thermalHTML], { type: 'text/html' });
  downloadBlob(blob, 'thermal-receipt.html');
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Alternative method using jsPDF library (if available)
export const downloadThermalPDFAdvanced = (content: string) => {
  try {
    // Check if jsPDF is available
    if (typeof window !== 'undefined' && (window as any).jsPDF) {
      const { jsPDF } = (window as any);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [35, 'auto'] // 35mm width, auto height - narrower to match image 2
      });
      
      doc.setFont('courier');
      doc.setFontSize(7); // Smaller font for narrow format
      
      const lines = content.replace(/<[^>]*>/g, '').split('\n');
      let y = 10;
      
      lines.forEach(line => {
        if (line.trim()) {
          doc.text(line, 2, y);
          y += 3;
        } else {
          y += 1.5;
        }
      });
      
      doc.save('thermal-receipt.pdf');
    } else {
      // Fallback to HTML method (more reliable)
      downloadThermalReceipt(content, { format: 'html' });
    }
  } catch (error) {
    console.error('Advanced PDF generation failed:', error);
    // Fallback to HTML method
    downloadThermalReceipt(content, { format: 'html' });
  }
};
