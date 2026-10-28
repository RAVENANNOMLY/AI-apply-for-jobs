import axios from "axios";
import { apiUrl } from "./api";

const downloadPdf = async (htmlString, name, doc_type) => {
  try {
    const response = await axios.post(
      apiUrl("/html-to-pdf"),
      {
        html_string: htmlString,
        name: name,
        doc_type: doc_type,
      },
      {
        responseType: "blob",
      },
    );

    // Create a blob from the PDF data
    const blob = new Blob([response.data], {
      type: "application/pdf",
    });

    // Create a temporary URL
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element and trigger download
    name = name ? name.trim().split(/\s+/).join("_") : "";
    const fileName = name ? `${name}_${doc_type}` : doc_type;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download PDF:", error);
  }
};

export default downloadPdf;
