import OpenAI from "openai";

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
      role: "system", content: "You are a Language Learning system. You render html and receives the input from the function r()."
        + "The output is always surrounded by STARTHTML and STOPHTML. For example, let`s say you are teaching articles, you first render: "
        + "STARTHTML <p>Bitte wählen Sie den richtigen Artikel für <strong>Freiheit</strong> aus:</p> "
        + "<button onclick=\"r('der')\">Der</button>"
        + "<button onclick=\"r('die')\">Die</button>"
        + "<button onclick=\"r('das')\">Das</button> "
        + "STOPHTML "
        + "Or maybe an input:STARTHTML<p>Input the German Article for Freiheit:</p>"
        + "<input type=\"text\" id=\"answerInput\" placeholder=\"Enter der, die, or das\">"
        + "<button onclick=\"r(document.getElementById('answerInput').value)\">Answer</button> "
        + "STOPHTML "
        + "Use wathever is best for the question. After you will get the output from the function r, for example:"
        + "der"
        + "STARTHTML<p>Tut mir leid, die Antwort ist der</p>"
        + "<p>Substantive mit den folgenden Suffixen haben den Artikel \"die\":</p>"
        + "<table border=\"1\"> <tr> <th>Suffix</th> <th>Beispiele</th> </tr>"
        + "<tr><td>-falt</td><td>Vielfalt</td></tr>"
        + "<tr><td>-heit</td><td>Freiheit, Sicherheit</td></tr>"
        + "<tr><td>-keit</td><td>Möglichkeit, Schnelligkeit</td></tr>"
        + "<tr><td>-schaft</td><td>Freundschaft, Mannschaft</td></tr>"
        + "<tr><td>-t (von Verben abgeleitete Substantive)</td><td>Fahrt, Tat</td></tr>"
        + "<tr><td>-ung</td><td>Leitung, Zeitung</td></tr>"
        + "</table>"
        + "<p>Lasst uns weitermachen. Bitte wählen Sie den richtigen Artikel für <strong>Apfell</strong> aus:</p>"
        + "<button onclick=\"r('der')\">Der</button>"
        + "<button onclick=\"r('die')\">Die</button>"
        + "<button onclick=\"r('das')\">Das</button> "
        + "STOPHTML "
        + "Some input that calls the function r(\"\") is always required. It can be either buttons, text input, radiobuttons or any that fits the question."
        + "Be sure one of the answers is the right one."
        + "Student level is A2. Please give lengthy explanations before asking for a response."
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

document.getElementById('generate').addEventListener('click', async () => {


  document.getElementById("generate").classList.add("disabled");
  const prompt = document.getElementById('prompt').value;

  const apiKeyInput = document.getElementById('openAIKey');
  const apiKey = apiKeyInput.value;

  // Store the API key in localStorage
  localStorage.setItem('openAIKey', apiKey);
  context.openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  await askAssistant(prompt);
  document.getElementById("generate").classList.remove("disabled");
});

document.getElementById("prompt").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission if any
    document.getElementById("generate").click();
  }
});

function r(response) {
  document.getElementById("result").classList.add("disabled");
  askAssistant(response);
}

function enableGenerate() {
  document.getElementById("result").classList.remove("disabled");
}

window.r = r;
