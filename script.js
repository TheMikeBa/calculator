const display = document.querySelector(".display");

let currentInput = [];
let expression = [];
let signChange = false;
const operators = ["+", "-", "*", "/"];

// Number Handler
function handleNumber(button) {
  const value = button.dataset.value;
  currentInput.push(value);
  display.innerText += value;
}

// Decimal Handler
function handleDecimal(button) {
  if (currentInput.includes(".")) {
    invalid("You can only have one decimal point in a number");
    return;
  }
  currentInput.push(".");
  display.innerText =
    currentInput.length === 1 ? "0." : display.innerText + ".";
}

// Operator Handler
function handleOperator(button) {
  const value = button.dataset.value;
  if (currentInput.length === 0 || operators.includes(currentInput[-1])) {
    invalid();
    return;
  }
  if (expression.length > 2) {
    calculate();
  }
  expression.push(currentInput.join(""));
  clearInput();
  expression.push(value);
}

// Function Handler
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

// Helper Functions
function handleSign() {
  if (signChange) {
    currentInput = currentInput.shift();
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

function handleExponent() {
  if (currentInput.length === 0) {
    invalid("There is nothing to exponentiate");
    return;
  }
  currentInput.push("**");
  display.innerText += "EXP";
}

function clearInput() {
  currentInput = [];
}

function clear() {
  currentInput = [];
  expression = [];
  signChange = false;
  display.innerText = "";
}

function invalid(message = "Invalid Operation") {
  display.innerText = message;
}

function calculate() {
  if (expression.length < 3) {
    invalid();
    return;
  }
  const num1 = parseFloat(expression[0]);
  const num2 = parseFloat(expression[2]);
  const operator = expression[1];
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

// Event Listeners
document.querySelectorAll('[data-action="number"]').forEach((button) => {
  button.addEventListener("click", () => {
    display.innerText = "";
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
