"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as themes from "react-syntax-highlighter/dist/esm/styles/prism";
import "./Chatbot.scss";

const modelNames = {
  mistral: "Mistral (Latest)",
  "gemma:latest": "Gemma (Latest)",
  "deepseek-r1:7b": "DeepSeek-R1:7b",
  "llava:7b": "LLaVA:7b",
};

const highlightThemes = Object.keys(themes).reduce((acc, key) => {
  const displayName = key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
  return { ...acc, [key]: displayName };
}, {});

const LoadingIndicator = () => {
  // const [dots, setDots] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // const dotsInterval = setInterval(() => {
    //   setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    // }, 500);

    const timerInterval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      // clearInterval(dotsInterval);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <div className="loading-container">
      <span className="loading-timer">({seconds}s)</span>
      <span className="loading-dots">Thinking...</span>
    </div>
  );
};

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [model, setModel] = useState("mistral");
  const [highlightTheme, setHighlightTheme] = useState("duotoneSea");
  const [isLoading, setIsLoading] = useState(false);

  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
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
    if (!userInput.trim() || isLoading) return;

    const senderName = modelNames[model] || model;
    const userMessage = userInput;
    setUserInput("");
    setIsLoading(true);

    setChatHistory((prev) => [
      ...prev,
      { sender: "You", message: userMessage },
      { sender: senderName, message: "", isLoading: true },
    ]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, userInput: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();

      setChatHistory((prev) =>
        prev.slice(0, -1).concat({ sender: senderName, message: data.response })
      );
    } catch (error) {
      console.error(error);
      setChatHistory((prev) =>
        prev.slice(0, -1).concat({
          sender: senderName,
          message: "Error: Could not reach the server.",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ollama-chatbot">
      <header>
        <div className="top-row">
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
        </div>
        <div className="other-options">
          <div className="highlight-select">
            <span>Code Highlighting:</span>
            <select
              value={highlightTheme}
              onChange={(e) => setHighlightTheme(e.target.value)}
              className="theme-select"
            >
              {Object.entries(highlightThemes).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.map((entry, index) => (
          <div key={index} className={entry.sender === "You" ? "you" : "bot"}>
            <div
              className={entry.sender === "You" ? "you-header" : "bot-header"}
            >
              <strong>{entry.sender}: </strong>
              {entry.isLoading && <LoadingIndicator />}
            </div>
            {entry.isLoading ? (
              <div className="message loading"></div>
            ) : (
              <div className="message">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={themes[highlightTheme]}
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
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
