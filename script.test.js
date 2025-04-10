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

const checkCalculationResult = (result, expected, expression) => {
  expect(Number(result)).toBe(expected);
  expect(expressionText()).toBe(expression);
};

const createButton = (value, action = "number") => {
  const button = document.createElement("button");
  button.dataset.value = value;
  button.dataset.action = action;
  return button;
};

beforeEach(() => {
  document.body.innerHTML = `
    <div class="container">
      <div class="${EXPRESSION_DISPLAY.slice(1)}"></div> <!-- Removed "–" -->
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
    const buttons = ["1", "2", "3"].map((value) => createButton(value));
    buttons.forEach((button) => calculator.handleNumber(button));

    checkDisplays("123", "–");
    checkState(["1", "2", "3"], [], false);
  });
  test("basic addition", () => {
    const buttons = [
      createButton("5"),
      createButton("+", "operator"),
      createButton("3"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    const expected = 5 + 3;
    checkDisplays(expected.toString(), "5 + 3 =");
    checkState([], [expected], false);
  });
  test("basic subtraction", () => {
    const buttons = [
      createButton("9"),
      createButton("-", "operator"),
      createButton("4"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    const expected = 9 - 4;
    checkDisplays(expected.toString(), "9 - 4 =");
    checkState([], [expected], false);
  });
  test("basic multiplication", () => {
    const buttons = [
      createButton("6"),
      createButton("*", "operator"),
      createButton("7"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    const expected = 6 * 7;
    checkDisplays(expected.toString(), "6 × 7 =");
    checkState([], [expected], false);
  });
  test("basic division", () => {
    const buttons = [
      createButton("15"),
      createButton("/", "operator"),
      createButton("3"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    const expected = 15 / 3;
    checkDisplays(expected.toString(), "15 / 3 =");
    checkState([], [expected], false);
  });
  test("chaining operations (1 + 2 * 3)", () => {
    const buttons = [
      createButton("1"),
      createButton("+", "operator"),
      createButton("2"),
      createButton("*", "operator"),
      createButton("3"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    const expected = 1 + 2 * 3; // Note order of operations
    checkDisplays(expected.toString(), "1 + 2 * 3 =");
    checkState([], [expected], false);
  });
});

describe("Happy Path - Special Functions", () => {
  test("clear resets calculator state", () => {
    // First enter some numbers and operations
    const buttons = [
      createButton("5"),
      createButton("+", "operator"),
      createButton("3"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator")
        calculator.handleOperator(button);
    });

    // Now trigger clear
    const clearButton = createButton("", "clear");
    calculator.handleClear(clearButton);

    // Verify everything is reset
    checkDisplays("|", "–"); // Expect cursor to remain
    checkState([], [], false);
  });
  test("delete removes last digit", () => {
    // Enter some numbers
    const buttons = ["1", "2", "3"].map((value) => createButton(value));
    buttons.forEach((button) => calculator.handleNumber(button));

    // Now trigger delete
    const deleteButton = createButton("", "delete");
    calculator.handleDelete(deleteButton);

    // Verify last digit was removed
    checkDisplays("12", "");
    checkState(["1", "2"], [], false);
  });
  test("sign toggle works on number", () => {
    // First enter a number
    const numberButton = createButton("5");
    calculator.handleNumber(numberButton);

    // Toggle sign to negative
    const signButton = createButton("", "sign");
    calculator.handleFunction(signButton);

    checkDisplays("-5", "");
    checkState(["-", "5"], [], true);

    // Toggle sign back to positive
    calculator.handleFunction(signButton);
    checkDisplays("5", "");
    checkState(["5"], [], false);
  });
  test("exponent operation", () => {
    // Enter base number and exponent
    const buttons = [
      createButton("2"),
      createButton("", "exponent"),
      createButton("3"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator")
        calculator.handleOperator(button);
      else if (button.dataset.action === "exponent")
        calculator.handleFunction(button);
    });

    checkDisplays("8", "2 ** 3 =");
    checkState([], [8], false);
  });
  test("calculation with exponentiated term", () => {
    const buttons = [
      // Calculate 2^3 first
      createButton("2"),
      createButton("", "exponent"),
      createButton("3"),
      // Then multiply by 5
      createButton("*", "operator"),
      createButton("5"),
      createButton("=", "operator"),
    ];

    buttons.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator")
        calculator.handleOperator(button);
      else if (button.dataset.action === "exponent")
        calculator.handleFunction(button);
    });

    const expected = Math.pow(2, 3) * 5;
    checkDisplays(expected.toString(), "8 * 5 =");
    checkState([], [expected], false);
  });
});

describe("Exponent Operations", () => {
  test("exponent with decimal base", () => {
    const buttons = [
      createButton("2"),
      createButton(".", "decimal"),
      createButton("5"),
      createButton("", "exponent"),
      createButton("2"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "decimal") calculator.handleDecimal(button);
      else if (button.dataset.action === "exponent") calculator.handleFunction(button);
    });

    checkDisplays("6.25", "2.5 ** 2 ="); // 2.5^2 = 6.25
    checkState([], [6.25], false);
  });

  test("negative exponent", () => {
    const buttons = [
      createButton("2"),
      createButton("", "exponent"),
      createButton("", "sign"), // Make exponent negative
      createButton("3"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "sign") calculator.handleFunction(button);
      else if (button.dataset.action === "exponent") calculator.handleFunction(button);
    });

    checkDisplays("0.125", "2 ** -3 ="); // 2^-3 = 0.125
    checkState([], [0.125], false);
  });

  test("decimal with negative exponent", () => {
    const buttons = [
      createButton("1"),
      createButton(".", "decimal"),
      createButton("5"),
      createButton("", "exponent"),
      createButton("", "sign"), // Make exponent negative
      createButton("2"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "decimal") calculator.handleDecimal(button);
      else if (button.dataset.action === "sign") calculator.handleFunction(button);
      else if (button.dataset.action === "exponent") calculator.handleFunction(button);
    });

    checkDisplays("0.444...", "1.5 ** -2 ="); // 1.5^-2 ≈ 0.444...
    checkState([], [0.4444444444444444], false);
  });

  test("decimal exponent", () => {
    const buttons = [
      createButton("2"),
      createButton("", "exponent"),
      createButton("1"),
      createButton(".", "decimal"),
      createButton("5"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "decimal") calculator.handleDecimal(button);
      else if (button.dataset.action === "exponent") calculator.handleFunction(button);
    });

    const expected = Math.pow(2, 1.5);
    checkDisplays(expected.toString(), "2 ** 1.5 =");
    checkState([], [expected], false);
  });

  test("decimal base and exponent", () => {
    const buttons = [
      createButton("1"),
      createButton(".", "decimal"),
      createButton("5"),
      createButton("", "exponent"),
      createButton("1"),
      createButton(".", "decimal"),
      createButton("5"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "decimal") calculator.handleDecimal(button);
      else if (button.dataset.action === "exponent") calculator.handleFunction(button);
    });

    const expected = Math.pow(1.5, 1.5);
    checkDisplays(expected.toString(), "1.5 ** 1.5 =");
    checkState([], [expected], false);
  });
});

describe("Edge Cases", () => {
  test("decimal point handling", () => {
    // Test single decimal in number
    const buttons1 = [
      createButton("1"),
      createButton(".", "decimal"),
      createButton("5"),
    ];

    buttons1.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "decimal") calculator.handleDecimal(button);
    });

    checkDisplays("1.5", "");
    checkState(["1", ".", "5"], [], false);

    // Test decimal at start becomes "0."
    calculator.reset();
    const decimalFirstButton = createButton(".", "decimal");
    calculator.handleDecimal(decimalFirstButton);

    checkDisplays("0.", "");
    checkState(["0", "."], [], false);

    // Test multiple decimals prevented
    calculator.reset();
    const buttons2 = [
      createButton("2"),
      createButton(".", "decimal"),
      createButton(".", "decimal"), // Second decimal should be rejected
    ];

    // Mock setTimeout to control timing
    jest.useFakeTimers();
    const originalShowError = calculator.showError;
    let errorMessage = "";
    calculator.showError = (message) => {
      errorMessage = message;
      originalShowError.call(calculator, message);
    };

    buttons2.forEach((button) => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "decimal") calculator.handleDecimal(button);
    });

    // Verify error was shown
    expect(errorMessage).toBe("Invalid decimal in number");

    // Fast-forward time by 2 seconds
    jest.advanceTimersByTime(2000);

    // Verify display returns to normal after timeout
    checkDisplays("2.", "");
    checkState(["2", "."], [], false);

    // Clean up
    calculator.showError = originalShowError;
    jest.useRealTimers();
  });
  test("large numbers", () => {
    // Enter a large number
    const largeNumber = "9999999999";
    const buttons = largeNumber.split("").map((digit) => createButton(digit));
    buttons.forEach((button) => calculator.handleNumber(button));

    checkDisplays(largeNumber, "");
    checkState(largeNumber.split(""), [], false);

    // Test calculation with large numbers
    const operatorButton = createButton("*", "operator");
    calculator.handleOperator(operatorButton);

    const secondNumber = "2";
    const secondButton = createButton(secondNumber);
    calculator.handleNumber(secondButton);

    const equalsButton = createButton("=", "operator");
    calculator.handleOperator(equalsButton);

    const result = displayText();
    const expectedResult = Number(largeNumber) * Number(secondNumber);

    // Verify scientific notation is used for large numbers
    expect(result.includes("e+")).toBe(true);
    checkCalculationResult(
      result,
      expectedResult,
      `${largeNumber} * ${secondNumber} =`
    );
  });
  test("negative numbers in operations", () => {
    // Test negative number in operation
    const buttons = [
      createButton("5"),
      createButton("-", "operator"),
      createButton("", "sign"),
      createButton("3"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "sign") calculator.handleFunction(button);
    });
  
    const expected = 5 - (-3);
    checkDisplays(expected.toString(), "5 - -3 =");
    checkState([], [expected], false);
  
    // Test calculation with negative first number
    calculator.reset();
    const buttons2 = [
      createButton("7"),
      createButton("", "sign"),
      createButton("+", "operator"),
      createButton("4"),
      createButton("=", "operator")
    ];

    buttons2.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      else if (button.dataset.action === "operator") calculator.handleOperator(button);
      else if (button.dataset.action === "sign") calculator.handleFunction(button);
    });
  
    const expected2 = -7 + 4;
    checkDisplays(expected2.toString(), "-7 + 4 =");
    checkState([], [expected2], false);
  });
  test("multiple zeros at start", () => {
    // Test entering multiple zeros at start
    const buttons = [
      createButton("0"),
      createButton("0"), 
      createButton("0")
    ];

    buttons.forEach(button => calculator.handleNumber(button));

    // Should display just a single zero
    checkDisplays("0", "–");
    checkState(["0"], [], false);

    // Now add a non-zero digit
    const nonZeroButton = createButton("5");
    calculator.handleNumber(nonZeroButton);

    // Should now show "5" (replacing the zero)
    checkDisplays("5", "–");
    checkState(["5"], [], false);

    // Test with decimal point
    calculator.reset();
    const zeroDecimalButtons = [
      createButton("0"),
      createButton("0"),
      createButton(".", "decimal"),
      createButton("3")
    ];

    zeroDecimalButtons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "decimal") calculator.handleDecimal(button);
    });

    // Should display "0.3" (keeping the leading zero for decimal)
    checkDisplays("0.3", "–");
    checkState(["0", ".", "3"], [], false);
  });
  test("operations with zero", () => {
    // Test multiplication by zero
    const buttons1 = [
      createButton("5"),
      createButton("*", "operator"),
      createButton("0"),
      createButton("=", "operator")
    ];

    buttons1.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    checkDisplays("0", "5 * 0 =");
    checkState([], [0], false);

    // Test addition of zero
    calculator.reset();
    const buttons2 = [
      createButton("0"),
      createButton("+", "operator"),
      createButton("5"),
      createButton("=", "operator")
    ];

    buttons2.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    checkDisplays("5", "0 + 5 =");
    checkState([], [5], false);
  });
});

describe("Error Cases", () => {
  test("division by zero", () => {
    const buttons = [
      createButton("5"),
      createButton("/", "operator"),
      createButton("0"),
      createButton("=", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    // Verify error appears in expression display
    expect(expressionText()).toBe("Please use a non-zero divisor");
    checkState([], ["5", "/"], false);
  });

  test("invalid operation sequence", () => {
    const buttons = [
      createButton("5"),
      createButton("+", "operator"),
      createButton("*", "operator")
    ];

    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "operator") calculator.handleOperator(button);
    });

    // The actual behavior replaces the previous operator
    expect(expressionText()).toBe("5 *");
    checkState([], ["5", "*"], false);
  });

  test("multiple decimals prevented", () => {
    const buttons = [
      createButton("2"),
      createButton(".", "decimal"),
      createButton(".", "decimal")
    ];

    jest.useFakeTimers();
    buttons.forEach(button => {
      if (button.dataset.action === "number") calculator.handleNumber(button);
      if (button.dataset.action === "decimal") calculator.handleDecimal(button);
    });

    expect(expressionText()).toBe("Invalid decimal in number");
    checkState(["2", "."], [], false);

    jest.advanceTimersByTime(2000);
    jest.useRealTimers();
  });
});
