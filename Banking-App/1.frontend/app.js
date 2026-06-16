const API = {
  authLogin: "/auth/login",
  authHealth: "/auth/health",
  accountSummary: "/account/summary",
  transactionList: "/transactions/list",
  notificationList: "/notifications/list",
  accountHealth: "/account/health",
  transactionHealth: "/transactions/health",
  notificationHealth: "/notifications/health"
};

function getCustomerId() {
  return localStorage.getItem("customerId") || "SHIVAM001";
}

async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const loginMessage = document.getElementById("loginMessage");
    const customerId = document.getElementById("customerId").value.trim();
    const password = document.getElementById("password").value.trim();

    loginMessage.textContent = "Authenticating with DB...";
    loginMessage.className = "message";

    try {
      const response = await fetch(API.authLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ customerId, password })
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("customerId", data.customerId);
      localStorage.setItem("fullName", data.fullName || "");

      loginMessage.textContent = data.message;
      loginMessage.className = "message success";

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 900);
    } catch (error) {
      loginMessage.textContent = error.message;
      loginMessage.className = "message error";
    }
  });
}

async function loadDashboard() {
  try {
    const customerId = getCustomerId();

    const response = await fetch(`${API.accountSummary}?customerId=${encodeURIComponent(customerId)}`);
    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load account data");
    }

    document.getElementById("accountHolder").textContent = data.accountHolder;
    document.getElementById("balance").textContent = data.balance;
    document.getElementById("accountType").textContent = data.accountType;
    document.getElementById("branch").textContent = data.branch;
    document.getElementById("customerIdView").textContent = data.customerId;
    document.getElementById("accountNumber").textContent = data.accountNumber;
    document.getElementById("ifsc").textContent = data.ifsc;
  } catch (error) {
    document.getElementById("accountHolder").textContent = "Error";
    document.getElementById("balance").textContent = error.message;
  }
}

async function loadTransactionsPage() {
  const table = document.getElementById("transactionTable");

  try {
    const customerId = getCustomerId();
    const response = await fetch(`${API.transactionList}?customerId=${encodeURIComponent(customerId)}`);
    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load transactions");
    }

    table.innerHTML = "";

    data.transactions.forEach((txn) => {
      const amountClass = txn.type === "Credit" ? "success" : "error";
      table.innerHTML += `
        <tr>
          <td>${txn.date}</td>
          <td>${txn.description}</td>
          <td>${txn.type}</td>
          <td class="${amountClass}">${txn.amount}</td>
        </tr>
      `;
    });
  } catch (error) {
    table.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`;
  }
}

async function loadNotificationsPage() {
  const list = document.getElementById("notificationList");

  try {
    const customerId = getCustomerId();
    const response = await fetch(`${API.notificationList}?customerId=${encodeURIComponent(customerId)}`);
    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load notifications");
    }

    list.innerHTML = "";
    data.notifications.forEach((item) => {
      list.innerHTML += `<li>${item.message}</li>`;
    });
  } catch (error) {
    list.innerHTML = `<li>${error.message}</li>`;
  }
}

async function setHealth(elementId, url) {
  const element = document.getElementById(elementId);

  try {
    const response = await fetch(url);
    const data = await safeJson(response);

    if (!response.ok) {
      throw new Error(data.error || "Unavailable");
    }

    const dbText = data.database ? ` | DB: ${data.database}` : "";
    element.textContent = `✅ ${data.status}${dbText}`;
    element.className = "success";
  } catch (error) {
    element.textContent = `❌ Unavailable: ${error.message}`;
    element.className = "error";
  }
}

function checkServicesHealth() {
  setHealth("authHealth", API.authHealth);
  setHealth("accountHealth", API.accountHealth);
  setHealth("transactionHealth", API.transactionHealth);
  setHealth("notificationHealth", API.notificationHealth);
}
