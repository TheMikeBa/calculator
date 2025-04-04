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
const setDisplayHTML = (html, append = true) => {
  const cleanContent = html.replace("|", "");
  if (!append) {
    display.innerHTML = cleanContent + '<span class="cursor">|</span>';
  } else {
    const currentContent = getDisplayHTML().replace("|", "");
    display.innerHTML =
      currentContent + cleanContent + '<span class="cursor">|</span>';
  }
};

const exponentDisplay = (value) => {
  const parts = getDisplayHTML().split("<sup>");
  const baseNumber = parts[0].replace('<span class="cursor">|</span>', "");
  let exponent = "";

  if (parts.length > 1) {
    exponent = parts[1]
      .replace("</sup>", "")
      .replace('<span class="cursor">|</span>', "");
  }

  display.innerHTML =
    baseNumber +
    "<sup>" +
    exponent +
    value +
    '<span class="cursor">|</span>' +
    "</sup>";
};

function addExponent() {
  // If currentInput is empty but we have a result in expression, use that
  if (currentInput.length === 0) {
    if (expression.length > 0) {
      currentInput = expression[0].toString().split("");
      setDisplayText(expression[0]);
      expression = [];
    } else {
      return; // Silently ignore if no number available
    }
  }

  const lastChar = currentInput[currentInput.length - 1];
  if (lastChar === "**") {
    currentInput.pop();
    setDisplayHTML(currentInput.join(""), false); // Move cursor back to base number
    return;
  }

  if (currentInput.includes("**")) {
    showError("Please complete current exponent");
    return;
  }

  currentInput.push("**");
  const cleanDisplay = getDisplayText().replace("|", "");
  display.innerHTML =
    cleanDisplay + "<sup>" + '<span class="cursor">|</span></sup>';
}

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

  if (currentInput.length === 0) {
    setDisplayHTML(value, false);
  } else if (currentInput.includes("**")) {
    exponentDisplay(value);
  } else {
    // Change this line to use currentInput array
    setDisplayHTML(currentInput.join("") + value, false);
  }

  // Clear expression if starting new number after completed calculation
  if (expressionDisplay.innerText.includes("=")) {
    expression = [];
    updateExpressionDisplay();
  }

  currentInput.push(value);

  // TESTING
  console.log("handleNumber");
  console.log("value", value);
  console.log("currentInput", currentInput);
  console.log("expression", expression);
}

function handleDecimal(button) {
  const parts = currentInput.join("").split("**");
  const isInExponent = currentInput.includes("**");

  if (isInExponent && parts[1].includes(".")) {
    showError("Invalid decimal in exponent");
    return;
  }

  if (!isInExponent && parts[0].includes(".")) {
    showError("Invalid decimal in number");
    return;
  }

  currentInput.push(".");
  if (isInExponent) {
    exponentDisplay("."); // changed from handleExponentDisplay
  } else {
    setDisplayText(currentInput.length === 1 ? "0." : getDisplayText() + ".");
  }
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
  if (currentInput.length === 0 && expression.length === 0) {
    return;
  }

  // Prevent operators during exponent input
  if (currentInput.includes("**")) {
    showError("Please complete the exponent first");
    return;
  }

  const value = button.dataset.value;

  if (currentInput.length > 0) {
    expression.push(currentInput.join(""));
    currentInput = [];
  }

  if (value === "=") {
    // Handle direct exponentiation
    if (expression.length === 1 && expression[0].includes("**")) {
      const result = convertToNumber(expression[0]);
      expressionDisplay.innerText = `${expression.join(" ")} =`;
      setDisplayText(result);
      expression = [result]; // Keep result in expression
      return;
    }

    // Handle normal calculation
    if (expression.length === 3) {
      const result = calculate();
      if (result === undefined) return;
      expressionDisplay.innerText = `${expression.join(" ")} =`;
      setDisplayText(result);
      expression = [result]; // Keep result in expression
    }
    return;
  }

  // Calculate and keep result if we have a complete expression
  if (expression.length === 3) {
    const result = calculate();
    if (result === undefined) return;
    expression = [result, value];
  } else {
    expression.push(value);
  }
  updateExpressionDisplay();
}

// Core utility functions
function calculate() {
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
        expression.pop(); // Remove the zero
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
    setDisplayHTML("", false); // Changed from setDisplayText("0")
    expressionDisplay.innerText = "–";
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

function showError(message = "Invalid Operation", preserveState = true) {
  expressionDisplay.innerText = message;

  if (!preserveState) {
    currentInput = [];
    expression = [];
    signChange = false;
    setDisplayText("0");
  }

  setTimeout(() => {
    updateExpressionDisplay();
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
