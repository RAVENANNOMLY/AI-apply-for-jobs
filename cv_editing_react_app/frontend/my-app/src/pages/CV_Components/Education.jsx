import PropTypes from "prop-types";
import DatePicker from "react-datepicker";

export default function Education({
  education = [],
  onEducationChange,
  onAddEducation,
  onRemoveEducation,
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
      <h4 className="mb-0">Education</h4>

      <button className="btn btn-outline-primary btn-sm" onClick={onAddEducation}>
        + Add Education
      </button>
    </div>

    {/* Education List */}
    {education && education.length > 0 ? (
      education.map((edu, index) => (
        <div key={index} className="card mb-3 shadow-sm">
          <div className="card-body">

            {/* Row 1 */}
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Institution"
                  value={edu.institution || ""}
                  onChange={(e) =>
                    onEducationChange(index, "institution", e.target.value)
                  }
                />
              </div>

              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Area"
                  value={edu.area || ""}
                  onChange={(e) =>
                    onEducationChange(index, "area", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row g-3 mb-2">
              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Degree"
                  value={edu.degree || ""}
                  onChange={(e) =>
                    onEducationChange(index, "degree", e.target.value)
                  }
                />
              </div>

              <div className="col-md-6">
                <input
                  className="form-control"
                  placeholder="Location"
                  value={edu.location || ""}
                  onChange={(e) =>
                    onEducationChange(index, "location", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Row 3 - Dates */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Start Date</label>

                <DatePicker
                  selected={convertStringToDate(edu.start_date)}
                  onChange={(date) =>
                    onEducationChange(
                      index,
                      "start_date",
                      convertDateToString(date)
                    )
                  }
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  placeholderText="Select start date"
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">End Date</label>

                <DatePicker
                  selected={convertStringToDate(edu.end_date)}
                  onChange={(date) =>
                    onEducationChange(
                      index,
                      "end_date",
                      convertDateToString(date)
                    )
                  }
                  dateFormat="yyyy-MM"
                  showMonthYearPicker
                  placeholderText="Select end date"
                  className="form-control"
                  isClearable
                />
              </div>
            </div>

            {/* Remove Button */}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRemoveEducation(index)}
            >
              Remove Education
            </button>

          </div>
        </div>
      ))
    ) : (
      <div className="alert alert-secondary">
        No education added yet. Click <strong>Add Education</strong> to get started.
      </div>
    )}
  </div>
);
}

/* -------- PROP TYPES VALIDATION -------- */
Education.propTypes = {
  education: PropTypes.arrayOf(
    PropTypes.shape({
      institution: PropTypes.string,
      area: PropTypes.string,
      degree: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      location: PropTypes.string,
      highlights: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  onEducationChange: PropTypes.func.isRequired,
  onAddEducation: PropTypes.func.isRequired,
  onRemoveEducation: PropTypes.func.isRequired,
};

/* -------- DEFAULT PROPS -------- */
Education.defaultProps = {
  education: [],
};
