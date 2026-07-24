'use strict';
//TODO:
/*
- Copy/Paste Event handlen */

const form = document.querySelector('form');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal-input');
const inputfieldBill = document.getElementById('bill-input');
const inputfieldTip = document.getElementById('custom-tip-input');
const billResult = document.getElementById('bill-result');
const tipResult = document.getElementById('tip-result');
const totalResult = document.getElementById('total-result');
let digits = '0';
let percent = '';

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

	if (el.id === 'bill-input') {
		inputfieldBill.value = formattedInput;
	} else if (el.id === 'custom-tip-input') {
		inputfieldTip.value = formattedInput;
	}
	/* Dynamische Cursorpositionierung am Leerzeichen: */
	let posDynamic = formattedInput.indexOf(' ');
	positionCursor(posDynamic, el);
}

function handleDeleteContentBackward(el) {
	return el.slice(0, -1) || '0';
}

/* Event Listener Functions */
function handleBeforeInputEvent(e) {
	inputfieldBill.classList.remove('error');

	if (e.inputType === 'deleteContentBackward') {
		e.preventDefault();

		if (e.srcElement.id === 'bill-input') {
			digits = handleDeleteContentBackward(digits);
			renderInput(e.srcElement);
		}
		if (e.srcElement.id === 'custom-tip-input') {
			percent = handleDeleteContentBackward(percent);
			renderInput(e.srcElement);
		}
		return;
	}

	if (e.inputType == 'insertText') {
		e.preventDefault();

		/* TODO: Das hier noch umbauen und straffen */
		if (e.srcElement.id === 'bill-input') {
			if (digits.length > 5) return;

			if (!assertInputIsNumber(e.data)) {
				inputfieldBill.classList.add('error');
				return;
			}

			digits += e.data;

			/* Convert to Number, to get rid of leading zeros, then back to string */
			digits = (+digits).toString();
			renderInput(e.srcElement);
		}
		if (e.srcElement.id === 'custom-tip-input') {
			if (percent.length > 2) return;

			if (!assertInputIsNumber(e.data)) {
				inputfieldTip.classList.add('error');
				return;
			}

			percent += e.data;

			percent = (+percent).toString();
			renderInput(e.srcElement);
		}

		return;
	}
}

/* User kann den Cursor nicht mehr innerhalb des Eingabefeldes verschieben: */
function handleSelectionChange() {
	const activeElement = document.activeElement;

	/* Wenn Fokus nicht auf Inputelement liegt: */
	if (!(activeElement instanceof HTMLInputElement)) return;

	let pos = activeElement.value.indexOf(' ');
	/* Falls kein Leerzeichen vorhanden sein sollte */
	if (pos === -1) return;

	if (activeElement.selectionStart !== pos)
		positionCursor(pos, activeElement);
}

/* Abgleichen ob der Wert des Inputfeldes dem Wert des formatierten Input netspricht, wenn nicht, neu rendern: */
function handleInputChange(e) {
	let expectedValue = '';

	if (e.currentTarget.id === 'bill-input') {
		expectedValue = getFormattedInput(e.currentTarget);

		if (inputfieldBill.value !== expectedValue) {
			renderInput(e.currentTarget);
		}
	} else if (e.currentTarget.id === 'custom-tip-input') {
		expectedValue = getFormattedInput(e.currentTarget);

		if (inputfieldTip.value !== expectedValue) {
			renderInput(e.currentTarget);
		}
	}
}

function calcTip(tip = 0) {
	const paddedDigits = digits.padStart(3, '0');

	const cents = paddedDigits.slice(-2);
	const euro = paddedDigits.slice(0, -2);

	let billNum = Number(`${euro}.${cents}`);
	let tipNum = Number(tip);

	const tipCalc = billNum * (tipNum / 100);
	const total = tipCalc + billNum;

	billResult.innerText = getFormattedInput(inputfieldBill);
	tipResult.innerText = `${tipCalc.toFixed(2)} €`;
	totalResult.innerText = `${total.toFixed(2)} €`;
}

/* TODO: Focustrap bauen */
/* Das gehört in die Focustrap */
/* if (inputfieldTip.classList.contains('modal-open')) {
	inputfieldTip.focus();
	pos = inputfieldTip.value.indexOf(' ');
	positionCursor(pos);
} */

/* function focusTrap(e) {}

function setModalState(state) {
	let isOpened = state;

	overlay.classList.add('modal-open');
	modal.classList.add('modal-open');

	if (isOpened) {
		document.addEventListener('keydown', focusTrap);
	} else {
		document.removeEventListener('keydown', focusTrap);
	}
} */

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
			/* setModalState(true); */
			overlay.classList.add('modal-open');
			modal.classList.add('modal-open');
			break;

		case 'apply':
			calcTip(percent);
			overlay.classList.remove('modal-open');
			modal.classList.remove('modal-open');
			break;

		case 'cancel':
			/* setModalState(false); */
			overlay.classList.remove('modal-open');
			modal.classList.remove('modal-open');
			break;

		case 'reset':
			[billResult, tipResult, totalResult].forEach(
				(el) => (el.innerText = `0,00 €`)
			);
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
	});

	document.addEventListener('selectionchange', handleSelectionChange);

	form.addEventListener('click', handleFormClick);
}

init();
