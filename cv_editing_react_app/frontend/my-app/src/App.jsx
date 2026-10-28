import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";

import CvEditor from "./pages/CV_Components/CvEditor";
import CoverLetterEditor from "./pages/CoverLetter_Components/CoverLetterEditor";
import JobDescriptionAnalysis from "./pages/JobAnalysis/JobDescriptionAnalysis";
import ConnectionMessage from "./pages/Connection/ConnectionMessage";
import Jobs from "./pages/JobList/Jobs";
import Navbar from "./components/Navbar";
import axios from "axios";
import { apiUrl } from "./utlis/api";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [playwrightProcessId, setPlaywrightProcessId] = useState(null);
  const [form, setForm] = useState({
    skills: [],
    experience: [],
    name: "",
  });

  const [cvData, setCvData] = useState({
    skills: [],
    experience: [],
    name: "",
  });

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", resolvedTheme);
    localStorage.setItem("theme", theme);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await axios.post(apiUrl("/load-cv-data"));
        setForm(response.data);
        setCvData(response.data);
      } catch (err) {
        console.error("Failed to load CV data:", err);
      }
    };

    loadData();
  }, []);

  const [connMessage, setConnMessage] = useState({
    profileText: "A Ml engineer at Meta",
    wordLimit: 50,
    creativity: Number(0.5),
    promptText:
      "Generate a personalized LinkedIn connection message based on the profile and my CV context.",
    cvText: {
      title: "Machine Learning Engineer",
      summary:
        "PhD in AI with experience in computer vision, deep learning, and transformers.",
      skills: ["Python", "PyTorch", "Computer Vision", "Transformers"],
      focus: "Research and production ML systems",
    },
  });

  const [coverLetterData, setCoverLetterData] = useState({
    company: "",
    job_title: "",
    cover_letter: "",
  });

  return (
    <>
      {/* FIXED NAVBAR WRAPPER */}
      <Navbar theme={theme} setTheme={setTheme} />

      <Container fluid style={{ paddingTop: "70px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <Jobs
                form={form}
                setForm={setForm}
                analysis={analysis}
                setAnalysis={setAnalysis}
                playwrightProcessId={playwrightProcessId}
                setPlaywrightProcessId={setPlaywrightProcessId}
              />
            }
          ></Route>

          <Route
            path="/job-analysis"
            element={
              <JobDescriptionAnalysis
                form={form}
                setForm={setForm}
                analysis={analysis}
                setAnalysis={setAnalysis}
              />
            }
          />

          <Route
            path="/resume"
            element={
              <CvEditor
                form={form}
                setForm={setForm}
                analysis={analysis}
                cvData={cvData}
              />
            }
          />

          <Route
            path="/cover-letter"
            element={
              <CoverLetterEditor
                form={form}
                setForm={setForm}
                analysis={analysis}
                setAnalysis={setAnalysis}
                coverLetterData={coverLetterData}
                setCoverLetterData={setCoverLetterData}
              />
            }
          />

          <Route
            path="/connection"
            element={
              <ConnectionMessage
                form={form}
                connMessage={connMessage}
                setConnMessage={setConnMessage}
              />
            }
          />
        </Routes>
      </Container>
    </>
  );
}

export default App;
