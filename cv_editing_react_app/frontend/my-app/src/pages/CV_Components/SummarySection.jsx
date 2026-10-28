import PropTypes from "prop-types";

function SummarySection({ summary = "", handleSummaryChange }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Summary</h5>
        </div>

        {/* Textarea Label */}
        <div className="mb-2">
          <label className="form-label fw-semibold">
            Professional Summary
          </label>
        </div>

        {/* Textarea */}
        <div className="mb-2">
          <textarea
            className="form-control"
            rows={6}
            value={summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder="Write or generate your professional summary..."
          />
        </div>

      </div>
    </div>
  );
}

export default SummarySection;


/* -------- PROP TYPES VALIDATION -------- */
SummarySection.propTypes = {
  summary: PropTypes.string,
  handleSummaryChange: PropTypes.func.isRequired,
};

