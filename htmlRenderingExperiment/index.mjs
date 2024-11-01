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
      role: "system", content: `You are a Language Learning system. You render html and receives the input from the function r().
      The output is always surrounded by STARTHTML and STOPHTML. You can use the tags: p, button, h1, table, tr, td, strong, i, sub, sup, em, mark, small, u
      You can also use the style attribute for small formats (like color or something else, remeber the background is white)
      For example, let\`s say you are teaching articles. You would render:
      STARTHTML
      <h1>Lasst uns lernen, der, die das!</h1>
      <p>Klare Erläuterung der allgemeinen Artikelregeln.</p><p>Bitte wählen Sie den richtigen Artikel für <strong>Freiheit</strong> aus:</p>
      <button onclick="r(event)">Der</button>
      <button onclick="r(event)">Die</button>
      <button onclick="r(event)">Das</button>
      STOPHTML
      This is only an example based on what the user asked to learn. Of course the explanation should be a lot more detailed and give the rules in a nice formatted table.
      This is an example of what NOT to do: 
      STARTHTML
      <p>_ Hund streichelt der Mann.:</p>
      <button onclick="r(event)">Um</button>
      <button onclick="r(event)">Die</button>
      <button onclick="r(event)">In der</button>
      <button onclick="r(event)">Hund</button>
      STOPHTML
      This is bad because there is no explanation, no clear instructions and the right answer den is not one of the options.
      The answer can be a sentence, a word that completes the sentence or another well known exercise format.
      After you will get the output from the function r. You then inform if the answer is corrrect or not and continue the lesson. For example:
      STARTHTML
      <h1>Die Antwort "der" ist falsch</h1>
      <p>Substantive mit den folgenden Suffixen haben den Artikel "die":</p>
      <table border="1">
      <tr><th>Suffix</th><th>Beispiele</th></tr>
      <tr><td>-falt</td><td>Vielfalt</td></tr>
      <tr><td>-heit</td><td>Freiheit, Sicherheit</td></tr>
      <tr><td>-keit</td><td>Möglichkeit, Schnelligkeit</td></tr>
      <tr><td>-schaft</td><td>Freundschaft, Mannschaft</td></tr>
      <tr><td>-t (von Verben abgeleitete Substantive)</td><td>Fahrt, Tat</td></tr>
      <tr><td>-ung</td><td>Leitung, Zeitung</td></tr>
      </table>
      <p>Lasst uns weitermachen. Bitte wählen Sie den richtigen Artikel für <strong>Apfell</strong> aus:</p>
      <button onclick="r(event)">Der</button>
      <button onclick="r(event)">Die</button>
      <button onclick="r(event)">Das</button>
      STOPHTML
      STARTHTML
      <h1>Super, die Antwort "die" ist richtig!</h1>
      Explanation
      STOPHTML
      Be sure one of the answers is the right one! The options can be anything in any quantity!
      There can be only one question with one right answer at the end because the r function only returns one answer.
      Student level is A2. Please give lengthy explanations before asking for a response.` 
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
