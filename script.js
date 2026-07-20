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

function assertInputIsNumber(input) {
	return /^\d+$/.test(input);
}

function positionCursor(pos) {
	inputfieldBill.setSelectionRange(pos, pos);
}

function renderBillInput(val) {
	let paddedDigits = val.padStart(3, '0');

	/* FormattedInput kann sich ändern, z.B. wenn ich Tausenderpunkte einführe, deswegen setzen wir es erst Mal als Variable: */
	let formattedInput = `${paddedDigits.slice(
		0,
		paddedDigits.length - 2
	)},${paddedDigits.slice(paddedDigits.length - 2)} €`;

	/* Nutzen es hier: */
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

inputfieldBill.addEventListener('input', (e) => {
	console.log('input:', inputfieldBill.value);
});

function handleBillInput(e) {
	e.preventDefault();

	inputfieldBill.classList.remove('error');

	if (e.key === 'Backspace') {
		const value = inputfieldBill.value.replace(/[^\d]/g, '');
		const newValue = value.slice(0, -1);

		digits = newValue;
		renderBillInput(newValue);

		return;
	}

	if (digits.length > 9) return;

	if (!assertInputIsNumber(e.key)) {
		inputfieldBill.classList.add('error');
		return;
	}

	digits += e.key;

	/* Convert to Number, to get rid of leading zeros, then back to string */
	digits = (+digits).toString();
	renderBillInput(digits);
}

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
	inputfieldBill.focus();
	/* Cursorposition ein Mal initialisieren: */
	let pos = inputfieldBill.value.indexOf(' ');
	positionCursor(pos);

	if (!form) return;

	inputfieldBill.addEventListener('keydown', handleBillInput);

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
