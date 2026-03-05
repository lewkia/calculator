'use strict';

const display = document.getElementById('result');
const expression = document.getElementById('expression');

const state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForOperand: false,
  justEvaluated: false,
};

function updateDisplay() {
  display.textContent = state.current;
  display.classList.toggle('small', state.current.length > 9);
}

function inputDigit(digit) {
  if (state.waitingForOperand) {
    state.current = digit;
    state.waitingForOperand = false;
  } else if (state.justEvaluated) {
    state.current = digit;
    state.justEvaluated = false;
    expression.textContent = '';
  } else {
    state.current = state.current === '0' ? digit : state.current + digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (state.waitingForOperand) {
    state.current = '0.';
    state.waitingForOperand = false;
    updateDisplay();
    return;
  }
  if (state.justEvaluated) {
    state.current = '0.';
    state.justEvaluated = false;
    expression.textContent = '';
    updateDisplay();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    updateDisplay();
  }
}

function setOperator(op) {
  const current = parseFloat(state.current);

  if (state.operator && !state.waitingForOperand) {
    const result = calculate(state.previous, current, state.operator);
    state.current = formatResult(result);
    state.previous = result;
    updateDisplay();
  } else {
    state.previous = current;
  }

  state.operator = op;
  state.waitingForOperand = true;
  state.justEvaluated = false;

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  expression.textContent = `${formatResult(state.previous)} ${opSymbols[op]}`;

  highlightOperator(op);
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? 'Error' : a / b;
  }
}

function formatResult(value) {
  if (value === 'Error') return 'Error';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  // Avoid floating-point noise like 0.1 + 0.2 = 0.30000000000000004
  const rounded = parseFloat(num.toPrecision(12));
  return String(rounded);
}

function evaluate() {
  if (!state.operator || state.waitingForOperand) return;

  const current = parseFloat(state.current);
  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  expression.textContent = `${formatResult(state.previous)} ${opSymbols[state.operator]} ${formatResult(current)} =`;

  const result = calculate(state.previous, current, state.operator);
  state.current = formatResult(result);
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justEvaluated = true;

  updateDisplay();
  clearOperatorHighlight();
}

function clearAll() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.waitingForOperand = false;
  state.justEvaluated = false;
  expression.textContent = '';
  updateDisplay();
  clearOperatorHighlight();
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

function percent() {
  const value = parseFloat(state.current);
  if (isNaN(value)) return;
  if (state.previous !== null && state.operator) {
    state.current = formatResult((state.previous * value) / 100);
  } else {
    state.current = formatResult(value / 100);
  }
  updateDisplay();
}

function highlightOperator(op) {
  clearOperatorHighlight();
  document.querySelectorAll('[data-action="operator"]').forEach(btn => {
    if (btn.dataset.value === op) btn.classList.add('active');
  });
}

function clearOperatorHighlight() {
  document.querySelectorAll('[data-action="operator"]').forEach(btn => {
    btn.classList.remove('active');
  });
}

// Button click handler
document.querySelector('.buttons').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const { action, value } = btn.dataset;

  if (action !== 'operator') clearOperatorHighlight();

  switch (action) {
    case 'digit':      inputDigit(value); break;
    case 'decimal':    inputDecimal(); break;
    case 'operator':   setOperator(value); break;
    case 'equals':     evaluate(); break;
    case 'clear-all':  clearAll(); break;
    case 'toggle-sign': toggleSign(); break;
    case 'percent':    percent(); break;
  }
});

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.') inputDecimal();
  else if (e.key === '+') setOperator('+');
  else if (e.key === '-') setOperator('-');
  else if (e.key === '*') setOperator('*');
  else if (e.key === '/') { e.preventDefault(); setOperator('/'); }
  else if (e.key === '%') percent();
  else if (e.key === 'Enter' || e.key === '=') evaluate();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === 'Backspace') {
    if (state.justEvaluated || state.waitingForOperand) return;
    state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
    updateDisplay();
  }
});
