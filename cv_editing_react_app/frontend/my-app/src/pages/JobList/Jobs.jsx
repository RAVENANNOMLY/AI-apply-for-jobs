import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiUrl } from "../../utlis/api";

function Jobs({
  form,
  setForm,
  analysis,
  setAnalysis,
  playwrightProcessId,
  setPlaywrightProcessId,
}) {
  const [minScore, setMinScore] = useState(0);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchUrl, setSearchUrl] = useState("");
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [datePosted, setDatePosted] = useState("past24Hours");
  const [underTenApplicants, setUnderTenApplicants] = useState(false);
  const [searchLimit, setSearchLimit] = useState(2);
  const [showSidebar, setShowSidebar] = useState(false);
  const [createdAfterDate, setCreatedAfterDate] = useState(null);

  const handleAutomatedSearch = async () => {
    try {
      setLoadingSearch(true);

      const res = await axios.post(apiUrl("/automated-job-search"), {
        search_url: searchUrl,
        keywords: searchKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        location: searchLocation.trim() || null,
        date_posted: datePosted,
        under_10_applicants: underTenApplicants,
        limit: searchLimit,
      });

      const processId = res.data.process_id;
      console.log("Process ID:", processId);
      setPlaywrightProcessId(processId);
    } catch (error) {
      console.error(error);
      alert("Failed to perform automated job search");
    } finally {
      setLoadingSearch(false);
    }
  };

  const stopJob = async () => {
    try {
      if (!playwrightProcessId) return;

      await axios.post(
        apiUrl(`/automated-job-search/stop/${playwrightProcessId}`),
      );
      setPlaywrightProcessId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to stop job");
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(apiUrl("/jobs"));
        setJobListings(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const navigate = useNavigate();
  const handleUseJob = (job) => {
    setForm((prev) => ({
      ...prev,
      jobDescription: job.job_description,
    }));
    navigate("/job-analysis");
    setAnalysis(null); // Reset analysis state to get rid of previous analysis
  };

  const filteredJobs = jobListings
    .filter((job) => {
      const scoreMatch = job.matching_score >= minScore;

      const keywordMatch =
        keywordFilter === "" ||
        job.job_keywords.some((keyword) =>
          keyword.toLowerCase().includes(keywordFilter.toLowerCase()),
        );

      const jobCreatedDate = new Date(
        job.created_at.replace(" ", "T").split(".")[0],
      );

      const dateMatch = !createdAfterDate || jobCreatedDate >= createdAfterDate;

      return scoreMatch && keywordMatch && dateMatch;
    })
    .sort((a, b) => b.matching_score - a.matching_score);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <div className="text-muted">Loading job listings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative">
      {/* Top bar */}

      <button
        className="btn btn-lg position-fixed shadow-lg d-flex align-items-center gap-2"
        style={{
          top: "70px",
          right: "30px",
          zIndex: 1040,
          backgroundColor: "#4d45c9",
          color: "white",
          border: "white solid 1px",
          padding: "16px 28px",
          fontSize: "1.2rem",
          borderRadius: "20px",
        }}
        onClick={() => setShowSidebar(true)}
      >
        🔍 Search Jobs
      </button>

      {/* Sidebar overlay */}
      {showSidebar && (
        <>
          {/* backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-body"
            style={{ opacity: 0.4, zIndex: 1040 }}
            onClick={() => setShowSidebar(false)}
          />

          {/* drawer */}
          <div
            className="position-fixed top-0 start-0 h-100 bg-body shadow"
            style={{
              width: "520px",
              zIndex: 1050,
              padding: "16px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Controls</h5>
              <button
                className="btn-close"
                onClick={() => setShowSidebar(false)}
              />
            </div>

            {/* <button
              className="btn btn-outline-primary w-100 mb-3"
              onClick={handleLinkedinCredentials}
              disabled={loadingSearch}
            >
              {loadingSearch
                ? "Setting up..."
                : "Set up LinkedIn Credentials (Only Once)"}
            </button> */}

            <input
              className="form-control mb-3"
              placeholder="LinkedIn search URL"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
            />

            <input
              className="form-control mb-3"
              placeholder="Keywords, separated by commas"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />

            <input
              className="form-control mb-3"
              placeholder="Job location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />

            <select
              className="form-select mb-3"
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
            >
              <option value="past24Hours">Past 24 hours</option>
              <option value="pastWeek">Past week</option>
              <option value="pastMonth">Past month</option>
              <option value="anyTime">Any time</option>
            </select>

            <div className="form-check mb-3">
              <input
                id="under-ten-applicants"
                className="form-check-input"
                type="checkbox"
                checked={underTenApplicants}
                onChange={(e) => setUnderTenApplicants(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="under-ten-applicants"
              >
                Fewer than 10 applicants
              </label>
            </div>

            <label className="form-label" htmlFor="search-limit">
              Maximum jobs
            </label>
            <input
              id="search-limit"
              type="number"
              className="form-control mb-3"
              min="1"
              max="100"
              value={searchLimit}
              onChange={(e) => setSearchLimit(Number(e.target.value))}
            />

            <button
              className="btn btn-primary w-100 mb-3"
              onClick={handleAutomatedSearch}
              disabled={loadingSearch}
            >
              {loadingSearch ? "Searching..." : "Start Automated Job Search"}
            </button>

            <button className="btn btn-danger w-100" onClick={stopJob}>
              Cancel Search
            </button>

            <div className="col-md-6 my-3 d-flex  ">
              <label className="form-label mb-0">Job Scraped Date</label>

              <DatePicker
                className="form-control mb-0"
                selected={createdAfterDate}
                onChange={(date) => setCreatedAfterDate(date)}
                placeholderText="Select a date"
                isClearable
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <label className="form-label">Minimum Matching Score</label>
            <input
              type="number"
              className="form-control mb-3"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            />

            <label className="form-label">Keyword</label>
            <input
              type="text"
              className="form-control"
              placeholder="Python, AWS, LLM..."
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="container-fluid">
        <div className="mb-3">
          <strong>{filteredJobs.length}</strong> jobs found
        </div>

        <div className="row">
          {filteredJobs.map((job, index) => (
            <div className="col-lg-6 mb-4" key={index}>
              <div className="card h-100 shadow-sm">
                <div className="card-header">
                  <h5 className="mb-1">{job.job_title}</h5>
                  <small className="text-muted">
                    {job.company_name} • {job.job_location}
                  </small>
                </div>

                <div className="card-body">
                  <span
                    className={`badge mb-3 ${
                      job.matching_score < 40
                        ? "bg-danger"
                        : job.matching_score < 70
                          ? "bg-warning text-dark"
                          : "bg-success"
                    }`}
                  >
                    Match Score: {job.matching_score}
                  </span>

                  <p className="card-text fst-italic">{job.review}</p>

                  <div className="mt-2">
                    {job.job_keywords?.map((keyword, index) => (
                      <span
                        key={index}
                        className="badge bg-secondary me-2 mb-2"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <div className="mb-3 d-flex gap-2">
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      View Job
                    </a>

                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleUseJob(job)}
                    >
                      Use this Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Jobs;
