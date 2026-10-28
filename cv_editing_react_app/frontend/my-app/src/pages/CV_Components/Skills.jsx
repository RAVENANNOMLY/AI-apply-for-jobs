import React from "react";
import PropTypes from "prop-types";

export default function Skills({
  skills = [],
  onSkillChange,
  onAddSkill,
  onRemoveSkill,
}) {
  return (
    <div className="mb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Skills</h4>

        <button className="btn btn-outline-primary btn-sm" onClick={onAddSkill}>
          + Add Skill
        </button>
      </div>

      {/* Skills List */}
      {skills && skills.length > 0 ? (
        skills.map((skill, index) => (
          <div key={index} className="card mb-3 shadow-sm">
            <div className="card-body">
              {/* Label */}
              <div className="mb-2">
                <input
                  className="form-control"
                  placeholder="Skill Label (e.g., Languages, ML Frameworks)"
                  value={skill.label || ""}
                  onChange={(e) =>
                    onSkillChange(index, "label", e.target.value)
                  }
                />
              </div>

              {/* Details */}
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Skill Details (e.g., Python, C++, CUDA, Rust, Julia)"
                  value={skill.details || ""}
                  onChange={(e) =>
                    onSkillChange(index, "details", e.target.value)
                  }
                />
              </div>

              {/* Remove Button */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onRemoveSkill(index)}
              >
                Remove Skill
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="alert alert-secondary">No skills added yet</div>
      )}
    </div>
  );
}

Skills.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      details: PropTypes.string,
    }),
  ),
  onSkillChange: PropTypes.func.isRequired,
  onAddSkill: PropTypes.func.isRequired,
  onRemoveSkill: PropTypes.func.isRequired,
};
