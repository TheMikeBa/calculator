/**
 * @jest-environment jsdom
 */

let calculator;
const DISPLAY = ".display";
const display = () => document.querySelector(DISPLAY);
const displayText = () => display().innerText;
const displayHTML = () => display().innerHTML;

// Helper function for checking calculator state across all tests
const checkCalculatorState = (
  expectedText,
  currentInput = [],
  expression = [],
  signChange = false
) => {
  expect(displayText()).toBe(expectedText);
  expect(calculator.currentInput).toEqual(currentInput);
  expect(calculator.expression).toEqual(expression);
  expect(calculator.signChange).toBe(signChange);
};

beforeEach(() => {
  document.body.innerHTML = `
    <div class="${DISPLAY.slice(1)}">0</div>
    <div class="calculator-grid">
      <!-- Add your calculator buttons here -->
    </div>
  `;
  calculator = require("./script.js");
});

describe("Decimal Point Operations", () => {
  test("adds decimal point to empty display", () => {
    const button = document.createElement("button");
    button.dataset.action = "decimal";
    calculator.handleDecimal(button);

    checkCalculatorState("0.", ["."]);
  });

  test("prevents adding second decimal point", () => {
    const button = document.createElement("button");
    button.dataset.action = "decimal";

    calculator.handleDecimal(button);
    calculator.handleDecimal(button);

    checkCalculatorState("You can only have one decimal point in a number", [
      ".",
    ]);
  });

  test("adds decimal point after number", () => {
    const numButton = document.createElement("button");
    numButton.dataset.value = "5";
    numButton.dataset.action = "number";
    calculator.handleNumber(numButton);

    const decButton = document.createElement("button");
    decButton.dataset.action = "decimal";
    calculator.handleDecimal(decButton);

    checkCalculatorState("5.", ["5", "."]);
  });
});

describe("Calculator Basic Operations", () => {
  test("numbers display correctly", () => {
    const button = document.createElement("button");
    button.dataset.value = "5";
    button.dataset.action = "number";
    calculator.handleNumber(button);

    checkCalculatorState("5", ["5"]);
  });

  test("basic addition", () => {
    const buttons = [
      { value: "5", action: "number" },
      { value: "+", action: "operator" },
      { value: "3", action: "number" },
      { value: "=", action: "operator" },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      if (btn.action === "operator") calculator.handleOperator(button);
    });

    checkCalculatorState("8", []);
  });

  test("sign toggle", () => {
    const numButton = document.createElement("button");
    numButton.dataset.value = "5";
    numButton.dataset.action = "number";
    calculator.handleNumber(numButton);

    const signButton = document.createElement("button");
    signButton.dataset.action = "sign";
    calculator.handleFunction(signButton);

    checkCalculatorState("-5", ["-", "5"], [], true);
  });
});

describe("Calculator Error Handling", () => {
  test("division by zero", () => {
    const buttons = [
      { value: "5", action: "number" },
      { value: "/", action: "operator" },
      { value: "0", action: "number" },
      { value: "=", action: "operator" },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      if (btn.action === "operator") calculator.handleOperator(button);
    });

    checkCalculatorState("Cannot divide by zero", []);
  });
});
