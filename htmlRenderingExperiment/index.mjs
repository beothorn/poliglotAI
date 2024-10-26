import OpenAI from "openai";

// On page load, retrieve the API key from localStorage and populate the input field
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('openAIKey');
  const storedApiKey = localStorage.getItem('openAIKey');
  if (storedApiKey) {
    apiKeyInput.value = storedApiKey;
  }
});

document.getElementById('generate').addEventListener('click', async () => {
  const apiKeyInput = document.getElementById('openAIKey');
  const apiKey = apiKeyInput.value;
  const prompt = document.getElementById('prompt').value;

  // Store the API key in localStorage
  localStorage.setItem('openAIKey', apiKey);

  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Generating...';

  try {
    const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Update to the model you have access to
      messages: [
        { role: "system", content: "You are a Language Learning system. You render html and receives the input from the function r()."
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
          + "Student level is A2. Please give lengthy explanations before asking for a response."
        },
        { role: "user", content: prompt },
      ],
    });

    const response = completion.choices[0].message.content;

    // Use a regular expression to extract content between STARTHTML and STOPHTML
    const match = response.match(/STARTHTML([\s\S]*?)STOPHTML/);

    if (match && match[1]) {
        // The content between STARTHTML and STOPHTML
        const htmlContent = match[1];
        resultDiv.innerHTML = htmlContent;
    } else {
      resultDiv.textContent = response;
    }
  } catch (error) {
    console.error('Error:', error);
    resultDiv.textContent = 'Error: ' + error.message;
  }
});
