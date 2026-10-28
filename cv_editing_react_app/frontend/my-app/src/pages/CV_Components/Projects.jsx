import React, { useState } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Projects({
  projects = [],
  onProjectChange,
  onProjectHighlightChange,
  onAddProject,
  onRemoveProject,
  onAddHighlight,
  onRemoveHighlight,
}) {
  return (
  <div className="mb-4">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="mb-0">Projects</h4>

      <button
        className="btn btn-outline-primary btn-sm"
        onClick={onAddProject}
      >
        + Add Project
      </button>
    </div>

    {/* Projects List */}
    {projects && projects.length > 0 ? (
      projects.map((project, index) => (
        <div key={index} className="card mb-3 shadow-sm">
          <div className="card-body">

            {/* Name + URL */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Project Name"
                  value={project.name || ""}
                  onChange={(e) =>
                    onProjectChange(index, "name", e.target.value)
                  }
                />
              </div>

              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Project URL"
                  value={project.url || ""}
                  onChange={(e) =>
                    onProjectChange(index, "url", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Highlights Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Highlights</h6>

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onAddHighlight(index)}
              >
                + Add Highlight
              </button>
            </div>

            {/* Highlights List */}
            {project.highlights && project.highlights.length > 0 ? (
              project.highlights.map((h, hlIndex) => (
                <div key={hlIndex} className="position-relative mb-2">
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder={`Highlight ${hlIndex + 1}`}
                    value={h || ""}
                    onChange={(e) =>
                      onProjectHighlightChange(
                        index,
                        hlIndex,
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                    onClick={() =>
                      onRemoveHighlight(index, hlIndex)
                    }
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <div className="text-muted small mb-3">
                No highlights added yet
              </div>
            )}

            {/* Remove Project */}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRemoveProject(index)}
            >
              Remove Project
            </button>

          </div>
        </div>
      ))
    ) : (
      <div className="alert alert-secondary">
        No projects added yet. Click <strong>Add Project</strong> to get started.
      </div>
    )}
  </div>
);
}

/* -------- PROP TYPES VALIDATION -------- */
Projects.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      highlights: PropTypes.arrayOf(PropTypes.string),
    }),
  ),
  onProjectChange: PropTypes.func.isRequired,
  onProjectHighlightChange: PropTypes.func.isRequired,
  onAddProject: PropTypes.func.isRequired,
  onRemoveProject: PropTypes.func.isRequired,
  onAddHighlight: PropTypes.func.isRequired,
  onRemoveHighlight: PropTypes.func.isRequired,
};

/* -------- DEFAULT PROPS -------- */
Projects.defaultProps = {
  projects: [],
};
