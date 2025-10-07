/**
 * Thermal Receipt Printing Utility
 * Forces browser to print in narrow thermal receipt format
 */

export interface ThermalPrintOptions {
  width?: number; // in mm
  fontSize?: number;
  lineHeight?: number;
  autoPrint?: boolean;
  closeAfterPrint?: boolean;
}

export const printThermalReceipt = (
  content: string,
  options: ThermalPrintOptions = {}
) => {
  const {
    width = 48, // 48mm standard thermal width
    fontSize = 8,
    lineHeight = 1.0,
    autoPrint = true,
    closeAfterPrint = true
  } = options;

  // Create a new window for thermal printing with aggressive sizing
  const printWindow = window.open(
    '',
    '_blank',
    `width=200,height=800,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no`
  );

  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  const thermalHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          /* Aggressive reset */
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
            margin: 0 !important;
            padding: 1mm !important;
            white-space: pre-wrap !important;
            background: white !important;
            color: black !important;
            width: ${width}mm !important;
            max-width: ${width}mm !important;
            overflow: hidden !important;
          }
          
          .thermal-receipt {
            width: ${width}mm !important;
            max-width: ${width}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-size: ${fontSize}px !important;
            line-height: ${lineHeight} !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          
          /* Force all content to fit in narrow width */
          .thermal-receipt * {
            max-width: ${width - 2}mm !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
            white-space: pre-wrap !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Aggressive print media queries */
          @media print {
            @page {
              size: ${width}mm auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            html, body {
              width: ${width}mm !important;
              max-width: ${width}mm !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }
            
            body { 
              margin: 0 !important; 
              padding: 1mm !important; 
              width: ${width}mm !important;
              max-width: ${width}mm !important;
              font-size: ${fontSize}px !important;
              line-height: ${lineHeight} !important;
            }
            
            .thermal-receipt {
              width: ${width}mm !important;
              max-width: ${width}mm !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: ${fontSize}px !important;
              line-height: ${lineHeight} !important;
            }
            
            .thermal-receipt * {
              max-width: ${width - 2}mm !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              white-space: pre-wrap !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            
            /* Force single page - prevent page breaks */
            * {
              overflow: visible !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-before: avoid !important;
              page-break-after: avoid !important;
            }
            
            /* Force exact colors */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="thermal-receipt">
          ${content}
        </div>
        <script>
          // Force thermal format immediately
          document.body.style.width = '${width}mm';
          document.body.style.maxWidth = '${width}mm';
          
          // Force window size
          window.resizeTo(200, 800);
          
          ${autoPrint ? `
          // Auto print after content loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 100);
          };
          ` : ''}
          
          // Close after print
          window.onafterprint = function() {
            ${closeAfterPrint ? 'window.close();' : ''}
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(thermalHTML);
  printWindow.document.close();
  printWindow.focus();

  return printWindow;
};

// Alternative method using iframe for better control
export const printThermalReceiptIframe = (
  content: string,
  options: ThermalPrintOptions = {}
) => {
  const {
    width = 48,
    fontSize = 9,
    lineHeight = 1.0
  } = options;

  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '300px';
  iframe.style.height = '600px';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('Failed to access iframe document');
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: ${fontSize}px; 
            line-height: ${lineHeight};
            margin: 0;
            padding: 1mm;
            width: ${width}mm;
            max-width: ${width}mm;
            background: white;
            color: black;
          }
          @media print {
            @page { size: ${width}mm auto; margin: 0; }
            body { width: ${width}mm; max-width: ${width}mm; }
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  iframeDoc.close();

  // Print the iframe content
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  // Clean up after printing
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
};
