// Example: Change the background color of the page
console.log("GCT - Content script loaded");

function deleteWorkouts(ids) {
  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  function closePopup(resolve) {
    document.querySelector(".js-saveBtn").click();
    setTimeout(() => {
      if (!document.querySelector(".js-saveBtn")) {
        resolve();
      } else {
        closePopup(resolve);
      }
    }, 250);
  }
  asyncForEach(ids, (id) => {
    const node = document.querySelector(`.delete-workout[data-id="${id}"]`);
    node.click();
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        closePopup(resolve);
      }, 250);
    });
  });
}

function getSelectedWorkouts() {
  const selected = [];
  document
    .querySelectorAll(".workouts tbody tr input[type='checkbox']:checked")
    .forEach((node) => {
      selected.push(node.value);
    });
  return selected;
}

updateStates = () => {
  const checkbox = document.querySelector(
    ".select-all-workout input[type='checkbox']"
  );

  const checkboxesStates = [];
  document
    .querySelectorAll(".workouts tbody tr input[type='checkbox']")
    .forEach((node) => checkboxesStates.push(node.checked));

  const hasFalsy = checkboxesStates.indexOf(false) != -1;
  const hasTruthly = checkboxesStates.indexOf(true) != -1;
  if (hasFalsy && hasTruthly) {
    checkbox.checked = false;
    checkbox.indeterminate = true;
  } else if (hasTruthly) {
    checkbox.checked = true;
    checkbox.indeterminate = false;
  } else {
    checkbox.checked = false;
    checkbox.indeterminate = false;
  }

  const deleteElement = document.querySelector("button.delete-workouts");
  if (deleteElement) {
    deleteElement.disabled = !hasTruthly;
  }
};

function checkWorkoutsTable() {
  if (
    document.querySelector(".workouts") &&
    !document.querySelector(".workouts.delete-active")
  ) {
    addRemoveButton();
    document.querySelector(".workouts").classList.add("delete-active");
    document.querySelectorAll(".workouts tbody tr").forEach((node) => {
      const id = node.querySelector("a.delete-workout").getAttribute("data-id");
      const td = document.createElement("td");
      td.classList.add("select-workout");
      const select = document.createElement("input");
      select.addEventListener("change", (e) => {
        updateStates();
      });
      select.type = "checkbox";
      select.value = id;
      td.appendChild(select);
      node.prepend(td);
    });

    const node = document.querySelector(".workouts thead tr");
    const td = document.createElement("th");
    td.classList.add("select-all-workout");
    const select = document.createElement("input");
    select.type = "checkbox";
    td.appendChild(select);
    node.prepend(td);

    select.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(
        ".workouts tbody tr input[type='checkbox']"
      );

      const checkboxesStates = [];
      checkboxes.forEach((node) => checkboxesStates.push(node.checked));
      const hasFalsy = checkboxesStates.indexOf(false) != -1;

      let state = false;
      if (hasFalsy) {
        state = true;
      }

      checkboxes.forEach((checkbox) => {
        checkbox.checked = state;
      });

      updateStates();
    });

    updateStates();
  }
}

function addRemoveButton() {
  let count = 0,
    maxCount = 10;
  let searchFormInterval = setInterval(() => {
    const formElement = document.querySelector("form.bottom-xs");
    count++;

    if (formElement) {
      clearInterval(searchFormInterval);
      onFormElement(formElement);
    } else if (count >= maxCount) {
      clearInterval(searchFormInterval);
      console.log("GCT - Form element not found");
    }
  }, 200);
}

function onFormElement(formElement) {
  const deleteElement = document.querySelector("button.delete-workouts");
  if (!deleteElement) {
    console.log("GCT - Form element found:", formElement);
    const button = document.createElement("button");
    button.textContent = chrome.i18n.getMessage("deleteSelectedWorkouts");
    button.className = "btn btn-form delete-workouts";

    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Start the process by calling the function
      deleteSelectedWorkouts();
    };

    formElement.appendChild(button);

    updateStates();
  }
}

function deleteSelectedWorkouts() {
  const ids = getSelectedWorkouts();
  console.log("GCT - Selected workout IDs:", ids);

  deleteWorkouts(ids);
}

setInterval(() => {
  checkWorkoutsTable();
}, 1000);
