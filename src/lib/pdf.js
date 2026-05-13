import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

export async function generateReport(clientName, { totalLeads, estimatedRevenue }) {
  const element = document.getElementById('dashboard-content')

  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: '#080f1a',
    logging: false,
  })

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  // Dark background
  pdf.setFillColor(8, 15, 26)
  pdf.rect(0, 0, pageW, pageH, 'F')

  // Header strip
  pdf.setFillColor(13, 31, 53)
  pdf.rect(0, 0, pageW, 34, 'F')

  // Logo dot
  pdf.setFillColor(59, 130, 246)
  pdf.roundedRect(14, 8, 10, 10, 2, 2, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('A', 18, 15.5, { align: 'center' })

  // Title
  pdf.setFontSize(14)
  pdf.text('Allterra AI — Monthly Report', 28, 15)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(148, 163, 184)
  pdf.text(`Client: ${clientName}  ·  ${format(new Date(), 'MMMM yyyy')}  ·  Generated ${format(new Date(), 'dd MMM yyyy')}`, 28, 23)

  // Summary stats strip
  pdf.setFillColor(18, 37, 69)
  pdf.rect(0, 34, pageW, 16, 'F')
  pdf.setTextColor(148, 163, 184)
  pdf.setFontSize(8)
  pdf.text(`Total Leads: ${totalLeads}   |   Est. Revenue: R${estimatedRevenue.toLocaleString()}`, 14, 44)

  // Dashboard screenshot
  const imgData = canvas.toDataURL('image/png')
  const imgW = pageW
  const imgH = (canvas.height * imgW) / canvas.width
  const yStart = 52
  const maxH = pageH - yStart - 6

  if (imgH <= maxH) {
    pdf.addImage(imgData, 'PNG', 0, yStart, imgW, imgH)
  } else {
    // Multi-page
    let remaining = imgH
    let srcY = 0
    let page = 0

    while (remaining > 0) {
      if (page > 0) {
        pdf.addPage()
        pdf.setFillColor(8, 15, 26)
        pdf.rect(0, 0, pageW, pageH, 'F')
      }

      const sliceH = Math.min(remaining, page === 0 ? maxH : pageH - 12)
      const destY = page === 0 ? yStart : 6

      pdf.addImage(imgData, 'PNG', 0, destY - (srcY * pageW) / canvas.width, imgW, imgH)

      srcY += sliceH
      remaining -= sliceH
      page++
    }
  }

  pdf.save(`allterra-${clientName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM')}.pdf`)
}
