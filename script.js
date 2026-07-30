'use strict';
//TODO:
/*
- Copy/Paste Event handlen
- Richtige Font downloaden und Fontface vorbereiten
- CSS sauber machen
- CSS error so wie PayPal bauen mit wackeln */

/* TODO
id-Abfrage

Das funktioniert, skaliert aber nicht besonders gut.

Statt

if (input.id === 'bill-input') {
    digits = pastedText;
} else if (input.id === 'custom-tip-input') {
    percent = pastedText;
}

könntest du z. B. ein data-*-Attribut verwenden:

<input data-model="digits">
<input data-model="percent">

Dann:

switch (input.dataset.model) {
    case 'digits':
        digits = pastedText;
        break;
    case 'percent':
        percent = pastedText;
        break;
}
*/

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
let digits = '0';
let percent = '0';

/* Ansatz: "Ich verwalte einen Zustand und benutze das Inputfeld nur als Ausgabe." */

/* Helper Functions */
function assertInputIsNumber(input) {
	return /^\d+$/.test(input);
}

function positionCursor(pos, el) {
	requestAnimationFrame(() => {
		el.setSelectionRange(pos, pos);
	});
}

function getFormattedInput(el) {
	if (el.id === 'bill-input') {
		const paddedDigits = digits.padStart(3, '0');
		return `${paddedDigits.slice(0, -2)},${paddedDigits.slice(-2)} €`;
	} else if (el.id === 'custom-tip-input') {
		return `${percent} %`;
	}
}

function renderInput(el) {
	let formattedInput = getFormattedInput(el);

	el.value = formattedInput;

	/* Dynamische Cursorpositionierung am Leerzeichen: */
	let posDynamic = formattedInput.indexOf(' ');
	positionCursor(posDynamic, el);
}

function handleDeleteContentBackward(el) {
	return el.slice(0, -1) || '0';
}

/* Inputfelder Functions */
function handleBeforeInputEvent(e) {
	const input = e.target;
	if (!(input instanceof HTMLInputElement)) return;

	if (e.inputType === 'deleteContentBackward') {
		e.preventDefault();

		if (input.id === 'bill-input') {
			digits = handleDeleteContentBackward(digits);
		} else if (input.id === 'custom-tip-input') {
			percent = handleDeleteContentBackward(percent);
		}

		renderInput(input);
		return;
	}

	if (e.inputType === 'insertText' || e.inputType === 'insertFromPaste') {
		e.preventDefault();

		const text =
			e.inputType === 'insertText'
				? e.data
				: e.dataTransfer?.getData('text/plain') ?? e.data;

		if (text == null) return;

		if (!assertInputIsNumber(text)) {
			input.classList.add('error');

			if (prefersReducedMotion.matches) {
				setTimeout(() => {
					input.classList.remove('error');
				}, 300);
			}

			return;
		}

		if (input.id === 'bill-input') {
			if (digits.length > 5) return;
			digits += text;
			/* Convert to Number to get rid of leading zeros, then back to string */
			digits = (+digits).toString();
		} else if (input.id === 'custom-tip-input') {
			if (percent.length > 2) return;
			percent += text;
			percent = (+percent).toString();
		}

		renderInput(input);
		return;
	}
}

/* Mobile Inputfeld-Bugs beheben: */
/* User kann den Cursor nicht mehr innerhalb des Eingabefeldes verschieben: */
function handleSelectionChange() {
	const activeElement = document.activeElement;

	/* Falls Fokus nicht auf Inputelement liegt: */
	if (!(activeElement instanceof HTMLInputElement)) return;

	let pos = activeElement.value.indexOf(' ');
	/* Falls kein Leerzeichen vorhanden sein sollte */
	if (pos === -1) return;

	if (activeElement.selectionStart !== pos)
		positionCursor(pos, activeElement);
}

/* Abgleichen ob der Wert des Inputfeldes dem Wert des formattierten Input entspricht, wenn nicht, neu rendern: */
function handleInputChange(e) {
	const input = e.currentTarget;
	let expectedValue = getFormattedInput(input);

	if (input.value !== expectedValue) {
		renderInput(input);
	}
}

/* Tiprechner Funktionalität */
function calcTip(tip = 0) {
	const paddedDigits = digits.padStart(3, '0');

	const cents = paddedDigits.slice(-2);
	const euro = paddedDigits.slice(0, -2);

	let billNum = Number(`${euro}.${cents}`);
	let tipNum = Number(tip);

	const tipCalc = billNum * (tipNum / 100);
	const total = tipCalc + billNum;

	billResult.innerText = getFormattedInput(inputfieldBill);
	tipResult.innerText = `${tipCalc.toFixed(2).replace('.', ',')} €`;
	totalResult.innerText = `${total.toFixed(2).replace('.', ',')} €`;
}

/* Modal window Functions */
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
	inputfieldBill.focus();
	setModalState(false);
}

/* Functionalität aller anderen Buttons */
function handleFormClick(e) {
	const clicked = e.target.closest('.btn');

	if (!clicked) return;

	/* Prozentbuttons dynamisch ansprechen über dataset: */
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
			calcTip(percent);
			setModalState(false);
			break;

		case 'cancel':
			inputfieldTip.value = `0 %`;
			percent = '0';
			setModalState(false);
			break;

		case 'reset':
			[billResult, tipResult, totalResult].forEach(
				(el) => (el.innerText = `0,00 €`)
			);
			inputfieldTip.value = `0 %`;
			percent = '0';
			digits = '0';
			percent = '0';
			inputfieldBill.focus();
			break;
	}
}

function init() {
	if (!form || !overlay || !modal || !inputfieldBill || !inputfieldTip)
		return;

	/* Cursorposition initialisieren: */
	inputfieldBill.focus();
	let pos = inputfieldBill.value.indexOf(' ');
	positionCursor(pos, inputfieldBill);

	/* Weitere Event Listener initialisieren */
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
