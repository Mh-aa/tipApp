'use strict';
//TODO:
/* - Input-Event einbauen zum überprüfen am Ende
- Pfeiltasten in Keydown einbauen ODER stumm schlucken (aktuell wird ein Error ausgelöst)
- Copy/Paste Event handlen
- Eigener Prozentsatz-Input bauen */

const form = document.querySelector('form');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal-input');
const inputfieldBill = document.getElementById('bill-input');
let digits = '0';

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

function getFormattedBillInput() {
	let paddedDigits = digits.padStart(3, '0');

	return `${paddedDigits.slice(
		0,
		paddedDigits.length - 2
	)},${paddedDigits.slice(paddedDigits.length - 2)} €`;
}

function renderBillInput() {
	const formattedInput = getFormattedBillInput();

	inputfieldBill.value = formattedInput;

	/* Und hier um die Cursorposition dynamisch am Leerzeichen zu aktualisieren. So kann man später z.B. das € Zeichen in EUR ändern, oder . für die Tausenderstellen einfügen und das hat dann keinen Einfluss auf de Berechnung der Cursorposition: */
	let posDynamic = formattedInput.indexOf(' ');
	positionCursor(posDynamic);
}

/* keydown
  |
  └── normale Tasten
      - Ziffern
      - Backspace
      - Delete (später)
      - Pfeiltasten (später)


paste
  |
  └── eingefügten Text auslesen
      - prüfen
      - bereinigen
      - in digits übernehmen
      - rendern


input
  |
  └── letzte Kontrolle
      - falls etwas durchgerutscht ist
      - Zustand wieder herstellen 
	  
	 init()
 |
 ├── keydown → handleBillKeydown()
 |
 ├── paste   → handleBillPaste()
 |
 └── input   → validateBillInput() */

function handleBillBeforeInputEvent(e) {
	inputfieldBill.classList.remove('error');

	if (e.inputType === 'deleteContentBackward') {
		e.preventDefault();

		const newValue = digits.slice(0, -1) || '0';
		digits = newValue;

		renderBillInput();

		return;
	}

	if (e.inputType == 'insertText') {
		e.preventDefault();

		if (digits.length > 9) return;

		if (!assertInputIsNumber(e.data)) {
			inputfieldBill.classList.add('error');
			return;
		}

		digits += e.data;

		/* Convert to Number, to get rid of leading zeros, then back to string */
		digits = (+digits).toString();
		renderBillInput();

		return;
	}
}
/* TODO EventListener in init() initialisieren */
/* Mobile Bug beheben, dass bei Backspace die letzte 0 gelöscht wird: */

/* User kann den Cursor nicht mehr innerhalb des Eingabefeldes verschieben: */
document.addEventListener('selectionchange', () => {
	if (document.activeElement !== inputfieldBill) return;

	const pos = inputfieldBill.value.indexOf(' ');

	if (inputfieldBill.selectionStart !== pos) {
		inputfieldBill.setSelectionRange(pos, pos);
	}
});

/* Abgleichen ob der Wert des Inputfeldes dem Wert des formatierten Input netspricht, wenn nicht, neu rendern: */
inputfieldBill.addEventListener('input', () => {
	const expectedValue = getFormattedBillInput();

	if (inputfieldBill.value !== expectedValue) {
		renderBillInput();
	}
});

function calcTip(tip) {
	const paddedDigits = digits.padStart(3, '0');

	const cents = paddedDigits.slice(paddedDigits.length - 2);
	const euro = paddedDigits.slice(0, paddedDigits.length - 2);

	let billNum = Number(`${euro}.${cents}`);
	let tipNum = Number(tip);

	const tipCalc = billNum * (tipNum / 100);
	const total = tipCalc + billNum;

	console.log(`total: ${total}`);
}

function init() {
	/* Cursorposition initialisieren: */
	inputfieldBill.focus();
	let pos = inputfieldBill.value.indexOf(' ');
	positionCursor(pos);

	if (!form || !overlay || !modal || !inputfieldBill) return;

	/* Event Listener initialisieren */
	inputfieldBill.addEventListener('beforeinput', handleBillBeforeInputEvent);
	/* 	inputfieldBill.addEventListener('input', handleBillInputEvent);
	 */
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
				const customTip =
					document.getElementById('custom-tip-input').value;
				calcTip(customTip);
				break;

			case 'cancel':
				overlay.classList.remove('modal-open');
				modal.classList.remove('modal-open');

			case 'reset':
				break;
		}
	});
}

init();
