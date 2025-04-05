/**
 * @jest-environment jsdom
 */

let calculator;
const DISPLAY = ".display";
const EXPRESSION_DISPLAY = ".expression-display";
const display = () => document.querySelector(DISPLAY);
const expressionDisplay = () => document.querySelector(EXPRESSION_DISPLAY);
const displayText = () => display().innerText;
const displayHTML = () => display().innerHTML;
const expressionText = () => expressionDisplay().innerText;

// Helper functions for checking display state and calculator state
const checkDisplays = (display, expression) => {
  expect(displayText()).toBe(display);
  expect(expressionText()).toBe(expression);
};

const checkState = (currentInput, expression, signChange) => {
  expect(calculator.currentInput).toEqual(currentInput);
  expect(calculator.expression).toEqual(expression);
  expect(calculator.signChange).toBe(signChange);
};

beforeEach(() => {
  document.body.innerHTML = `
    <div class="container">
      <div class="${EXPRESSION_DISPLAY.slice(1)}">–</div>
      <div class="${DISPLAY.slice(1)}"><span class="cursor">|</span></div>
      <div class="keypad">
        <!-- Add your calculator buttons here -->
      </div>
    </div>
  `;
  calculator = require("./script.js");
});

describe("Happy Path - Basic Operations", () => {
  test("number input displays correctly", () => {
    const buttons = [
      { value: "1", action: "number" },
      { value: "2", action: "number" },
      { value: "3", action: "number" },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      calculator.handleNumber(button);
    });

    checkDisplays("123", "–");
    checkState(["1", "2", "3"], [], false);
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

    checkDisplays("8", "5 + 3 =");
    checkState([], [8], false);
  });
  test("basic subtraction", () => {
    const buttons = [
      { value: "9", action: "number" },
      { value: "-", action: "operator" },
      { value: "4", action: "number" },
      { value: "=", action: "operator" },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      if (btn.action === "operator") calculator.handleOperator(button);
    });

    checkDisplays("5", "9 - 4 =");
    checkState([], [5], false);
  });
  test("basic multiplication", () => {
    const buttons = [
      { value: "6", action: "number" },
      { value: "*", action: "operator" },
      { value: "7", action: "number" },
      { value: "=", action: "operator" },
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      if (btn.action === "operator") calculator.handleOperator(button);
    });

    checkDisplays("42", "6 × 7 =");
    checkState([], [42], false);
  });
  test("basic division", () => {
    const buttons = [
      { value: "15", action: "number" },
      { value: "/", action: "operator" },
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

    checkDisplays("5", "15 / 3 =");
    checkState([], [5], false);
  });
  test("chaining operations (1 + 2 * 3)", () => {
    const buttons = [
      { value: "1", action: "number" },
      { value: "+", action: "operator" },
      { value: "2", action: "number" },
      { value: "*", action: "operator" },
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

    checkDisplays("9", "1 + 2 * 3 =");
    checkState([], [9], false);
  });
});

describe("Happy Path - Special Functions", () => {
  test("clear resets calculator state", () => {});
  test("delete removes last digit", () => {});
  test("sign toggle works on number", () => {});
  test("exponent operation", () => {});
});

describe("Edge Cases", () => {
  test("decimal point handling", () => {});
  test("large numbers", () => {});
  test("negative numbers in operations", () => {});
  test("multiple zeros at start", () => {});
});

describe("Error Cases", () => {
  test("division by zero", () => {});
  test("invalid operation sequence", () => {});
  test("multiple decimals prevented", () => {});
  test("overflow handling", () => {});
});
