import pdfParse from 'pdf-parse';

export interface PageDocument {
  pageContent: string;
  metadata: {
    filename: string;
    page: number;
    totalPages: number;
  };
}

export async function parsePdfFile(
  filename: string,
  buffer: Buffer
): Promise<PageDocument[]> {
  const pages: Array<{ pageNumber: number; text: string }> = [];

  const customPagerender = async (pageData: any) => {
    try {
      const textContent = await pageData.getTextContent();
      let lastY: number | undefined;
      let text = '';
      for (const item of textContent.items) {
        if (!lastY || lastY === item.transform[5]) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      pages.push({
        pageNumber: pageData.pageIndex + 1,
        text: text.trim(),
      });
      return text;
    } catch (err) {
      console.warn(`[PDF Parse] Error rendering page ${pageData.pageIndex + 1}:`, err);
      return '';
    }
  };

  try {
    const data = await pdfParse(buffer, {
      pagerender: customPagerender,
    });

    const totalPages = data.numpages || pages.length || 1;

    // If custom pagerender didn't populate pages (e.g. single-page or fallback format), use full parsed text
    if (pages.length === 0 && data.text) {
      return [
        {
          pageContent: data.text.trim(),
          metadata: {
            filename,
            page: 1,
            totalPages: totalPages,
          },
        },
      ];
    }

    return pages
      .filter((p) => p.text.length > 0)
      .map((p) => ({
        pageContent: p.text,
        metadata: {
          filename,
          page: p.pageNumber,
          totalPages: totalPages,
        },
      }));
  } catch (error) {
    console.error(`[PDF Parser Error] Failed to parse ${filename}:`, error);
    throw new Error(`Failed to parse PDF document '${filename}': ${(error as Error).message}`);
  }
}
