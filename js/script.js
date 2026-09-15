'use strict';

const form = document.querySelector('form');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal-input');
const inputfieldBill = document.getElementById('bill-input');
const inputfieldTip = document.getElementById('custom-tip-input');
const billResult = document.getElementById('bill-result');
const tipResult = document.getElementById('tip-result');
const totalResult = document.getElementById('total-result');
const prefersReducedMotion = window.matchMedia(
	'(prefers-reduced-motion: reduce)'
);
let billInputDigits = '0';
let customTipPercent = '0';

// Helper Functions
function assertInputIsNumber(input) {
	return /^\d+$/.test(input);
}

function positionCursor(pos, inputField) {
	// Reposition cursor on the next browser render
	requestAnimationFrame(() => {
		inputField.setSelectionRange(pos, pos);
	});
}

function getFormattedInput(input) {
	const inputDataset = input.dataset.model;

	switch (inputDataset) {
		case 'digits':
			const paddedDigits = billInputDigits.padStart(3, '0');
			return `${paddedDigits.slice(0, -2)},${paddedDigits.slice(-2)} €`;
		case 'percent':
			return `${customTipPercent} %`;
	}
}

function renderInput(input) {
	let formattedInput = getFormattedInput(input);

	input.value = formattedInput;

	// Dynamic cursor positioning at a space
	let posDynamic = formattedInput.indexOf(' ');
	positionCursor(posDynamic, input);
}

function handleDeleteContentBackward(input) {
	return input.slice(0, -1) || '0';
}

// Custom input field functionality
function handleBeforeInputEvent(e) {
	const input = e.target;
	const inputType = e.inputType;
	const inputDataset = input.dataset.model;

	if (!(input instanceof HTMLInputElement)) return;

	switch (inputType) {
		case 'deleteContentBackward':
			e.preventDefault();

			if (inputDataset === 'digits') {
				billInputDigits = handleDeleteContentBackward(billInputDigits);
			} else if (inputDataset === 'percent') {
				customTipPercent =
					handleDeleteContentBackward(customTipPercent);
			}

			renderInput(input);
			return;
		case 'insertText':
		case 'insertFromPaste':
			e.preventDefault();

			// Get plain text from paste/drop data, falling back to e.data:
			const text =
				e.inputType === 'insertText'
					? e.data
					: e.dataTransfer?.getData('text/plain') ?? e.data;

			if (text == null) return;

			if (!assertInputIsNumber(text)) {
				// Error animation is removed with animationend event further down
				input.classList.add('error');

				// Manual removal on error when there is no animation
				if (prefersReducedMotion.matches) {
					setTimeout(() => {
						input.classList.remove('error');
					}, 300);
				}
				return;
			}

			if (inputDataset === 'digits') {
				if (billInputDigits.length > 5) return;
				billInputDigits += text;
				// Convert to number to get rid of leading zeros, then back to string
				billInputDigits = (+billInputDigits).toString();
			} else if (inputDataset === 'percent') {
				if (customTipPercent.length > 2) return;
				customTipPercent += text;
				customTipPercent = (+customTipPercent).toString();
			}

			renderInput(input);
			return;
	}
}

// Fix mobile input field issues:
// Prevent the user from moving the cursor within the input field
function handleSelectionChange() {
	const activeElement = document.activeElement;

	if (!(activeElement instanceof HTMLInputElement)) return;

	let pos = activeElement.value.indexOf(' ');
	// Guard clause if there is no space
	if (pos === -1) return;

	if (activeElement.selectionStart !== pos)
		positionCursor(pos, activeElement);
}

// Check whether the input field value matches the formatted value; if not, re-render
function handleInputChange(e) {
	const input = e.currentTarget;
	let expectedValue = getFormattedInput(input);

	if (input.value !== expectedValue) {
		renderInput(input);
	}
}

// Tip calculator
function calcTip(tip = 0) {
	const paddedDigits = billInputDigits.padStart(3, '0');

	const cents = paddedDigits.slice(-2);
	const euro = paddedDigits.slice(0, -2);

	let billNum = +`${euro}.${cents}`;
	let tipNum = +tip;

	const tipCalc = billNum * (tipNum / 100);
	const totalCalc = tipCalc + billNum;

	billResult.innerText = getFormattedInput(inputfieldBill);
	tipResult.innerText = `${tipCalc.toFixed(2).replace('.', ',')} €`;
	totalResult.innerText = `${totalCalc.toFixed(2).replace('.', ',')} €`;
}

// Modal window functionality
function focusTrap(e) {
	if (e.key !== 'Tab') return;

	const focusableElements = modal.querySelectorAll('[data-focusable="true"]');
	const firstElement = focusableElements[0];
	const lastElement = focusableElements[focusableElements.length - 1];

	if (e.shiftKey === true) {
		if (document.activeElement === firstElement) {
			e.preventDefault();
			lastElement.focus();
		}
	} else {
		if (document.activeElement === lastElement) {
			e.preventDefault();
			firstElement.focus();
		}
	}
}

function setModalState(open) {
	overlay.classList.toggle('modal-open', open);
	modal.classList.toggle('modal-open', open);
	modal.hidden = !open;

	if (open) {
		inputfieldTip.focus();
		let pos = inputfieldTip.value.indexOf(' ');
		positionCursor(pos, inputfieldTip);
		document.addEventListener('keydown', focusTrap);
	} else {
		document.removeEventListener('keydown', focusTrap);
		inputfieldBill.focus();
	}
}

function handleEscapeBtnModal(e) {
	if (e.key !== 'Escape') return;
	if (!modal.classList.contains('modal-open')) return;
	setModalState(false);
	inputfieldBill.focus();
}

// Overall button functionality
function handleFormClick(e) {
	const clicked = e.target.closest('.btn');

	if (!clicked) return;

	// 5%, 7%, 10% button functionality
	if (clicked.dataset.tip) {
		calcTip(clicked.dataset.tip);
		return;
	}

	switch (clicked.id) {
		case 'custom':
			const modalOpen = modal.classList.contains('modal-open');
			setModalState(!modalOpen);
			break;

		case 'apply':
			calcTip(customTipPercent);
			setModalState(false);
			break;

		case 'cancel':
			setModalState(false);
			break;

		case 'reset':
			[billResult, tipResult, totalResult].forEach(
				(el) => (el.innerText = `0,00 €`)
			);
			inputfieldTip.value = `0 %`;
			customTipPercent = '0';
			billInputDigits = '0';
			inputfieldBill.focus();
			break;
	}
}

function init() {
	if (!form || !overlay || !modal || !inputfieldBill || !inputfieldTip)
		return;

	// Initialize cursor position
	inputfieldBill.focus();
	let pos = inputfieldBill.value.indexOf(' ');
	positionCursor(pos, inputfieldBill);

	// Initialize eventListeners
	[inputfieldBill, inputfieldTip].forEach((el) => {
		el.addEventListener('beforeinput', handleBeforeInputEvent);
		el.addEventListener('input', handleInputChange);
		el.addEventListener('animationend', () => {
			el.classList.remove('error');
		});
	});

	document.addEventListener('selectionchange', handleSelectionChange);
	document.addEventListener('keydown', handleEscapeBtnModal);

	form.addEventListener('click', handleFormClick);
}

init();
