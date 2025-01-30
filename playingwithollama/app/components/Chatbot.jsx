// app/components/Chatbot.js
"use client";
import { useState } from "react";

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [model, setModel] = useState("mistral");

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user input to chat history
    setChatHistory([...chatHistory, { sender: "You", message: userInput }]);
    setUserInput("");

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, userInput }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setChatHistory([
        ...chatHistory,
        { sender: "You", message: userInput },
        { sender: "Bot", message: data.response },
      ]);
    } catch (error) {
      console.error(error);
      setChatHistory([
        ...chatHistory,
        { sender: "Bot", message: "Error: Could not reach the server." },
      ]);
    }
  };

  return (
    <div>
      <h2>Ollama Chatbot</h2>
      <div>
        Current Model:
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="mistral">Mistral (Latest)</option>
          <option value="gemma:latest">Gemma (Latest)</option>
          <option value="deepseek-r1">DeepSeek-r1</option>
        </select>
      </div>

      <div>
        {chatHistory.map((entry, index) => (
          <div
            key={index}
            style={{ textAlign: entry.sender === "You" ? "right" : "left" }}
          >
            <strong>{entry.sender}: </strong>
            {entry.message}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;
