const display = document.querySelector(".display");
const expressionDisplay = document.querySelector(".expression-display");

// Calculator configuration
const DECIMAL_PLACES = 10;
const SCIENTIFIC_NOTATION_THRESHOLD = 1e9;
const SCIENTIFIC_NOTATION_PRECISION = 5;
const OPERATORS = ["+", "-", "*", "/"];

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

// Expression display helper functions
const getExpressionText = () => expressionDisplay.innerText;
const setExpressionText = (text) => (expressionDisplay.innerText = text);
const updateExpressionDisplay = () => {
  setExpressionText(expression.length > 0 ? expression.join(" ") : "");
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

  // Handle leading zeros
  if (value === "0" && currentInput.length === 1 && currentInput[0] === "0") {
    // If we already have a single zero, don't add more zeros
    return;
  }

  // Replace a single leading zero with the new digit (unless it's a decimal number)
  if (
    value !== "0" &&
    currentInput.length === 1 &&
    currentInput[0] === "0" &&
    !currentInput.includes(".")
  ) {
    currentInput = [];
    setDisplayHTML(value, false);
    currentInput.push(value);
    return;
  }

  if (currentInput.length === 0) {
    setDisplayHTML(value, false);
  } else if (currentInput.includes("**")) {
    exponentDisplay(value);
  } else {
    setDisplayHTML(currentInput.join("") + value, false);
  }

  // Clear expression if starting new number after completed calculation
  if (getExpressionText().includes("=")) {
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
  // Current implementation can be optimized:
  const hasDecimal = currentInput.join("").includes(".");
  if (hasDecimal) {
    showError("Invalid decimal in number");
    return;
  }
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
    // Replace this line:
    // setDisplayText(currentInput.length === 1 ? "0." : getDisplayText() + ".");
    // With this:
    setDisplayHTML(
      currentInput.length === 1 ? "0." : currentInput.join(""),
      false
    );
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

  // Handle operators during exponent input
  if (currentInput.includes("**")) {
    // If we have a complete exponent (base**exp), evaluate it first
    if (
      currentInput.length > 1 &&
      currentInput[currentInput.length - 1] !== "**"
    ) {
      const exponentValue = currentInput.join("");
      const result = convertToNumber(exponentValue);
      expression.push(result.toString()); // Keep as string for consistency
      currentInput = [];
    }
    // If exponent was just started (last char is "**"), remove it
    else if (currentInput[currentInput.length - 1] === "**") {
      currentInput.pop();
      setDisplayHTML(currentInput.join(""), false);
    }
  }

  const value = button.dataset.value;

  if (currentInput.length > 0) {
    expression.push(currentInput.join(""));
    currentInput = [];
    signChange = false; // Reset signChange when adding to expression
  }

  if (value === "=") {
    // Handle direct exponentiation
    if (expression.length === 1 && expression[0].includes("**")) {
      const result = convertToNumber(expression[0]);
      setExpressionText(`${expression.join(" ")} =`);
      setDisplayText(result.toString()); // Convert to string
      expression = [result.toString()]; // Store as string
      return;
    }

    // Handle normal calculation
    if (expression.length === 3) {
      const result = calculate();
      if (result === undefined) return;
      setExpressionText(`${expression.join(" ")} =`);
      setDisplayText(result.toString()); // Convert to string
      expression = [result.toString()]; // Store as string
    }
    return;
  }

  // Check if the last item in expression is an operator
  // If so, replace it with the new operator
  if (
    expression.length > 0 &&
    OPERATORS.includes(expression[expression.length - 1])
  ) {
    expression[expression.length - 1] = value;
  } else {
    // Calculate and keep result if we have a complete expression
    if (expression.length === 3) {
      const result = calculate();
      if (result === undefined) return;
      expression = [result, value];

      // Clear the display when chaining calculations
      setDisplayHTML("", false);
    } else {
      expression.push(value);
    }
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
        setDisplayHTML("", false); // Clear display before showing error
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

function reset() {
  currentInput = [];
  expression = [];
  signChange = false;
  setDisplayHTML("", false);
  setExpressionText(""); // Changed from "–"
}

function toggleSign() {
  // If no input yet, add a negative sign to start with
  if (currentInput.length === 0) {
    // Check if we're in the middle of a calculation
    if (
      expression.length >= 2 &&
      OPERATORS.includes(expression[expression.length - 1])
    ) {
      // We're toggling the sign for the second number in a calculation
      currentInput.push("-");
      setDisplayHTML("-", false);
      signChange = true;
      return;
    }

    currentInput.push("-");
    setDisplayHTML("-", false);
    signChange = true;
    return;
  }

  if (signChange) {
    currentInput.shift(); // Remove the negative sign from the beginning
    setDisplayHTML(currentInput.join(""), false);
    signChange = false;
  } else {
    currentInput.unshift("-"); // Add negative sign to the beginning
    setDisplayHTML(currentInput.join(""), false);
    signChange = true;
  }

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
  setExpressionText(message);

  if (!preserveState) {
    currentInput = [];
    expression = [];
    signChange = false;
    display.innerHTML = '<span class="cursor">|</span>';
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
