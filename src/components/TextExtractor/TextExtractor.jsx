import "./TextExtractor.css";
import { FaRegCopy, FaFileLines } from "react-icons/fa6";

const TextExtractor = ({ textElements = [] }) => {
  const text =
    textElements.length > 0
      ? textElements.join("\n\n")
      : "";

  const copyText = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="text-extractor">

      <div className="text-header">
        <div>
          <h2>Extracted Text</h2>
          <p>Copy all readable text from the current webpage.</p>
        </div>

        <button
          className="copy-btn"
          onClick={copyText}
          disabled={!text}
        >
          <FaRegCopy />
          Copy
        </button>
      </div>

      {text ? (
        <textarea
          className="text-output"
          value={text}
          readOnly
        />
      ) : (
        <div className="text-empty">

          <FaFileLines size={44} />

          <h3>No Text Available</h3>

          <p>
            Scan the current page to extract readable
            text content.
          </p>

        </div>
      )}

    </div>
  );
};

export default TextExtractor;