/**
 * @jest-environment jsdom
 */

let calculator;

beforeEach(() => {
  document.body.innerHTML = `
    <div class="display">0</div>
    <div class="calculator-grid">
      <!-- Add your calculator buttons here -->
    </div>
  `;
  calculator = require('./script.js');
});

// Update all function calls to use the imported functions
describe('Calculator Basic Operations', () => {
  test('numbers display correctly', () => {
    const button = document.createElement('button');
    button.dataset.value = '5';
    button.dataset.action = 'number';
    calculator.handleNumber(button);
    
    expect(document.querySelector('.display').innerText).toBe('5');
    expect(calculator.currentInput).toEqual(['5']);  // Check currentInput array
    expect(calculator.expression).toEqual([]);       // Check expression array
    expect(calculator.signChange).toBe(false);       // Check signChange boolean
  });

  test('basic addition', () => {
    // Input: 5 + 3 =
    const buttons = [
      { value: '5', action: 'number' },
      { value: '+', action: 'operator' },
      { value: '3', action: 'number' },
      { value: '=', action: 'operator' }
    ];
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === 'number') calculator.handleNumber(button);
      if (btn.action === 'operator') calculator.handleOperator(button);
    });

    expect(document.querySelector('.display').innerText).toBe('8');
  });

  test('decimal point validation', () => {
    const button = document.createElement('button');
    button.dataset.action = 'decimal';
    
    calculator.handleDecimal(button);
    calculator.handleDecimal(button); // Try adding second decimal
    
    expect(document.querySelector('.display').innerText).toBe('0.');
  });

  test('sign toggle', () => {
    const numButton = document.createElement('button');
    numButton.dataset.value = '5';
    numButton.dataset.action = 'number';
    calculator.handleNumber(numButton);

    const signButton = document.createElement('button');
    signButton.dataset.action = 'sign';
    calculator.handleFunction(signButton);

    expect(document.querySelector('.display').innerText).toBe('-5');
  });
});

describe('Calculator Error Handling', () => {
  test('division by zero', () => {
    const buttons = [
      { value: '5', action: 'number' },
      { value: '/', action: 'operator' },
      { value: '0', action: 'number' },
      { value: '=', action: 'operator' }
    ];
    
    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.dataset.value = btn.value;
      button.dataset.action = btn.action;
      if (btn.action === 'number') calculator.handleNumber(button);
      if (btn.action === 'operator') calculator.handleOperator(button);
    });

    expect(document.querySelector('.display').innerText).toBe('Cannot divide by zero');
  });
});