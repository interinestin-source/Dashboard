
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { Invoice } from './types';


// export const generateInvoicePDF = async (invoice: Invoice, action: 'download' | 'print' = 'download') => {
//   const element = document.getElementById(`invoice-${invoice.id}`);
  
//   if (!element) {
//     console.error('Invoice element not found');
//     return;
//   }

//   try {
//     // Create canvas from HTML element
//     const canvas = await html2canvas(element, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: '#ffffff'
//     });

//     const imgData = canvas.toDataURL('image/png');
    
//     // Calculate dimensions
//     const imgWidth = 210; // A4 width in mm
//     const pageHeight = 295; // A4 height in mm
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//     let heightLeft = imgHeight;

//     // Create PDF
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     let position = 0;

//     // Add image to PDF
//     pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;

//     // Add new pages if content is longer than one page
//     while (heightLeft >= 0) {
//       position = heightLeft - imgHeight;
//       pdf.addPage();
//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;
//     }

//     const fileName = `${invoice.invoiceNumber}.pdf`;

//     if (action === 'download') {
//       // Download PDF
//       pdf.save(fileName);
//     } else if (action === 'print') {
//       // Open print dialog
//       const pdfBlob = pdf.output('blob');
//       const pdfUrl = URL.createObjectURL(pdfBlob);
//       const printWindow = window.open(pdfUrl);
      
//       if (printWindow) {
//         printWindow.onload = () => {
//           printWindow.print();
//           // Clean up the URL after printing
//           setTimeout(() => {
//             URL.revokeObjectURL(pdfUrl);
//           }, 1000);
//         };
//       }
//     }
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//   }
// };
