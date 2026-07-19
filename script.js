'use strict';
//TODO:
// Implement the fixed comma sign
// implement translation logic

const form = document.querySelector('form');
const overlay = document.querySelector('.overlay');
const modal = document.querySelector('.modal-input');
const inputfieldBill = document.getElementById('bill-input');
let billVal = inputfieldBill.value;

let billValid, tipValid;

/* function validateInput(bill, tip) {
	billValid = true;
	tipValid = true;

	if (bill === '' || tip === '') {
		return false;
	}
	if (!/^\d+([.,]\d{1,2})?$/.test(bill)) {
		// styleBorder('bill', '2px solid red');
		billValid = false;
	}
	if (!/^\d+$/.test(tip)) {
		// styleBorder('tip', '2px solid red');
		tipValid = false;
	}

	if (!billValid || !tipValid) {
		console.log('Calculated');
		return false;
	}
	return true;
} */

/* const instantValidateInput = function (inputEvent) {
	if (!/^\d+([.,]\d{1,2})?$/.test(inputEvent)) {
		inputfieldBill.classList.add('error');
		return false;
	}
	return true;
}; */

function inputFormatter() {
	let billValLength = billVal.length;
	inputfieldBill.focus();

	inputfieldBill.setSelectionRange(billValLength, billValLength - 2);

	let digits = '';

	function renderInput(digits) {
		const paddedDigits = digits.padStart(3, '0');

		inputfieldBill.value = `${paddedDigits.slice(
			0,
			paddedDigits.length - 2
		)},${paddedDigits.slice(paddedDigits.length - 2)} €`;
	}

	inputfieldBill.addEventListener('keydown', function (e) {
		e.preventDefault();
		inputfieldBill.classList.remove('error');

		if (e.key === 'Backspace') {
			e.preventDefault();

			const value = inputfieldBill.value.replace(/[^\d]/g, '');
			const newValue = value.slice(0, -1);

			digits = newValue;
			renderInput(newValue);
			return;
		}

		if (!/^\d+([.,]\d{1,2})?$/.test(e.key)) {
			inputfieldBill.classList.add('error');
			return;
		}

		digits += e.key;

		/* Convert to Number, to get rid of leading zeros, then back to string */
		digits = (+digits).toString();
		renderInput(digits);
	});
}

function calcTip(tip) {
	/* if (!validateInput(billVal, tip)) return; */

	billVal = billVal.replace(',', '.');
	let cleanedBillVal = billVal.slice(0, billVal.length - 2);

	let billNum = +cleanedBillVal;
	let tipNum = +tip;

	const tipCalc = billNum * (tipNum / 100);
	const total = tipCalc + billNum;

	console.log(total);
}

function init() {
	inputFormatter();
	if (!form) return;

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

	/* const styleBorder = function (element, style) {
		document.getElementById(element).style.border = style;
	}; */

	/* const setMessage = function (msg) {
		message.innerHTML = msg;
	}; */

	/* 	const resetInput = function (element) {
		document.getElementById(element).value = '';
	}; */

	/* const removeHidden = function () {
		message.classList.remove('hidden');
	}; */

	// Remove red border error styling as soon as user puts in correctly formatted input:
	/* inputBill.addEventListener('keyup', function (e) {
		instantValidateInput('bill', e.target.value);
	});

	inputTip.addEventListener('keyup', function (e) {
		instantValidateInput('tip', e.target.value);
	}); */
}

init();

/* TODO: 
- Case: Input must be REQUIRED, Fehlermeldung wenn keiner da ist (klein unter dem Feld?)
- Zahlen im Paper darstellen
- Implement Input Validation like PayPal */

/* 
Das ist ein gutes Projekt, weil dabei mehrere interessante Konzepte zusammenkommen: Events, String-Manipulation, Formatierung und Cursor-Steuerung.

Ich würde das Problem in mehrere kleine Schritte zerlegen, statt sofort an den kompletten Code zu denken.

1. Das Inputfeld speichert nicht den angezeigten Wert

Der wichtigste Gedanke ist:

Der Benutzer sieht 0,00 €.
Intern arbeitest du aber nicht mit Kommazahlen, sondern mit einer Ganzzahl in Cent.

Beispielsweise:

Anzeige	Interner Wert
0,00 €	0
0,01 €	1
0,15 €	15
1,50 €	150
12,34 €	1234

Dadurch vermeidest du Rundungsfehler von JavaScript-Zahlen.

2. Bei jedem Tastendruck reagierst du auf das input-Event

Statt den Text einfach vom Browser verändern zu lassen, kannst du nach jedem input den Inhalt selbst neu berechnen.

Der Ablauf könnte sein:

User tippt
      ↓
input-Event
      ↓
Wert auslesen
      ↓
In Cent umwandeln
      ↓
Neu formatieren
      ↓
Inputfeld überschreiben
3. Nur Ziffern interessieren dich

Der Benutzer könnte theoretisch alles eingeben.

Deshalb:

Alle Nicht-Ziffern entfernen.
Nur die Zahlen behalten.

Beispiel:

"12,3a€"

↓

"123"

Dafür gibt es in JavaScript mehrere Möglichkeiten (Reguläre Ausdrücke sind hier praktisch).

4. Die letzten beiden Stellen sind immer Cent

Das ist genau das Verhalten von PayPal.

Beispiel:

1
→ 0,01 €

12
→ 0,12 €

123
→ 1,23 €

1234
→ 12,34 €

12345
→ 123,45 €

Man kann sich das wie einen Zahlenstrom vorstellen:

12345

         ↑↑
      immer Cent

Die letzten beiden Zeichen bilden immer den Cent-Betrag.

5. Euro- und Centteil trennen

Wenn dein String z.B.

12345

lautet,

dann ist

Euro = "123"
Cent = "45"

Falls weniger als zwei Stellen vorhanden sind, musst du entsprechend mit Nullen auffüllen.

Beispiele:

"1"

Euro = "0"
Cent = "01"
"9"

Euro = "0"
Cent = "09"
6. Alles wieder zusammensetzen

Aus

Euro = "123"
Cent = "45"

wird

123,45 €
7. Cursor immer ans Ende setzen

Da du den kompletten Inhalt des Inputs nach jedem Tastendruck neu schreibst, springt der Cursor manchmal an eine unerwartete Position.

Deshalb setzt man ihn anschließend wieder ans Ende.

Dafür gibt es Methoden, mit denen man die Cursorposition (selectionStart/selectionEnd) steuern kann.

Sonderfälle überlegen

Bevor du programmierst, lohnt es sich, diese Fälle aufzuschreiben:

Was passiert bei Backspace?
Darf der Benutzer Komma oder Punkt eingeben?
Was passiert bei Copy & Paste?
Was passiert, wenn jemand Buchstaben eingibt?
Darf der Wert negativ werden?
Gibt es ein Maximum?

Wenn deine Logik auf dem Cent-String basiert, werden viele dieser Fälle automatisch einfacher.

Eine mögliche Denkweise

Statt den Text im Input zu verändern, stell dir vor, du verwaltest intern einfach diese Zahl:

0

User tippt:

1

Intern:

1

Anzeige:

0,01 €

User tippt:

2

Intern:

12

Anzeige:

0,12 €

User tippt:

3

Intern:

123

Anzeige:

1,23 €

So arbeitest du immer nur mit einer Ganzzahl in Cent und leitest daraus die Darstellung ab. Das ist deutlich robuster, als zu versuchen, den bereits formatierten Text (12,34 €) direkt zu bearbeiten.

Wenn du diese Anleitung umgesetzt hast und an einer bestimmten Stelle festhängst (z. B. beim Trennen von Euro- und Centteil oder beim Cursorverhalten), können wir genau diesen Schritt gemeinsam durchgehen, ohne die komplette Lösung vorwegzunehmen. */
