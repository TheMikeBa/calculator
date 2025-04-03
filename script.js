const display = document.querySelector(".display");
const operators = ["+", "-", "*", "/", "="];

let currentInput = [];
let expression = [];
let signChange = false;

function handleNumber(button) {
  const value = button.dataset.value;

  // Clear display only when starting a new number
  if (currentInput.length === 0) {
    display.innerText = "";
  }

  // Consider extracting exponent display logic to a separate function
  if (currentInput.includes("**")) {
    const parts = display.innerHTML.split("<sup>");
    const baseNumber = parts[0];
    const exponent = parts.length > 1 ? parts[1].replace("</sup>", "") : "";
    display.innerHTML = baseNumber + "<sup>" + exponent + value + "</sup>";
  } else {
    display.innerText += value;
  }

  currentInput.push(value);

  // TESTING
  console.log("handleNumber");
  console.log("value", value);
  console.log("currentInput", currentInput);
  console.log("expression", expression);
}

function handleDecimal(button) {
  // Consider checking if we're in exponent mode
  if (currentInput.includes("**")) {
    showError("Cannot add decimal to exponent");
    return;
  }

  if (currentInput.includes(".")) {
    showError("You can only have one decimal point in a number");
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
      reset();
      break;
    case "sign":
      toggleSign();
      break;
    case "delete":
      deleteLastDigit();
      break;
    case "exponent":
      addExponent();
      break;
  }
}

function handleOperator(button) {
  // Validate input; ensure there's a number before an operator and not two operators in a row
  if (
    (currentInput.length === 0 && expression.length === 0) ||
    operators.includes(currentInput[currentInput.length - 1])
  ) {
    showError();
    return;
  }

  const value = button.dataset.value;

  // Add current number to expression if exists
  if (currentInput.length > 0) {
    expression.push(currentInput.join(""));
    currentInput = [];
  }

  // Handle equals sign separately
  if (value === "=") {
    if (expression.length === 3) {
      calculate();
    } else {
      showError();
    }
    // TESTING
    console.log("handleOperator/equals");
    console.log("value", value);
    console.log("currentInput", currentInput);
    console.log("expression", expression);
    return;
  }

  // Handle regular operators
  if (expression.length === 3) {
    const result = calculate();
    expression = [result, value];
  } else {
    expression.push(value);
  }
  // TESTING
  console.log("handleOperator/operator");
  console.log("value", value);
  console.log("currentInput", currentInput);
  console.log("expression", expression);
}

function calculate() {
  if (expression.length < 3) {
    showError();
    return;
  }

  // Handle exponents in both numbers
  let num1 = expression[0];
  let num2 = expression[2];

  if (num1.includes('**')) {
    const [base, exponent] = num1.split('**');
    num1 = Math.pow(parseFloat(base), parseFloat(exponent));
  } else {
    num1 = parseFloat(num1);
  }

  if (num2.includes('**')) {
    const [base, exponent] = num2.split('**');
    num2 = Math.pow(parseFloat(base), parseFloat(exponent));
  } else {
    num2 = parseFloat(num2);
  }

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
        showError("Cannot divide by zero");
        return;
      }
      result = num1 / num2;
      break;
  }
  display.innerText = result;
  // TESTING
  console.log("calculate");
  console.log("currentInput", currentInput);
  console.log("expression", expression);
  return result;
}

function reset() {
  currentInput = [];
  expression = [];
  display.innerText = "0";
  signChange = false;
}

function toggleSign() {
  // Consider handling when there's no input
  if (currentInput.length === 0) {
    showError("No number to change sign");
    return;
  }

  if (signChange) {
    currentInput.shift(); // Just remove the first element (the minus sign)
    display.innerText = display.innerText.slice(1);
    signChange = false;
    return;
  }
  currentInput.unshift("-");
  display.innerText = "-" + display.innerText;
  signChange = true;
  // TESTING
  console.log("toggleSign");
  console.log("currentInput", currentInput);
  console.log("expression", expression);
  console.log("signChange", signChange);
}

function deleteLastDigit() {
  if (currentInput.length === 0) {
    showError("There is nothing to delete");
    return;
  }
  currentInput.pop();
  display.innerText = currentInput.join("");
}

function addExponent() {
  // Check for empty input first
  if (currentInput.length === 0) {
    showError("There is nothing to exponentiate");
    return;
  }

  // Toggle exponent if it's the last character
  const lastChar = currentInput[currentInput.length - 1];
  if (lastChar === "**") {
    currentInput.pop();
    return;
  }

  // Prevent multiple exponents
  if (currentInput.includes("**")) {
    showError("You can only have one exponent in a number");
    return;
  }

  // Add exponent operator
  currentInput.push("**");
}

function showError(message = "Invalid Operation") {
  display.innerText = message;
}

document.querySelectorAll('[data-action="number"]').forEach((button) => {
  button.addEventListener("click", () => {
    handleNumber(button);
  });
});

document.querySelectorAll('[data-action="decimal"]').forEach((button) => {
  button.addEventListener("click", () => handleDecimal(button));
});

document.querySelectorAll('[data-action="operator"]').forEach((button) => {
  button.addEventListener("click", () => handleOperator(button));
});

document.querySelectorAll(".function").forEach((button) => {
  button.addEventListener("click", () => handleFunction(button));
});

// Modify the bottom export section
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    handleNumber,
    handleDecimal,
    handleOperator,
    handleFunction,
    calculate,
    reset,
    toggleSign,
    deleteLastDigit,
    addExponent,
    showError,
    // Add these state variables
    get currentInput() { return currentInput; },
    get expression() { return expression; },
    get signChange() { return signChange; }
  };
}
