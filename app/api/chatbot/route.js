// app/api/chatbot/route.js
import ollama from "ollama/dist/index.mjs";

export async function POST(req) {
  const { model, userInput } = await req.json();

  try {
    const response = await ollama.chat({
      model,
      messages: [{ role: "user", content: userInput }],
      stream: true,
    });

    let fullResponse = "";
    for await (const part of response) {
      fullResponse += part.message.content;
    }

    return new Response(JSON.stringify({ response: fullResponse }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ response: "Error: Could not reach the Ollama server." }),
      { status: 500 }
    );
  }
}
