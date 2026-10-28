import { useState } from "react";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { apiUrl } from "../../utlis/api";

function ConnectionMessage({ form, connMessage, setConnMessage }) {
  const [loading, setLoading] = useState(false); // Add loading state
  const [errorMessage, setErrorMessage] = useState(null); // Add error state
  const generateConnectionMessage = async () => {
    setLoading(true); // Set loading to true when the button is clicked
    try {
      const selectedKeys = ["name", "headline", "summary", "experience"];

      const cvText = Object.fromEntries(
        selectedKeys.map((key) => [key, form[key]]),
      );

      const payload = {
        profileText: connMessage.profileText,
        wordLimit: connMessage.wordLimit,
        promptText: connMessage.promptText,
        cvText: cvText,
        creativity: connMessage.creativity,
      };
      const response = await axios.post(
        apiUrl("/generate-connection-message"),
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setConnMessage((prev) => ({
        ...prev,
        connectionMessage: response.data.message,
      }));

      setLoading(false); // Set loading to false when the response is received
    } catch (error) {
      setErrorMessage(
        error.response?.data ||
          error.message ||
          "Something went wrong while generating message",
      ); // Set error message if any

      setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
    } finally {
      setLoading(false); // Set loading to false in case of any error
    }
  };

  const prompts = {
    prompt1:
      "Generate a concise, professional LinkedIn connection request message. The message should be polite, personalized, and clearly state the reason for connecting. Avoid being too long, keep it under 3–4 sentences, and maintain a formal yet approachable tone.",

    prompt2:
      "Write a friendly, engaging, and thoughtful comment for a social media post. The comment should sound natural and human-like, add value to the discussion, and avoid generic phrases. Keep it short (2–4 sentences) and adapt the tone based on the context of the post.",
  };

  const handleFieldChange = (field, value) => {
    setConnMessage((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // derive active prompt (DO NOT STORE IN STATE)
  const activePrompt =
    connMessage.promptType === "prompt2" ? prompts.prompt2 : prompts.prompt1;

  return (
    <Container fluid>
      {errorMessage && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            minWidth: "300px",
          }}
        >
          {errorMessage}
        </div>
      )}

      <Row>
        {/* LEFT SIDE */}
        <Col md={6} style={{ borderRight: "1px solid #ddd", padding: "20px" }}>
          <h4>Input</h4>

          {/* PROFILE / POST */}
          <Form.Group className="mb-3">
            <Form.Label>Profile / Post</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={connMessage.profileText || ""}
              onChange={(e) => handleFieldChange("profileText", e.target.value)}
              placeholder="Paste profile or post here..."
            />
          </Form.Group>

          {/* WORD LIMIT */}
          <Form.Group className="mb-3">
            <Form.Label>Word Limit: {connMessage.wordLimit || 100}</Form.Label>
            <Form.Range
              min={20}
              max={300}
              value={connMessage.wordLimit || 100}
              onChange={(e) =>
                handleFieldChange("wordLimit", Number(e.target.value))
              }
            />
          </Form.Group>

          {/* Creativity */}
          <Form.Group className="mb-3">
            <Form.Label>Creativity: {connMessage.creativity ?? 0.5}</Form.Label>
            <Form.Range
              min={0.0}
              max={1.0}
              step={0.1}
              value={connMessage.creativity ?? 0.5}
              onChange={(e) =>
                handleFieldChange("creativity", Number(e.target.value))
              }
            />
          </Form.Group>

          {/* PROMPT SELECT */}
          <Form.Group className="mb-3">
            <Form.Label>Select Prompt</Form.Label>
            <Form.Select
              value={connMessage.promptType || "prompt1"}
              onChange={(e) => {
                (handleFieldChange("promptType", e.target.value),
                  handleFieldChange("promptText", prompts[e.target.value]));
              }}
            >
              <option value="prompt1">Professional Connection</option>
              <option value="prompt2">Post Comment</option>
            </Form.Select>
          </Form.Group>

          {/* PROMPT DISPLAY (READ ONLY) */}
          <Form.Group className="mb-3">
            <Form.Label>Active Prompt</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={connMessage.promptText || activePrompt}
              onChange={(e) => handleFieldChange("promptText", e.target.value)}
            />
          </Form.Group>

          <button
            className="btn btn-primary"
            onClick={generateConnectionMessage}
            disabled={loading || !connMessage.promptText?.trim()}
          >
            {loading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              />
            )}
            {loading ? "Generating Message..." : "Generate Message"}
          </button>
        </Col>

        {/* RIGHT SIDE */}
        <Col md={6} style={{ padding: "20px" }}>
          <h4>Output (Markdown Preview)</h4>

          <Card>
            <Card.Body style={{ minHeight: "400px" }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>

                  <div className="mt-3">Generating connection message...</div>
                </div>
              ) : (
                <ReactMarkdown>
                  {connMessage.connectionMessage ||
                    "Output will appear here..."}
                </ReactMarkdown>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ConnectionMessage;
