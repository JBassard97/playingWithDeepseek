"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./Chatbot.scss";

const modelNames = {
  mistral: "Mistral (Latest)",
  "gemma:latest": "Gemma (Latest)",
  "deepseek-r1:7b": "DeepSeek-R1:7b",
  "llava:7b": "LLaVA:7b",
};

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [model, setModel] = useState("mistral");

  // Ref for chat history container
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = 0; // Scroll to the top on update
    }
  }, [chatHistory]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Get the display name from the model mapping
    const senderName = modelNames[model] || model;

    setChatHistory([...chatHistory, { sender: "You", message: userInput }]);
    setUserInput("");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, userInput }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setChatHistory([
        ...chatHistory,
        { sender: "You", message: userInput },
        { sender: senderName, message: data.response },
      ]);
    } catch (error) {
      console.error(error);
      setChatHistory([
        ...chatHistory,
        { sender: senderName, message: "Error: Could not reach the server." },
      ]);
    }
  };

  return (
    <div className="ollama-chatbot">
      <header>
        <h2>Ollama Chatbot</h2>
        <div className="model-select">
          <span>Current Model:</span>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {Object.entries(modelNames).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.map((entry, index) => (
          <div key={index} className={entry.sender === "You" ? "you" : "bot"}>
            <strong
              className={entry.sender === "You" ? "you-header" : "bot-header"}
            >
              {entry.sender}:{" "}
            </strong>
            {entry.sender !== "You" ? (
              <div className="message">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={dracula}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {entry.message}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="message">{entry.message}</div>
            )}
          </div>
        ))}
      </div>
      <form className="user-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
