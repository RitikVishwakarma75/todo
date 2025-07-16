const API_URL = "https://dummyjson.com/todos";
let todos = [];
let currentPage = 1;
const itemsPerPage = 10;

const todoList = document.getElementById("todoList");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const loader = document.getElementById("loader");
const alertBox = document.getElementById("alertBox");

document.addEventListener("DOMContentLoaded", fetchTodos);

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTodos();
});

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const todoText = todoInput.value.trim();
  if (!todoText) return;
  try {
    showLoader();
    const res = await fetch(API_URL + "/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: todoText,
        completed: false,
        userId: 1,
      }),
    });
    const data = await res.json();
    const newTodo = {
      ...data,
      id: Date.now(), // Unique ID
      createdAt: new Date().toISOString().split("T")[0],
    };
    todos.unshift(newTodo);
    todoInput.value = "";
    currentPage = 1;
    renderTodos();
    showAlert("Todo added successfully!", "success");
  } catch (err) {
    showAlert("Failed to add todo.", "danger");
  } finally {
    hideLoader();
  }
});

async function fetchTodos() {
  try {
    showLoader();
    const res = await fetch(API_URL);
    const data = await res.json();
    todos = data.todos.map((todo, i) => ({
      ...todo,
      id: todo.id || Date.now() + i, // Ensure unique ID
      createdAt: `2023-07-${String((i % 30) + 1).padStart(2, "0")}`,
    }));
    renderTodos();
  } catch (err) {
    showAlert("Error fetching todos.", "danger");
  } finally {
    hideLoader();
  }
}

function renderTodos() {
  let filtered = todos;
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter((todo) =>
      todo.todo.toLowerCase().includes(searchTerm)
    );
  }

  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;
  if (from || to) {
    filtered = filtered.filter((todo) => {
      const date = new Date(todo.createdAt);
      return (!from || date >= new Date(from)) && (!to || date <= new Date(to));
    });
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  todoList.innerHTML = "";
  if (paginated.length === 0) {
    todoList.innerHTML = `<li class="list-group-item">No todos found.</li>`;
  } else {
    paginated.forEach((todo) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <span>${todo.todo}</span><br/>
          <small class="text-muted">${todo.createdAt}</small>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTodo(${todo.id})">🗑️</button>
      `;
      todoList.appendChild(li);
    });
  }
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(li);
  }
}

function deleteTodo(id) {
  if (!confirm("Are you sure you want to delete this todo?")) return;
  todos = todos.filter((todo) => todo.id !== id);
  renderTodos();
  showAlert("Todo removed successfully!", "warning");
}

function clearAllTodos() {
  if (!todos.length) {
    showAlert("No todos to clear!", "info");
    return;
  }
  if (
    confirm(
      "Are you sure you want to remove all todos? This action cannot be undone."
    )
  ) {
    todos = [];
    renderTodos();
    showAlert("All todos cleared!", "danger");
  }
}

function filterTodos() {
  currentPage = 1;
  renderTodos();
}

function showLoader() {
  loader.style.display = "block";
}
function hideLoader() {
  loader.style.display = "none";
}
function showAlert(message, type = "success") {
  alertBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}
