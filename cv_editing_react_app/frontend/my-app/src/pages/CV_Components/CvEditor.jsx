import Experience from "./Experience";
import Education from "./Education";
import Projects from "./Projects";
import Publications from "./Publications";
import Skills from "./Skills";
import SummarySection from "./SummarySection";
import ResumePreview from "./ResumePreview";
import axios from "axios";
import { useState, useRef } from "react";
import { apiUrl } from "../../utlis/api";

export default function CvEditor({ form, setForm, analysis, cvData }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const openUploadDialog = () => {
    fileInputRef.current?.click();
  };

  const handleUploadJSON = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setForm(parsed);
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage("Uploaded file is not valid JSON.");
      }
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read the uploaded file.");
    };
    reader.readAsText(file);

    event.target.value = "";
  };

  const handleReset = () => {
    setForm(cvData);
  };

  const handleSubmit = async (
    e,
    sections = ["summary", "experience", "projects", "skills"],
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        sections,
      };

      const response = await axios.post(apiUrl("/edit-cv"), payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setForm((prev) => ({
        ...prev,
        ...(response.data.summary !== undefined
          ? { summary: response.data.summary }
          : {}),
        ...(response.data.experience !== undefined
          ? { experience: response.data.experience }
          : {}),
        ...(response.data.projects !== undefined
          ? { projects: response.data.projects }
          : {}),
        ...(response.data.skills !== undefined
          ? { skills: response.data.skills }
          : {}),
      }));

      setErrorMessage(null);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        `An error occurred while processing your request. ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadJSON = () => {
    const json = JSON.stringify(form, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "CV_DATA.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // Summary Handle

  const handleSummaryChange = (value) => {
    setForm((prev) => ({
      ...prev,
      summary: value,
    }));
  };

  /* -------- EDUCATION HANDLERS -------- */
  const handleEducationChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.education];

      updated[index] = {
        ...updated[index],
        [field]: value === "" ? null : value,
      };

      return { ...prev, education: updated };
    });
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          area: "",
          degree: "",
          start_date: "",
          end_date: "",
          location: "",
          highlights: [],
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setForm((prev) => {
      const updated = [...prev.education];
      updated.splice(index, 1);
      return { ...prev, education: updated };
    });
  };

  /* -------- EXPERIENCE HANDLERS -------- */
  const handleExperienceChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.experience];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return { ...prev, experience: updated };
    });
  };

  const handleExperienceHighlightChange = (expIndex, hlIndex, value) => {
    setForm((prev) => {
      const updated = [...prev.experience];
      const highlights = [...updated[expIndex].highlights];

      highlights[hlIndex] = value;

      updated[expIndex] = {
        ...updated[expIndex],
        highlights,
      };

      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          position: "",
          start_date: "",
          end_date: "",
          location: "",
          highlights: [],
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setForm((prev) => {
      const updated = [...prev.experience];
      updated.splice(index, 1);
      return { ...prev, experience: updated };
    });
  };

  const addExperienceHighlight = (expIndex) => {
    setForm((prev) => {
      const updated = [...prev.experience];
      if (!updated[expIndex].highlights) {
        updated[expIndex].highlights = [];
      }
      updated[expIndex].highlights.push("");
      return { ...prev, experience: updated };
    });
  };

  const removeExperienceHighlight = (expIndex, hlIndex) => {
    setForm((prev) => {
      const updated = [...prev.experience];
      updated[expIndex].highlights.splice(hlIndex, 1);
      return { ...prev, experience: updated };
    });
  };

  /* -------- PROJECTS HANDLERS -------- */
  const handleProjectChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.projects];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return { ...prev, projects: updated };
    });
  };

  const handleProjectHighlightChange = (projIndex, hlIndex, value) => {
    setForm((prev) => {
      const updated = [...prev.projects];
      const highlights = [...updated[projIndex].highlights];

      highlights[hlIndex] = value;

      updated[projIndex] = {
        ...updated[projIndex],
        highlights,
      };

      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "",
          start_date: "",
          end_date: "",
          summary: "",
          highlights: [],
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setForm((prev) => {
      const updated = [...prev.projects];
      updated.splice(index, 1);
      return { ...prev, projects: updated };
    });
  };

  const addProjectHighlight = (projIndex) => {
    setForm((prev) => {
      const updated = [...prev.projects];
      if (!updated[projIndex].highlights) {
        updated[projIndex].highlights = [];
      }
      updated[projIndex].highlights.push("");
      return { ...prev, projects: updated };
    });
  };

  const removeProjectHighlight = (projIndex, hlIndex) => {
    setForm((prev) => {
      const updated = [...prev.projects];
      updated[projIndex].highlights.splice(hlIndex, 1);
      return { ...prev, projects: updated };
    });
  };

  /* -------- PUBLICATIONS HANDLERS -------- */
  const handlePublicationChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.publications];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return { ...prev, publications: updated };
    });
  };

  const addPublication = () => {
    setForm((prev) => ({
      ...prev,
      publications: [
        ...prev.publications,
        {
          title: "",
          authors: [],
          summary: null,
          doi: "",
          url: "",
          journal: "",
          date: "",
        },
      ],
    }));
  };

  const removePublication = (index) => {
    setForm((prev) => {
      const updated = [...prev.publications];
      updated.splice(index, 1);
      return { ...prev, publications: updated };
    });
  };

  /* -------- SKILLS HANDLERS -------- */
  const handleSkillChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.skills];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return { ...prev, skills: updated };
    });
  };

  const addSkill = () => {
    setForm((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          label: "",
          details: "",
        },
      ],
    }));
  };

  const removeSkill = (index) => {
    setForm((prev) => {
      const updated = [...prev.skills];
      updated.splice(index, 1);
      return { ...prev, skills: updated };
    });
  };

  const renderInput = (label, name) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <input
        type="text"
        className="form-control"
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
      />
    </div>
  );
  return (
    <>
      <div className="container-fluid py-4">
        {/* Reset Button */}
        <button
          className="btn btn-outline-danger mb-4 me-2"
          disabled={loading}
          onClick={handleReset}
        >
          Reset the CV Data 🔄
        </button>

        {/* Download Button */}
        <button
          className="btn btn-outline-info mb-4 me-2"
          disabled={loading}
          onClick={handleDownloadJSON}
        >
          Download CV as JSON 📥
        </button>

        <input
          type="file"
          accept="application/json,.json"
          ref={fileInputRef}
          onChange={handleUploadJSON}
          style={{ display: "none" }}
        />

        <button
          className="btn btn-outline-secondary mb-4 me-2"
          disabled={loading}
          onClick={openUploadDialog}
        >
          Upload CV JSON 📤
        </button>

        {/* Error */}
        {errorMessage && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 9999,
              minWidth: "300px",
            }}
          >
            {errorMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorMessage(null)}
            />
          </div>
        )}

        <div className="row g-4">
          {/* LEFT SIDE */}
          <div className="col-lg-5">
            <div className="accordion" id="cvAccordion">
              {/* PERSONAL INFO */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#personal"
                  >
                    Personal Info
                  </button>
                </h2>

                <div
                  id="personal"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body">
                    {renderInput("Name", "name")}
                    {renderInput("Headline", "headline")}
                    {renderInput("Location", "location")}
                    {renderInput("Email", "email")}
                    {renderInput("Phone", "phone")}
                    {renderInput("Website", "website")}
                    {renderInput("Youtube", "youtube")}
                    {renderInput("LinkedIn", "linkedin")}
                    {renderInput("GitHub", "github")}
                    {renderInput("Google Scholar", "google_scholar")}
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <div className="d-flex align-items-center">
                    <button
                      className="accordion-button collapsed flex-grow-1"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#summary"
                    >
                      Summary
                    </button>
                  </div>
                </h2>

                <div
                  id="summary"
                  className="accordion-collapse collapse"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body justify-content-between">
                    <SummarySection
                      summary={form.summary}
                      handleSummaryChange={handleSummaryChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm ms-2 me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit(e, ["summary"]);
                      }}
                    >
                      ✨ AI Edit Summary
                    </button>
                  </div>
                </div>
              </div>

              {/* EDUCATION */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#education"
                  >
                    Education
                  </button>
                </h2>

                <div
                  id="education"
                  className="accordion-collapse collapse"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body">
                    <Education
                      education={form.education}
                      onEducationChange={handleEducationChange}
                      onAddEducation={addEducation}
                      onRemoveEducation={removeEducation}
                    />
                  </div>
                </div>
              </div>

              {/* EXPERIENCE */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#experience"
                  >
                    Experience
                  </button>
                </h2>

                <div
                  id="experience"
                  className="accordion-collapse collapse"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body">
                    <Experience
                      experience={form.experience}
                      onExperienceChange={handleExperienceChange}
                      onExperienceHighlightChange={
                        handleExperienceHighlightChange
                      }
                      onAddExperience={addExperience}
                      onRemoveExperience={removeExperience}
                      onAddHighlight={addExperienceHighlight}
                      onRemoveHighlight={removeExperienceHighlight}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm ms-2 me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit(e, ["experience"]);
                      }}
                    >
                      ✨ AI Edit Experience
                    </button>
                  </div>
                </div>
              </div>

              {/* PROJECTS */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#projects"
                  >
                    Projects
                  </button>
                </h2>

                <div
                  id="projects"
                  className="accordion-collapse collapse"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body">
                    <Projects
                      projects={form.projects}
                      onProjectChange={handleProjectChange}
                      onProjectHighlightChange={handleProjectHighlightChange}
                      onAddProject={addProject}
                      onRemoveProject={removeProject}
                      onAddHighlight={addProjectHighlight}
                      onRemoveHighlight={removeProjectHighlight}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm ms-2 me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit(e, ["projects"]);
                      }}
                    >
                      ✨ AI Edit Projects
                    </button>
                  </div>
                </div>
              </div>

              {/* PUBLICATIONS */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#publications"
                  >
                    Publications
                  </button>
                </h2>

                <div
                  id="publications"
                  className="accordion-collapse collapse"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body">
                    <Publications
                      publications={form.publications}
                      onPublicationChange={handlePublicationChange}
                      onAddPublication={addPublication}
                      onRemovePublication={removePublication}
                    />
                  </div>
                </div>
              </div>

              {/* SKILLS */}
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#skills"
                  >
                    Skills
                  </button>
                </h2>

                <div
                  id="skills"
                  className="accordion-collapse collapse"
                  data-bs-parent="#cvAccordion"
                >
                  <div className="accordion-body">
                    <Skills
                      skills={form.skills}
                      onSkillChange={handleSkillChange}
                      onAddSkill={addSkill}
                      onRemoveSkill={removeSkill}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm ms-2 me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmit(e, ["skills"]);
                      }}
                    >
                      ✨ AI Edit Skills
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <button
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                  onClick={(e) =>
                    handleSubmit(e, [
                      "summary",
                      "experience",
                      "projects",
                      "skills",
                    ])
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    "Align CV with The Job 🚀"
                  )}
                </button>

                <ResumePreview form={form} loading={loading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
