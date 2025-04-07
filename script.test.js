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
  test("clear resets calculator state", () => {
    // First enter some numbers and operations
    const buttons = [
      { value: "5", action: "number" },
      { value: "+", action: "operator" },
      { value: "3", action: "number" }
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      if (btn.action === "operator") calculator.handleOperator(button);
    });

    // Now trigger clear
    const clearButton = document.createElement("button");
    clearButton.dataset.action = "clear";
    calculator.handleClear(clearButton);

    // Verify everything is reset
    checkDisplays("|", "–");  // Expect cursor to remain
    checkState([], [], false);
  });
  test("delete removes last digit", () => {
    // Enter some numbers
    const buttons = [
      { value: "1", action: "number" },
      { value: "2", action: "number" },
      { value: "3", action: "number" }
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      calculator.handleNumber(button);
    });

    // Now trigger delete
    const deleteButton = document.createElement("button");
    deleteButton.dataset.action = "delete";
    calculator.handleDelete(deleteButton);

    // Verify last digit was removed
    checkDisplays("12", "–");
    checkState(["1", "2"], [], false);
  });
  test("sign toggle works on number", () => {
      // First enter a number
      const numberButton = document.createElement("button");
      numberButton.dataset.value = "5";
      numberButton.dataset.action = "number";
      calculator.handleNumber(numberButton);
  
      // Toggle sign to negative
      const signButton = document.createElement("button");
      signButton.dataset.action = "sign";
      calculator.handleFunction(signButton);
  
      checkDisplays("-5", "–");
      checkState(["-", "5"], [], true);
  
      // Toggle sign back to positive
      calculator.handleFunction(signButton);
      checkDisplays("5", "–");
      checkState(["5"], [], false);
    });
  test("exponent operation", () => {
    // Enter base number
    const buttons = [
      { value: "2", action: "number" },
      { action: "exponent" },  // Press exponent button
      { value: "3", action: "number" },  // Enter exponent
      { value: "=", action: "operator" }  // Calculate
    ];

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      if (btn.value) button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      else if (btn.action === "operator") calculator.handleOperator(button);
      else if (btn.action === "exponent") calculator.handleFunction(button);
    });

    checkDisplays("8", "2 ** 3 =");
    checkState([], [8], false);
  });
  test("calculation with exponentiated term", () => {
      const buttons = [
        // Calculate 2^3 first
        { value: "2", action: "number" },
        { action: "exponent" },
        { value: "3", action: "number" },
        // Then multiply by 5
        { value: "*", action: "operator" },
        { value: "5", action: "number" },
        { value: "=", action: "operator" }
      ];
  
      buttons.forEach((btn) => {
        const button = document.createElement("button");
        if (btn.value) button.dataset.value = btn.value;
        button.dataset.action = btn.action;
        if (btn.action === "number") calculator.handleNumber(button);
        else if (btn.action === "operator") calculator.handleOperator(button);
        else if (btn.action === "exponent") calculator.handleFunction(button);
      });
  
      checkDisplays("40", "8 * 5 ="); // 2^3=8, 8*5=40
      checkState([], [40], false);
    });
});

describe("Edge Cases", () => {
  test("decimal point handling", () => {
      // Test single decimal in number
      const buttons1 = [
        { value: "1", action: "number" },
        { value: ".", action: "decimal" },
        { value: "5", action: "number" }
      ];
  
      buttons1.forEach((btn) => {
        const button = document.createElement("button");
        button.dataset.value = btn.value;
        button.dataset.action = btn.action;
        if (btn.action === "number") calculator.handleNumber(button);
        if (btn.action === "decimal") calculator.handleDecimal(button);
      });
  
      checkDisplays("1.5", "–");
      checkState(["1", ".", "5"], [], false);
  
      // Test decimal at start becomes "0."
      calculator.reset();
      const decimalFirstButton = document.createElement("button");
      decimalFirstButton.dataset.value = ".";
      decimalFirstButton.dataset.action = "decimal";
      calculator.handleDecimal(decimalFirstButton);
  
      checkDisplays("0.", "–");
      checkState(["0", "."], [], false);
  
      // Test multiple decimals prevented
      calculator.reset();
      const buttons2 = [
        { value: "2", action: "number" },
        { value: ".", action: "decimal" },
        { value: ".", action: "decimal" } // Second decimal should be rejected
      ];
  
      // Mock setTimeout to control timing
      jest.useFakeTimers();
      const originalShowError = calculator.showError;
      let errorMessage = "";
      calculator.showError = (message) => {
        errorMessage = message;
        originalShowError.call(calculator, message);
      };
  
      buttons2.forEach((btn) => {
        const button = document.createElement("button");
        button.dataset.value = btn.value;
        button.dataset.action = btn.action;
        if (btn.action === "number") calculator.handleNumber(button);
        if (btn.action === "decimal") calculator.handleDecimal(button);
      });
  
      // Verify error was shown
      expect(errorMessage).toBe("Invalid decimal in number");
      
      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);
      
      // Verify display returns to normal after timeout
      checkDisplays("2.", "–");
      checkState(["2", "."], [], false);
      
      // Clean up
      calculator.showError = originalShowError;
      jest.useRealTimers();
    });
  test("large numbers", () => {
      // Enter a large number
      const largeNumber = "9999999999";
      for (let digit of largeNumber) {
        const button = document.createElement("button");
        button.dataset.value = digit;
        button.dataset.action = "number";
        calculator.handleNumber(button);
      }
  
      checkDisplays(largeNumber, "–");
      checkState(largeNumber.split(""), [], false);
  
      // Test calculation with large numbers
      const operatorButton = document.createElement("button");
      operatorButton.dataset.value = "*";
      operatorButton.dataset.action = "operator";
      calculator.handleOperator(operatorButton);
  
      const secondNumber = "2";
      const secondButton = document.createElement("button");
      secondButton.dataset.value = secondNumber;
      secondButton.dataset.action = "number";
      calculator.handleNumber(secondButton);
  
      const equalsButton = document.createElement("button");
      equalsButton.dataset.value = "=";
      equalsButton.dataset.action = "operator";
      calculator.handleOperator(equalsButton);
  
      // Instead of using regex to check for scientific notation
      const result = displayText();
      
      // Check if the result contains 'e+' which indicates scientific notation
      expect(result.includes('e+')).toBe(true);
      
      // Verify the actual numeric value matches the expected calculation
      const numericResult = Number(result);
      const expectedResult = Number(largeNumber) * Number(secondNumber);
      expect(numericResult).toBe(expectedResult);
      
      expect(expressionText()).toBe(`${largeNumber} * ${secondNumber} =`);
    });  
  test("negative numbers in operations", () => {
    // Test negative number in operation
    const buttons = [
      { value: "5", action: "number" },
      { value: "-", action: "operator" },
      { action: "sign" }, // Make the next number negative
      { value: "3", action: "number" },
      { value: "=", action: "operator" }
    ];
  
    buttons.forEach((btn) => {
      const button = document.createElement("button");
      if (btn.value) button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === "number") calculator.handleNumber(button);
      else if (btn.action === "operator") calculator.handleOperator(button);
      else if (btn.action === "sign") calculator.handleFunction(button);
    });
  
    checkDisplays("8", "5 - -3 ="); // 5 - (-3) = 8
    checkState([], [8], false);
  
  // Test calculation with negative first number
  calculator.reset();
  
  const firstNumButton = document.createElement("button");
  firstNumButton.dataset.value = "7";
  firstNumButton.dataset.action = "number";
  calculator.handleNumber(firstNumButton);
  
  const signButton = document.createElement("button");
  signButton.dataset.action = "sign";
  calculator.handleFunction(signButton);
  
  const opButton = document.createElement("button");
  opButton.dataset.value = "+";
  opButton.dataset.action = "operator";
  calculator.handleOperator(opButton);
  
  const secondNumButton = document.createElement("button");
  secondNumButton.dataset.value = "4";
  secondNumButton.dataset.action = "number";
  calculator.handleNumber(secondNumButton);
  
  const eqButton = document.createElement("button");
  eqButton.dataset.value = "=";
  eqButton.dataset.action = "operator";
  calculator.handleOperator(eqButton);
  
  checkDisplays("-3", "-7 + 4 ="); // -7 + 4 = -3
  checkState([], [-3], false);
  });
  test("multiple zeros at start", () => {
      // Test entering multiple zeros at start
      const buttons = [
        { value: "0", action: "number" },
        { value: "0", action: "number" },
        { value: "0", action: "number" }
      ];
  
      buttons.forEach((btn) => {
        const button = document.createElement("button");
        button.dataset.value = btn.value;
        button.dataset.action = btn.action;
        calculator.handleNumber(button);
      });
  
      // Should display just a single zero
      checkDisplays("0", "–");
      checkState(["0"], [], false);
  
      // Now add a non-zero digit
      const nonZeroButton = document.createElement("button");
      nonZeroButton.dataset.value = "5";
      nonZeroButton.dataset.action = "number";
      calculator.handleNumber(nonZeroButton);
  
      // Should now show "5" (replacing the zero)
      checkDisplays("5", "–");
      checkState(["5"], [], false);
  
      // Test with decimal point
      calculator.reset();
      const zeroDecimalButtons = [
        { value: "0", action: "number" },
        { value: "0", action: "number" },
        { value: ".", action: "decimal" },
        { value: "3", action: "number" }
      ];
  
      zeroDecimalButtons.forEach((btn) => {
        const button = document.createElement("button");
        button.dataset.value = btn.value;
        button.dataset.action = btn.action;
        if (btn.action === "number") calculator.handleNumber(button);
        if (btn.action === "decimal") calculator.handleDecimal(button);
      });
  
      // Should display "0.3" (keeping the leading zero for decimal)
      checkDisplays("0.3", "–");
      checkState(["0", ".", "3"], [], false);
    });
});

describe("Error Cases", () => {
  test("division by zero", () => {});
  test("invalid operation sequence", () => {});
  test("multiple decimals prevented", () => {});
  test("overflow handling", () => {});
});
