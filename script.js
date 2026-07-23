'use strict';
//TODO:
/*
- Pfeiltasten in Keydown einbauen ODER stumm schlucken (aktuell wird ein Error ausgelöst)
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

function assertInputIsNumber(input) {
	return /^\d+$/.test(input);
}

/* TODO Überlegen ob ich das noch einbaue: */
/* function getCursorPosition() {
	return inputfieldBill.value.indexOf(' ');
} */

function positionCursor(pos) {
	requestAnimationFrame(() => {
		inputfieldBill.setSelectionRange(pos, pos);
	});
}

function getFormattedInput(el) {
	if (el === 'bill') {
		let paddedDigits = digits.padStart(3, '0');

		return `${paddedDigits.slice(
			0,
			paddedDigits.length - 2
		)},${paddedDigits.slice(paddedDigits.length - 2)} €`;
	} else if (el === 'tip') {
		return `${percent} %`;
	}
}

function renderInput(el) {
	let formattedInput = getFormattedInput(el);

	if (el === 'bill') {
		inputfieldBill.value = formattedInput;
	} else if (el === 'tip') {
		inputfieldTip.value = formattedInput;
	}

	/* Und hier um die Cursorposition dynamisch am Leerzeichen zu aktualisieren. So kann man später z.B. das € Zeichen in EUR ändern, oder . für die Tausenderstellen einfügen und das hat dann keinen Einfluss auf de Berechnung der Cursorposition: */
	let posDynamic = formattedInput.indexOf(' ');
	positionCursor(posDynamic);
}

function handleDeleteContentBackward(el) {
	return el.slice(0, -1) || '0';
}

function handleBeforeInputEvent(e) {
	inputfieldBill.classList.remove('error');

	if (e.inputType === 'deleteContentBackward') {
		e.preventDefault();

		if (e.srcElement.id === 'bill-input') {
			digits = handleDeleteContentBackward(digits);
			renderInput('bill');
		}
		if (e.srcElement.id === 'custom-tip-input') {
			percent = handleDeleteContentBackward(percent);
			renderInput('tip');
		}
		return;
	}

	if (e.inputType == 'insertText') {
		e.preventDefault();

		if (e.srcElement.id === 'bill-input') {
			if (digits.length > 5) return;

			if (!assertInputIsNumber(e.data)) {
				inputfieldBill.classList.add('error');
				return;
			}

			digits += e.data;

			/* Convert to Number, to get rid of leading zeros, then back to string */
			digits = (+digits).toString();
			renderInput('bill');
		}
		if (e.srcElement.id === 'custom-tip-input') {
			if (percent.length > 2) return;

			if (!assertInputIsNumber(e.data)) {
				inputfieldTip.classList.add('error');
				return;
			}

			percent += e.data;

			percent = (+percent).toString();
			renderInput('tip');
		}

		return;
	}
}

/* Das gehört in die Focustrap */
/* if (inputfieldTip.classList.contains('modal-open')) {
	inputfieldTip.focus();
	pos = inputfieldTip.value.indexOf(' ');
	positionCursor(pos);
} */

/* User kann den Cursor nicht mehr innerhalb des Eingabefeldes verschieben: */
function handleSelectionChange() {
	/* if (document.activeElement !== inputfieldBill) return; */
	let pos;

	if (
		inputfieldBill.selectionStart !== pos &&
		document.activeElement === inputfieldBill
	) {
		pos = inputfieldBill.value.indexOf(' ');
		inputfieldBill.setSelectionRange(pos, pos);
	}
	if (
		inputfieldTip.selectionStart !== pos &&
		document.activeElement === inputfieldTip
	) {
		pos = inputfieldTip.value.indexOf(' ');
		inputfieldTip.setSelectionRange(pos, pos);
	}
}

/* Abgleichen ob der Wert des Inputfeldes dem Wert des formatierten Input netspricht, wenn nicht, neu rendern: */
/* TODO Noch für Custom prozentfeld fixen */
function handleInputChange() {
	const expectedValue = getFormattedInput();

	if (inputfieldBill.value !== expectedValue) {
		renderInput();
	}
}

function calcTip(tip = 0) {
	const paddedDigits = digits.padStart(3, '0');

	const cents = paddedDigits.slice(paddedDigits.length - 2);
	const euro = paddedDigits.slice(0, paddedDigits.length - 2);

	let billNum = Number(`${euro}.${cents}`);
	let tipNum = Number(tip);

	const tipCalc = billNum * (tipNum / 100);
	const total = tipCalc + billNum;

	/* TODO billResult als 12.00 anzeigen wenn keine Cent angegeben sind */
	billResult.innerText = `${billNum} €`;
	tipResult.innerText = `${tipCalc.toFixed(2)} €`;
	totalResult.innerText = `${total.toFixed(2)} €`;
}

function init() {
	if (!form || !overlay || !modal || !inputfieldBill || !inputfieldTip)
		return;

	/* Cursorposition initialisieren: */
	inputfieldBill.focus();
	let pos = inputfieldBill.value.indexOf(' ');
	positionCursor(pos);

	/* Event Listener initialisieren */
	inputfieldBill.addEventListener('beforeinput', handleBeforeInputEvent);
	inputfieldBill.addEventListener('input', handleInputChange);
	inputfieldTip.addEventListener('beforeinput', handleBeforeInputEvent);
	inputfieldTip.addEventListener('input', handleInputChange);
	document.addEventListener('selectionchange', handleSelectionChange);

	form.addEventListener('click', function (e) {
		const clicked = e.target.closest('.btn');

		if (!clicked) return;

		/* Prozentbuttons aus dem switch-statement rausnehmen und einfach prüfen ob ein dataset-Attribut vorhanden ist. Das skaliert besser, weil wir so beliebig viele Buttons hinzufügen können ohne mehr cases hinzufügen zu müssen: */
		if (clicked.dataset.tip) {
			calcTip(clicked.dataset.tip);
			return;
		}

		switch (clicked.id) {
			case 'custom':
				overlay.classList.add('modal-open');
				modal.classList.add('modal-open');
				break;

			case 'apply':
				calcTip(percent);
				overlay.classList.remove('modal-open');
				modal.classList.remove('modal-open');
				break;

			case 'cancel':
				overlay.classList.remove('modal-open');
				modal.classList.remove('modal-open');

			case 'reset':
				billResult.innerText = `0,00 €`;
				tipResult.innerText = `0,00 €`;
				totalResult.innerText = `0,00 €`;
				break;
		}
	});
}

init();
