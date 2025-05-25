// filepath: /eisenhower-matrix-app/eisenhower-matrix-app/src/script.js

// DOM Elements
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskQuadrant = document.getElementById("taskQuadrant");

const quadrantLists = {
  do: document.querySelector("#do-list .task-list"),
  decide: document.querySelector("#decide-list .task-list"),
  delegate: document.querySelector("#delegate-list .task-list"),
  delete: document.querySelector("#delete-list .task-list"),
};

// Show modal
addTaskBtn.addEventListener("click", () => {
  taskModal.classList.remove("hidden");
});

// Save task
saveTaskBtn.addEventListener("click", () => {
  const title = taskTitle.value.trim();
  const desc = taskDesc.value.trim();
  const quadrant = taskQuadrant.value;

  if (title === "") {
    alert("Task title cannot be empty.");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    desc,
    quadrant,
  };

  saveTaskToStorage(task);
  renderTask(task);

  // Clear inputs
  taskTitle.value = "";
  taskDesc.value = "";
  taskQuadrant.value = "do";

  taskModal.classList.add("hidden");
});

// Close modal on click outside
window.addEventListener("click", (e) => {
  if (e.target === taskModal) {
    taskModal.classList.add("hidden");
  }
});

// Save task in localStorage
function saveTaskToStorage(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Delete task from storage
function deleteTaskFromStorage(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update task quadrant in storage
function updateTaskQuadrant(id, newQuadrant) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, quadrant: newQuadrant } : task
  );
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render a task to the correct quadrant
function renderTask(task) {
  const list = quadrantLists[task.quadrant];

  const li = document.createElement("li");
  li.textContent = task.title;
  if (task.desc) li.title = task.desc;
  li.setAttribute("data-id", task.id);
  li.setAttribute("draggable", "true");

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.className = "delete-btn";
  delBtn.innerHTML = "&times;";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    if (confirm("Delete this task?")) {
      li.remove();
      deleteTaskFromStorage(task.id);
    }
  };
  li.appendChild(delBtn);

  // Drag events
  li.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    li.classList.add("dragging");
  });
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
  });

  list.appendChild(li);
}

// Drag & Drop for quadrants
Object.entries(quadrantLists).forEach(([quadrant, ul]) => {
  const parent = ul.parentElement;
  parent.addEventListener("dragover", (e) => {
    e.preventDefault();
    parent.style.boxShadow = "0 0 0 4px #fff, 0 0 0 8px #007acc";
  });
  parent.addEventListener("dragleave", () => {
    parent.style.boxShadow = "";
  });
  parent.addEventListener("drop", (e) => {
    e.preventDefault();
    parent.style.boxShadow = "";
    const id = Number(e.dataTransfer.getData("text/plain"));
    if (!id) return;
    // Remove from old quadrant
    document.querySelectorAll(`[data-id="${id}"]`).forEach((el) => el.remove());
    // Update storage
    updateTaskQuadrant(id, quadrant);
    // Render in new quadrant
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find((t) => t.id === id);
    if (task) renderTask(task);
  });
});

// Load tasks on page load
window.addEventListener("DOMContentLoaded", () => {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => renderTask(task));
});
