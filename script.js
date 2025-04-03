const display = document.querySelector(".display");
const expressionDisplay = document.querySelector(".expression-display");
const operators = ["+", "-", "*", "/", "="];

// Calculator configuration
const DECIMAL_PLACES = 10;
const SCIENTIFIC_NOTATION_THRESHOLD = 1e9;
const SCIENTIFIC_NOTATION_PRECISION = 5;

// Display helper functions
const getDisplayText = () => display.innerText;
const setDisplayText = (text) => (display.innerText = text);
const getDisplayHTML = () => display.innerHTML;
const setDisplayHTML = (html) => (display.innerHTML = html);
const appendDisplayText = (text) => setDisplayText(getDisplayText() + text);
const handleExponentDisplay = (value) => {
  const parts = getDisplayHTML().split("<sup>");
  const baseNumber = parts[0];
  const exponent = parts.length > 1 ? parts[1].replace("</sup>", "") : "";
  setDisplayHTML(baseNumber + "<sup>" + exponent + value + "</sup>");
};

// Expression display helper function
const updateExpressionDisplay = () => {
  expressionDisplay.innerText =
    expression.length > 0 ? expression.join(" ") : "–";
};

// Number conversion helper function
const convertToNumber = (value) => {
  if (typeof value === "number") {
    value = value.toString();
  }

  if (value.includes("**")) {
    const [base, exponent] = value.split("**");
    return Math.pow(parseFloat(base), parseFloat(exponent));
  }
  return parseFloat(value);
};

// Calculator State
let currentInput = [];
let expression = [];
let signChange = false;

// Input Handlers
function handleNumber(button) {
  const value = button.dataset.value;

  // Clear display only when starting a new number
  if (currentInput.length === 0) {
    setDisplayText("");
  }

  if (currentInput.includes("**")) {
    handleExponentDisplay(value);
  } else {
    appendDisplayText(value);
  }

  currentInput.push(value);

  // TESTING
  console.log("handleNumber");
  console.log("value", value);
  console.log("currentInput", currentInput);
  console.log("expression", expression);
}

function handleDecimal(button) {
  if (currentInput.includes("**")) {
    showError("Please complete the exponent first");
    return;
  }

  if (currentInput.includes(".")) {
    showError("Please start a new number");
    return;
  }

  currentInput.push(".");
  setDisplayText(currentInput.length === 1 ? "0." : getDisplayText() + ".");
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
  if (
    (currentInput.length === 0 && expression.length === 0) ||
    operators.includes(currentInput[currentInput.length - 1])
  ) {
    showError("Please input a value");
    return;
  }

  const value = button.dataset.value;

  if (currentInput.length > 0) {
    expression.push(currentInput.join(""));
    currentInput = [];
  }

  if (value === "=") {
    if (expression.length === 3) {
      const result = calculate();
      if (result === undefined) return; // Invalid calculation
      expressionDisplay.innerText = `${expression.join(" ")} =`;
      reset(false);
    } else {
      showError("Please complete the expression");
    }
    return;
  }

  if (expression.length === 3) {
    const result = calculate();
    if (result === undefined) return; // Invalid calculation
    expression = [result, value];
  } else {
    expression.push(value);
  }
  updateExpressionDisplay();
}

// Core utility functions
function calculate() {
  if (expression.length < 3) {
    showError();
    return;
  }

  const num1 = convertToNumber(expression[0]);
  const num2 = convertToNumber(expression[2]);
  const operator = expression[1];
  let result = 0;

  // TESTING
  console.log("calculate");
  console.log("num1", num1);
  console.log("num2", num2);
  console.log("operator", operator);

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
        showError("Please use a non-zero divisor");
        return undefined;
      }
      result = num1 / num2;
      break;
  }

  // Handle large numbers and rounding with configuration constants
  result = Number(result.toFixed(DECIMAL_PLACES));
  if (Math.abs(result) > SCIENTIFIC_NOTATION_THRESHOLD) {
    result = result.toExponential(SCIENTIFIC_NOTATION_PRECISION);
  }

  setDisplayText(result);
  return result;
}

function reset(resetDisplay = true) {
  currentInput = [];
  expression = [];
  if (resetDisplay) {
    setDisplayText("0");
    expressionDisplay.innerText = "–"; // Match the initial state
  }
  signChange = false;
}

function toggleSign() {
  if (currentInput.length === 0) {
    showError("Please input a value");
    return;
  }

  if (signChange) {
    currentInput.shift();
    setDisplayText(getDisplayText().slice(1));
    signChange = false;
    return;
  }
  currentInput.unshift("-");
  setDisplayText("-" + getDisplayText());
  signChange = true;
  // TESTING
  console.log("toggleSign");
  console.log("currentInput", currentInput);
  console.log("expression", expression);
  console.log("signChange", signChange);
}

function deleteLastDigit() {
  if (currentInput.length === 0) {
    showError("Nothing to delete");
    return;
  }
  currentInput.pop();
  setDisplayText(currentInput.join(""));
}

function addExponent() {
  if (currentInput.length === 0) {
    showError("Please input a value");
    return;
  }

  const lastChar = currentInput[currentInput.length - 1];
  if (lastChar === "**") {
    currentInput.pop();
    setDisplayText(currentInput.join(""));
    return;
  }

  if (currentInput.includes("**")) {
    showError("Please complete current exponent");
    return;
  }

  currentInput.push("**");
  setDisplayHTML(getDisplayText() + "<sup>");
}

function showError(message = "Invalid Operation") {
  expressionDisplay.innerText = message;
  setDisplayText("0");
  setTimeout(() => {
    expressionDisplay.innerText = "–";
  }, 2000);
}

// Event Listeners
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

// Testing exports
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
    get currentInput() {
      return currentInput;
    },
    get expression() {
      return expression;
    },
    get signChange() {
      return signChange;
    },
  };
}
