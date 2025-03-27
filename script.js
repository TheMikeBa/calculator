const display = document.querySelector(".display");

let currentInput = [];
let expression = [];
let signChange = false;

const operators = ["+", "-", "*", "/", "="];

function calculate() {
  if (expression.length < 3) {
    invalid();
    return;
  }
  const num1 = parseFloat(expression[0]);
  const operator = expression[1];
  const num2 = parseFloat(expression[2]);
  let result = 0;

  switch (operator) {
    case "+":
      result = num1 + num2;
      break;
    case "-":
      result = num1 - num2;
      break;
    case "*":
      result = num1 * num2;
      break;
    case "/":
      if (num2 === 0) {
        invalid("Cannot divide by zero");
        return;
      }
      result = num1 / num2;
      break;
  }
  display.innerText = result;
  expression = [result];
}

function handleExponent() {
  if (currentInput.length === 0) {
    invalid("There is nothing to exponentiate");
    return;
  }
  currentInput.push("**");
  display.innerHTML = display.innerText + "<sup>";
}

function handleOperator(button) {
  // Check if there's valid input
  if (
    currentInput.length === 0 ||
    operators.includes(currentInput[currentInput.length - 1])
  ) {
    invalid();
    return;
  }

  const value = button.dataset.value;

  // Close any open exponent tags
  if (currentInput.includes("**")) {
    display.innerHTML += "</sup>";
  }

  // Add current number to expression
  expression.push(currentInput.join(""));
  clearCurrentInput();

  // Handle calculations
  if (expression.length >= 3) {
    calculate();
    if (value !== "=") {
      expression.push(value);
    }
  } else if (value !== "=") {
    expression.push(value);
  }
}

function handleNumber(button) {
  if (currentInput.length === 0) display.innerText = "";

  const value = button.dataset.value;
  currentInput.push(value);
  display.innerText += value;
}

function handleDecimal(button) {
  if (currentInput.includes(".")) {
    invalid("You can only have one decimal point in a number");
    return;
  }
  currentInput.push(".");
  display.innerText =
    currentInput.length === 1 ? "0." : display.innerText + ".";
}

function handleFunction(button) {
  const action = button.dataset.action;
  switch (action) {
    case "clear":
      clear();
      break;
    case "sign":
      handleSign();
      break;
    case "delete":
      handleDelete();
      break;
    case "exponent":
      handleExponent();
      break;
  }
}

function handleSign() {
  if (signChange) {
    currentInput.shift(); // Just remove the first element (the minus sign)
    display.innerText = display.innerText.slice(1);
    signChange = false;
    return;
  }
  currentInput.unshift("-");
  display.innerText = "-" + display.innerText;
  signChange = true;
}

function handleDelete() {
  if (currentInput.length === 0) {
    invalid("There is nothing to delete");
    return;
  }
  currentInput.pop();
  display.innerText = currentInput.join("");
}

function clearCurrentInput() {
  currentInput = [];
}
function invalid(message = "Invalid Operation") {
  display.innerText = message;
}

// Event Listeners
document.querySelectorAll('[data-action="number"]').forEach((button) => {
  button.addEventListener("click", () => {
    handleNumber(button);
  });
});

document.querySelectorAll('[data-action="operator"]').forEach((button) => {
  button.addEventListener("click", () => handleOperator(button));
});

document.querySelectorAll('[data-action="decimal"]').forEach((button) => {
  button.addEventListener("click", () => handleDecimal(button));
});

document.querySelectorAll(".function").forEach((button) => {
  button.addEventListener("click", () => handleFunction(button));
});
