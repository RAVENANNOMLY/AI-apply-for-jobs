import React, { useEffect, useState, useMemo, useRef } from "react";
import Mustache from "mustache";
import { marked } from "marked";
import downloadPdf from "../../utlis/DownloadUtlis";

export default function CoverLetterPreview({ form }) {
  const [template, setTemplate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    fetch("/cover_letter.html")
      .then((res) => res.text())
      .then(setTemplate);
  }, []);

  const renderedHtml = useMemo(() => {
    if (!template) return "";
    const formWithHtml = {
      ...form,
      cover_letter: marked.parse(form.cover_letter || ""),
    };
    return Mustache.render(template, formWithHtml);
  }, [template, form]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await downloadPdf(renderedHtml, form.name, 'cover_letter');
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!template) {
    return <div>Loading preview...</div>;
  }

  return (
    <div data-bs-theme="light">
      <div className="container py-4">
        <div className="card shadow-sm">
          <div className="card bg-body-tertiary">
            {/* Preview */}
            <div
              ref={previewRef}
              className="mb-4 preview-content"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* Download Button */}
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                )}

                {isDownloading ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
