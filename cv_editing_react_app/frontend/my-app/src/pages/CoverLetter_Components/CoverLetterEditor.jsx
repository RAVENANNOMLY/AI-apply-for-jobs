import React, { useState } from "react";
import axios from "axios";
import CoverLetterPreview from "./CoverLetterPreview";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import { apiUrl } from "../../utlis/api";

const CoverLetterEditor = ({
  form,
  setForm,
  analysis,
  setAnalysis,
  coverLetterData,
  setCoverLetterData,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const cv_context = {
    name: form.name,
    email: form.email,
    phone: form.phone,
    website: form.website,
    experience: form.experience,
    projects: form.projects,
    education: form.education,
  };

  const sendRequest = async () => {
    try {
      setLoading(true);
      const jobAnalyticsPayload = analysis ?? form?.jobDescription ?? null;

      if (!jobAnalyticsPayload) {
        setErrorMessage(
          "Please provide a job description or run Job Analysis first.",
        );
        return;
      }

      const payload = {
        full_cv_context: form,
        job_analytics: jobAnalyticsPayload,
      };

      const { data } = await axios.post(
        apiUrl("/create-cover-letter"),
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setCoverLetterData({
        company: data.company,
        job_title: data.job_title,
        cover_letter: data.cover_letter,
      });

      setForm({
        ...form,
        cover_letter: data.cover_letter,
        job_title: data.job_title,
        company: data.company,
      });
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fullCvContext = {
    ...cv_context,
    company: coverLetterData.company,
    job_title: coverLetterData.job_title,
    cover_letter: coverLetterData.cover_letter?.replace(/\n/g, "<br>"),
  };

  return (
    <Container fluid>
      {/* Error */}
      {errorMessage && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {errorMessage}

          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage("")}
          />
        </div>
      )}

      <div className="row g-4">
        {/* LEFT SIDE */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4">Cover Letter Generator</h3>

              <button
                type="button"
                className="btn btn-primary w-100 mb-4"
                onClick={sendRequest}
                disabled={loading}
              >
                {loading && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                )}

                {loading ? "Generating..." : "Generate Cover Letter"}
              </button>

              <div className="card bg-body-tertiary">
                <div className="card-body">
                  <h5 className="card-title mb-3">Edit Cover Letter</h5>

                  {/* Company */}
                  <div className="mb-3">
                    <label className="form-label">Company</label>

                    <input
                      className="form-control"
                      value={coverLetterData.company}
                      onChange={(e) =>
                        setCoverLetterData((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Job Title */}
                  <div className="mb-3">
                    <label className="form-label">Job Title</label>

                    <input
                      className="form-control"
                      value={coverLetterData.job_title}
                      onChange={(e) =>
                        setCoverLetterData((prev) => ({
                          ...prev,
                          job_title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Cover Letter */}
                  <div className="mb-3">
                    <label className="form-label">Cover Letter</label>

                    <textarea
                      className="form-control"
                      rows={15}
                      value={coverLetterData.cover_letter}
                      onChange={(e) =>
                        setCoverLetterData((prev) => ({
                          ...prev,
                          cover_letter: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>

                  <div className="mt-3">Generating cover letter...</div>
                </div>
              ) : (
                <CoverLetterPreview
                  form={{
                    ...fullCvContext,
                    company: coverLetterData.company,
                    job_title: coverLetterData.job_title,
                    letter: coverLetterData.cover_letter,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CoverLetterEditor;
