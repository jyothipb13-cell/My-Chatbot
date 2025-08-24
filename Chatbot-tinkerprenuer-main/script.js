const GEMINI_API_KEY = "AIzaSyC182XS-8uLPmK3x7jvTgW_x488Gsj0ezU";

const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");

window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const avatar = document.getElementById("avatar-popup");
  const mainApp = document.querySelector(".app-wrapper");

  setTimeout(() => {
    loading.style.opacity = "0";
    loading.style.pointerEvents = "none";
    avatar.style.opacity = "1";
    avatar.style.pointerEvents = "auto";

    setTimeout(() => {
      avatar.style.opacity = "0";
      avatar.style.pointerEvents = "none";
      mainApp.style.display = "flex";
    }, 2000);
  }, 1500);
});

function addMessage(text, sender, isHTML = false) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  if (isHTML) {
    msgDiv.innerHTML = text;
  } else {
    msgDiv.textContent = text;
  }
  chatContainer.appendChild(msgDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingDots() {
  const dotsHTML = `
    <div class="message bot typing" id="typing">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  chatContainer.insertAdjacentHTML("beforeend", dotsHTML);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingDots() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

sendBtn.addEventListener("click", async () => {
  const input = userInput.value.trim();
  if (!input) return;
  addMessage(input, "user");
  userInput.value = "";
  showTypingDots();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: "you are a friendly AI bot. Your name is GenAI Chatbot. " + input }] }
          ]
        }),
      }
    );
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from Gemini.";
    removeTypingDots();
    addMessage(reply, "bot");
    const utter = new SpeechSynthesisUtterance(reply);
    speechSynthesis.speak(utter);
  } catch (err) {
    removeTypingDots();
    addMessage("⚠️ Error: Could not reach API.", "bot");
    console.error(err);
  }
});

micBtn.addEventListener("click", () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
  };
  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event);
    alert("Sorry, I could not hear.. please try again.");
  };
  recognition.start();
});
