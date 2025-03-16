'use strict';

const message = document.getElementById('message');
const inputBill = document.getElementById('bill');
const inputTip = document.getElementById('tip');
const footer = document.getElementById('footer');

let bill, tip, billValid, tipValid;

const styleBorder = function (element, style) {
	document.getElementById(element).style.border = style;
};

const setMessage = function (msg) {
	message.innerHTML = msg;
};

const resetInput = function (element) {
	document.getElementById(element).value = '';
};

const removeHidden = function () {
	message.classList.remove('hidden');
};

// Remove red border error styling as soon as user puts in correctly formatted input
inputBill.addEventListener('keyup', function (e) {
	if (/^\d+([.,]\d{1,2})?$/.test(e.target.value)) {
		styleBorder('bill', 'none');
		billValid = true;
	}
});

inputTip.addEventListener('keyup', function (e) {
	if (/^\d+([.,]\d{1,2})?$/.test(e.target.value)) {
		styleBorder('tip', 'none');
		billValid = true;
	}
});

document.getElementById('calc-button').addEventListener('click', function () {
	let bill = document.getElementById('bill').value;
	let tip = document.getElementById('tip').value;

	// Input sanitization
	let billValid = true;
	let tipValid = true;

	if (bill === '' || tip === '') {
		return;
	}

	if (!/^\d+([.,]\d{1,2})?$/.test(bill)) {
		styleBorder('bill', '2px solid red');
		billValid = false;
	}
	if (!/^\d+$/.test(tip)) {
		styleBorder('tip', '2px solid red');
		tipValid = false;
	}

	if (!billValid || !tipValid) {
		removeHidden();

		setMessage(`Invalid input. Make sure your input is formatted correctly:<br>
        <b>Bill input:</b> e.g. '10.00' or '10'<br>
        <b>Tip input:</b> e.g. '10'`);

		return;
	}

	// Replace commas with points, so that tipCalc can compute the value
	bill = bill.replace(',', '.');

	// Turn the strings into numbers
	bill = Number(bill);
	tip = Number(tip);

	// Calculate tip
	const tipCalc = bill * (tip / 100);
	const total = tipCalc + bill;

	// Make the <p> element visible
	removeHidden();

	// Remove red border from input field in case they are still visible from previous error handling
	styleBorder('bill', '1px solid lightgray');
	styleBorder('tip', '1px solid lightgray');

	// Add the result of the calculations as text
	setMessage(
		`You want to give a tip of ${tip}%.
        <br> YOUR BILL: ${bill.toFixed(2)} 
        <br>💝 YOUR TIP: ${tipCalc.toFixed(2)}
        <br>💸 YOUR TOTAL: ${total.toFixed(2)}`
	);

	// Reset the input fields
	resetInput('bill');
	resetInput('tip');
});
