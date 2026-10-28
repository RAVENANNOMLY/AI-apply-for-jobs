import { useEffect, useState, useMemo, useRef } from "react";
import Mustache from "mustache";
import { marked } from "marked";
import downloadPdf from "../../utlis/DownloadUtlis";

export default function ResumePreview({ form, loading }) {
  const [template, setTemplate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    fetch("/cv_template.html")
      .then((res) => res.text())
      .then(setTemplate);
  }, []);

  const mdToHtml = (text) => marked.parse(text || "");

  const renderedHtml = useMemo(() => {
    if (!template) return "";

    const experience = Array.isArray(form.experience) ? form.experience : [];
    const projects = Array.isArray(form.projects) ? form.projects : [];
    const processedForm = {
      ...form,

      // Markdown fields
      summary: mdToHtml(form.summary),

      // Experience highlights
      experience: experience.map((exp) => ({
        ...exp,
        highlights: (Array.isArray(exp.highlights) ? exp.highlights : []).map(
          mdToHtml,
        ),
      })),

      // Project highlights
      projects: projects.map((proj) => ({
        ...proj,
        highlights: (Array.isArray(proj.highlights) ? proj.highlights : []).map(
          mdToHtml,
        ),
      })),
    };

    return Mustache.render(template, processedForm);
  }, [template, form]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await downloadPdf(renderedHtml,form.name,'cv');
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
        <div className="card-body">
          {/* LOADING STATE */}
          {loading ? (
            <div className="animate-pulse">
              <div className="placeholder-glow mb-3">
                <span className="placeholder col-6"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-10"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-8"></span>
              </div>

              <div className="placeholder-glow mb-4">
                <span className="placeholder col-4"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-9"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-7"></span>
              </div>

              <div className="placeholder-glow mb-4">
                <span className="placeholder col-5"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-10"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-6"></span>
              </div>

              <div className="placeholder-glow">
                <span className="placeholder col-4"></span>
              </div>
            </div>
          ) : (
            <>
              {/* PREVIEW */}
                      <div
          ref={previewRef}
          className="mb-4 preview-content"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />

              {/* BUTTON */}
              <div className="d-flex justify-content-end">
                <button
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
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
