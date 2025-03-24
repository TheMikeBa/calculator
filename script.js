const buttons = document.querySelectorAll("button");
const display = document.querySelector(".display");

let register = [];
let memory = [];
let signChange = false;
const operators = ["+", "-", "*", "/"];

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    display.innerText = "";
    if (button.innerText === "CLR") {
      clear();
      return;
    }
    if (button.innerText === ".") {
      if (register.includes(".")) {
        invalid();
        return;
      }
      register.push(button.innerText);
      display.innerText += button.innerText;
      return;
    }
    if (button.innerText === "+/-") {
      if (signChange) {
        register = register.shift();
        display.innerText = display.innerText.slice(1);
        signChange = false;
        return;
      }
      register.unshift("-");
      display.innerText = "-" + display.innerText;
      signChange = true;
      return;
    }
    if (button.innerText === "DEL") {
      if (register.length === 0) {
        invalid("There is nothing to delete");
        return;
      }
      register.pop();
    }
    if (button.innerText === "EXP") {
      if (register.length === 0) {
        invalid("There is nothing to exponentiate");
        return;
      }
      register.push("**");
      display.innerText += button.innerText;
      return;
    }
    if (operators.includes(button.innerText)) {
      if (register.length === 0 || operators.includes(register[-1])) {
        invalid();
        return;
      }
      if (memory.length > 2) {
        calculate();
      }
      memory.push(register.join(""));
      clearRegister();
      memory.push(button.innerText);
      return;
    }
    if (button.innerText === "=") {
      if (register.length === 0) {
        invalid("Please enter a number");
        return;
      }
      memory.push(register.join(""));
      calculate();
      return;
    }
    if (register.includes(button.innerText))
      display.innerText += button.innerText;
    register.push(button.innerText);
    console.log(register);
  });
});

function clearRegister() {
  register = [];
}

function clear() {
  register = [];
  memory = [];
  display.innerText = "";
}

function invalid(message = "Invalid Operation") {
  display.innerText = { message };
}

function calculate() {
  if (memory.length < 3) {
    invalid();
    return;
  }
  const num1 = parseFloat(memory[0]);
  const num2 = parseFloat(memory[2]);
  const operator = memory[1];
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
  memory = [result];
}
