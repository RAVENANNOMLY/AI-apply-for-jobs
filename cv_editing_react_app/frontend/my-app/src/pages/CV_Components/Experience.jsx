import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Experience({
  experience = [],
  onExperienceChange,
  onExperienceHighlightChange,
  onAddExperience,
  onRemoveExperience,
  onAddHighlight,
  onRemoveHighlight,
}) {
  /* -------- HELPER FUNCTIONS -------- */
  const convertDateToString = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const convertStringToDate = (dateString) => {
    if (!dateString) return null;
    const [year, month] = dateString.split("-");
    return new Date(year, parseInt(month) - 1, 1);
  };

return (
  <div className="mb-4">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="mb-0">Experience</h4>

      <button
        className="btn btn-outline-primary btn-sm"
        onClick={onAddExperience}
      >
        + Add Experience
      </button>
    </div>

    {/* List */}
    {experience && experience.length > 0 ? (
      experience.map((exp, index) => (
        <div key={index} className="card mb-3 shadow-sm">
          <div className="card-body">

            {/* Company + Position */}
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Company"
                  value={exp.company || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "company", e.target.value)
                  }
                />
              </div>

              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Position"
                  value={exp.position || ""}
                  onChange={(e) =>
                    onExperienceChange(index, "position", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Dates */}
            <div className="row g-3 mb-2">
              <div className="col-md-4">
                <label className="form-label">Start Date</label>

                <DatePicker
                  selected={convertStringToDate(exp.start_date)}
                  onChange={(date) =>
                    onExperienceChange(
                      index,
                      "start_date",
                      convertDateToString(date)
                    )
                  }
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  placeholderText="Start date"
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">End Date</label>

                <DatePicker
                  selected={
                    exp.end_date === "present"
                      ? null
                      : convertStringToDate(exp.end_date)
                  }
                  onChange={(date) =>
                    onExperienceChange(
                      index,
                      "end_date",
                      date ? convertDateToString(date) : "present"
                    )
                  }
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  placeholderText="End date"
                  className="form-control"
                  isClearable
                />
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={exp.end_date === "present"}
                    onChange={(e) =>
                      onExperienceChange(
                        index,
                        "end_date",
                        e.target.checked ? "present" : ""
                      )
                    }
                    id={`present-${index}`}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`present-${index}`}
                  >
                    Currently working here
                  </label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-3">
              <input
                className="form-control"
                placeholder="Location"
                value={exp.location || ""}
                onChange={(e) =>
                  onExperienceChange(index, "location", e.target.value)
                }
              />
            </div>

            {/* Highlights */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Highlights</h6>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onAddHighlight(index)}
                >
                  + Add Highlight
                </button>
              </div>

              {exp.highlights && exp.highlights.length > 0 ? (
                exp.highlights.map((h, hlIndex) => (
                  <div key={hlIndex} className="position-relative mb-2">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder={`Highlight ${hlIndex + 1}`}
                      value={h || ""}
                      onChange={(e) =>
                        onExperienceHighlightChange(
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
                <div className="text-muted small">
                  No highlights added yet
                </div>
              )}
            </div>

            {/* Remove Experience */}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRemoveExperience(index)}
            >
              Remove Experience
            </button>

          </div>
        </div>
      ))
    ) : (
      <div className="alert alert-secondary">
        No experience added yet. Click <strong>Add Experience</strong> to get started.
      </div>
    )}
  </div>
);
}

/* -------- PROP TYPES VALIDATION -------- */
Experience.propTypes = {
  experience: PropTypes.arrayOf(
    PropTypes.shape({
      company: PropTypes.string,
      position: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      location: PropTypes.string,
      highlights: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  onExperienceChange: PropTypes.func.isRequired,
  onExperienceHighlightChange: PropTypes.func.isRequired,
  onAddExperience: PropTypes.func.isRequired,
  onRemoveExperience: PropTypes.func.isRequired,
  onAddHighlight: PropTypes.func.isRequired,
  onRemoveHighlight: PropTypes.func.isRequired,
};

/* -------- DEFAULT PROPS -------- */
Experience.defaultProps = {
  experience: [],
};
