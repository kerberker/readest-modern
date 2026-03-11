import * as pdfjsLib from 'pdfjs-dist'

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export async function loadPdf(filePath: string) {
  // Convert the file path to a URL that the browser can load
  const fileUrl = `asset://${filePath.replace(/\\/g, '/')}`
  const loadingTask = pdfjsLib.getDocument({ url: fileUrl, verbosity: 0 })
  return loadingTask.promise
}

export async function renderPage(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5,
): Promise<void> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })

  canvas.height = viewport.height
  canvas.width = viewport.width

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise
}

export async function extractText(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
): Promise<string> {
  const page = await pdf.getPage(pageNumber)
  const content = await page.getTextContent()
  return content.items
    .filter((item) => 'str' in item)
    .map((item) => (item as unknown as { str: string }).str)
    .join(' ')
}

export async function renderPageToDataUrl(
  filePath: string,
  pageNumber: number = 1,
  scale: number = 0.5,
): Promise<string> {
  const pdf = await loadPdf(filePath)
  const canvas = document.createElement('canvas')
  await renderPage(pdf, pageNumber, canvas, scale)
  return canvas.toDataURL('image/jpeg', 0.8)
}
