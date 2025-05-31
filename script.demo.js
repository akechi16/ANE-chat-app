
const systemPrompt = {
  role: "system",
  content:
    "キミは優しくて元気で世話焼きなお姉ちゃん気質の性格。語尾に「〜ね」「〜だよっ」などをつけて、一人称は『お姉ちゃん』、二人称は『キミ』。丁寧語は使わず、女性口調で話してね。使いすぎない程度に、適宜絵文字を使ってね。ステップバイステップで思考して、合理的な解決策を提案する賢いお姉さんだよ。"
};

let chats = JSON.parse(localStorage.getItem("chats")) || {};
let currentChatId = Object.keys(chats)[0] || createNewChat();

document.getElementById("chat-selector").innerHTML = Object.keys(chats)
  .map(id => `<option value="${id}">${id}</option>`)
  .join("");

document.getElementById("chat-selector").value = currentChatId;
renderChat();

function createNewChat() {
  const id = "Chat" + (Object.keys(chats).length + 1);
  chats[id] = [systemPrompt];
  localStorage.setItem("chats", JSON.stringify(chats));
  return id;
}

function editChatName() {
  const chatSelector = document.getElementById("chat-selector");
  const currentKey = chatSelector.value;

  if (!currentKey) {
    alert("編集するプロジェクトを選んでね！");
    return;
  }

  const newName = prompt("新しいプロジェクト名を入力してね：", chatSelector.options[chatSelector.selectedIndex].text);

  if (newName && newName.trim() !== "") {
    chatSelector.options[chatSelector.selectedIndex].text = newName;

    // 保存されているプロジェクト名も更新
    const saved = localStorage.getItem("chatProjects");
    if (saved) {
      const projects = JSON.parse(saved);
      if (projects[currentKey]) {
        projects[currentKey].name = newName;
        localStorage.setItem("chatProjects", JSON.stringify(projects));
      }
    }
  }
}


function deleteChat() {
  const chatSelector = document.getElementById("chat-selector");
  const currentKey = chatSelector.value;

  if (!currentKey) {
    alert("削除するプロジェクトを選んでね！");
    return;
  }

  const confirmed = confirm("このチャットを削除してもいい？この操作は元に戻せないよ💦");

  if (confirmed) {
    // セレクトボックスから削除
    chatSelector.remove(chatSelector.selectedIndex);

    // ローカルストレージから削除
    const saved = localStorage.getItem("chatProjects");
    if (saved) {
      const projects = JSON.parse(saved);
      delete projects[currentKey];
      localStorage.setItem("chatProjects", JSON.stringify(projects));
    }

    // チャット履歴をクリア
    document.getElementById("chat-box").innerHTML = "";
  }
}



function switchChat(id) {
  currentChatId = id;
  renderChat();
}

function renderChat() {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
  chats[currentChatId].forEach(m => {
    if (m.role !== "system") {
      appendMessage(m.content, m.role === "user" ? "right" : "left");
    }
  });
}

function appendMessage(text, sender) {
  const chatBox = document.getElementById("chat-box");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = sender === "left" ? "oneechan.png" : "user.png";

  const parsed = marked.parse(text);
  bubble.innerHTML = sender === "left" && text === "……" ? "……" : sanitizeMessage(marked.parse(text));

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput.trim()) return;

  appendMessage(userInput, "right");

  // ちょっと時間差でお姉ちゃんが返事する風に見せる
  setTimeout(() => {
    const fakeReply = "（デモ版ではAPIは使えないよ！）";
    appendMessage(fakeReply, "left");
  }, 500);

  document.getElementById("user-input").value = "";
}

function sanitizeMessage(html) {
  // 空白だけの段落やbrを削除
  return html
    .replace(/<p>(\s|&nbsp;)*<\/p>/g, '')
    .replace(/<br\s*\/?>\s*$/gi, '');
}


function newChat() {
  currentChatId = createNewChat();
  document.getElementById("chat-selector").innerHTML = Object.keys(chats)
    .map(id => `<option value="${id}">${id}</option>`)
    .join("");
  document.getElementById("chat-selector").value = currentChatId;
  renderChat();
}


const textarea = document.getElementById("user-input");

// 高さを入力内容に応じて自動調整する関数
textarea.addEventListener("input", () => {
  textarea.style.height = "auto"; // 一旦リセット
  textarea.style.height = textarea.scrollHeight + "px";
});

// Shift+Enter で送信（Enter単体は改行）
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault(); // 改行防止
    sendMessage();      // 送信
  }
});
