
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Publications({
  publications = [],
  onPublicationChange,
  onAddPublication,
  onRemovePublication,
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
    if (dateString.length === 4) return new Date(parseInt(dateString), 0, 1); // Only year
    const [year, month] = dateString.split("-");
    return new Date(year, parseInt(month) - 1, 1);
  };

return (
  <div className="mb-4">
    {/* Header */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="mb-0">Publications</h4>

      <button
        className="btn btn-outline-primary btn-sm"
        onClick={onAddPublication}
      >
        + Add Publication
      </button>
    </div>

    {/* Publications List */}
    {publications && publications.length > 0 ? (
      publications.map((pub, index) => (
        <div key={index} className="card mb-3 shadow-sm">
          <div className="card-body">

            {/* Title */}
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Title"
                value={pub.title || ""}
                onChange={(e) =>
                  onPublicationChange(index, "title", e.target.value)
                }
              />
            </div>

            {/* DOI */}
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="DOI (e.g., 10.1234/journal.2023.1234)"
                value={pub.doi || ""}
                onChange={(e) =>
                  onPublicationChange(index, "doi", e.target.value)
                }
              />
            </div>

            {/* URL */}
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="URL"
                value={pub.url || ""}
                onChange={(e) =>
                  onPublicationChange(index, "url", e.target.value)
                }
              />
            </div>

            {/* Journal */}
            <div className="mb-2">
              <input
                className="form-control"
                placeholder="Journal / Conference"
                value={pub.journal || ""}
                onChange={(e) =>
                  onPublicationChange(index, "journal", e.target.value)
                }
              />
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="form-label">Publication Date</label>

              <DatePicker
                selected={convertStringToDate(pub.date)}
                onChange={(date) =>
                  onPublicationChange(
                    index,
                    "date",
                    date ? convertDateToString(date) : ""
                  )
                }
                dateFormat="yyyy-MM"
                showMonthYearPicker
                placeholderText="Select date"
                className="form-control"
                isClearable
              />
            </div>

            {/* Remove Button */}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onRemovePublication(index)}
            >
              Remove Publication
            </button>

          </div>
        </div>
      ))
    ) : (
      <div className="alert alert-secondary">
        No publications added yet. Click <strong>+ Add Publication</strong> to get started.
      </div>
    )}
  </div>
);
}

/* -------- PROP TYPES VALIDATION -------- */
Publications.propTypes = {
  publications: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      authors: PropTypes.arrayOf(PropTypes.string),
      summary: PropTypes.string,
      doi: PropTypes.string,
      url: PropTypes.string,
      journal: PropTypes.string,
      date: PropTypes.string,
    })
  ),
  onPublicationChange: PropTypes.func.isRequired,
  onAddPublication: PropTypes.func.isRequired,
  onRemovePublication: PropTypes.func.isRequired,
};

/* -------- DEFAULT PROPS -------- */
Publications.defaultProps = {
  publications: [],
};