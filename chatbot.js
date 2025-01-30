document.getElementById("send-btn").addEventListener("click", sendMessage);
document
  .getElementById("user-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput.trim()) return;

  appendMessage("You: " + userInput);
  document.getElementById("user-input").value = "";

  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: userInput,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    appendMessage("Bot: " + (data.response || "No response"));
  } catch (error) {
    appendMessage("Error: Could not reach Ollama server.");
    console.error(error);
  }
}

function appendMessage(message) {
  const chatbox = document.getElementById("chatbox");
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}
