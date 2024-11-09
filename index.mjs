import OpenAI from "openai";
import prompt from "./prompt.mjs";

// On page load, retrieve the API key from localStorage and populate the input field
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('openAIKey');
  const storedApiKey = localStorage.getItem('openAIKey');
  console.log({storedApiKey});
  if (storedApiKey) {
    console.log("key is already there");
    apiKeyInput.value = storedApiKey;
    document.getElementById("openAiKeyInput").style.display = "none";
  }
});

const context = {
  messages: [
    {
      role: "system", content: prompt 
    }
  ],
  openai: null
};

function addUserMessage(message) {
  context.messages.push({ role: "user", content: message })
}

function addAssistantMessage(message) {
  context.messages.push({ role: "assistant", content: message })
}

async function askAssistant(prompt) {
  try {
    createOpenAiIfNeeded();
    addUserMessage(prompt);
    const completion = await context.openai.chat.completions.create({
      model: "gpt-4o-mini", // Update to the model you have access to
      messages: context.messages,
    });

    const response = completion.choices[0].message.content;

    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Generating...';  

    // Use a regular expression to extract content between STARTHTML and STOPHTML
    const match = response.match(/STARTHTML([\s\S]*?)STOPHTML/);

    if (match && match[1]) {
      // The content between STARTHTML and STOPHTML
      const htmlContent = match[1];
      resultDiv.innerHTML = htmlContent;
      addAssistantMessage(response);
      enableGenerate();
    } else {
      resultDiv.textContent = "Sorry I got lost";
    }
  } catch (error) {
    console.error('Error:', error);
    resultDiv.textContent = 'Error: ' + error.message;
    document.getElementById("openAiKeyInput").style.display = "flex";
  }
}

function createOpenAiIfNeeded() {
  if(!context.openai) {
    const apiKeyInput = document.getElementById('openAIKey');
    const apiKey = apiKeyInput.value;
  
    // Store the API key in localStorage
    localStorage.setItem('openAIKey', apiKey);
    context.openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  }
}

document.getElementById('generate').addEventListener('click', async () => {
  
  document.getElementById("result").classList.add("disabled");
  document.getElementById("generate").classList.add("disabled");
  const prompt = document.getElementById('prompt').value;

  createOpenAiIfNeeded();

  await askAssistant(prompt);
  document.getElementById("generate").classList.remove("disabled");
});

document.getElementById("prompt").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission if any
    document.getElementById("generate").click();
  }
});

function r(event) {
  const response = event.target.innerText;
  ask(response);
}

function ask(text) {
  document.getElementById("result").classList.add("disabled");
  document.getElementById("generate").classList.add("disabled");
  askAssistant(text);
}

function enableGenerate() {
  document.getElementById("result").classList.remove("disabled");
  document.getElementById("generate").classList.remove("disabled");
}

window.r = r;
window.ask = ask;
