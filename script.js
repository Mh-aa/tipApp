'use strict';
//TODO:
// Implement the fixed comma sign
// implement translation logic
const message = document.getElementById('message');
const inputBill = document.getElementById('bill');
const inputTip = document.getElementById('tip');

const btn5Percent = document.getElementById('5');
const btn7Percent = document.getElementById('7');
const btn10Percent = document.getElementById('10');
const customBtn = document.getElementById('custom');
const calcBtn = document.getElementById('calc-button');
const cancelBtn = document.getElementById('cancel-button');
const resetBtn = document.getElementById('reset');
const labelCustom = document.getElementById('label__custom');

let billValid, tipValid;

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

const sanitizeInput = function (bill, tip) {
	billValid = true;
	tipValid = true;

	if (bill === '' || tip === '') {
		return false;
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
		return false;
	}
	return true;
};

const instantSanitizeInput = function (inputField, inputEvent) {
	if (/^\d+([.,]\d{1,2})?$/.test(inputEvent)) {
		styleBorder(inputField, 'none');
		message.classList.add('hidden');
	}
	if (/^\d+([.,]\d{1,2})?$/.test(inputEvent)) {
		styleBorder(inputField, 'none');
		message.classList.add('hidden');
	}
};

const toggleVisibility = function () {
	for (let element of [labelCustom, inputTip, calcBtn, cancelBtn]) {
		element.classList.toggle('hidden');
	}

	for (let element of [
		customBtn,
		btn5Percent,
		btn7Percent,
		btn10Percent,
		resetBtn,
	]) {
		element.classList.toggle('hidden');
	}
};

const calcTipp = function (tip) {
	let bill = document.getElementById('bill').value;

	if (!sanitizeInput(bill, tip)) return;

	bill = bill.replace(',', '.');
	bill = Number(bill);
	tip = Number(tip);

	const tipCalc = bill * (tip / 100);
	const total = tipCalc + bill;

	// Make the <p> element visible
	removeHidden();

	// Remove red border from input field in case they are still visible from previous error handling:
	styleBorder('bill', '1px solid lightgray');

	setMessage(
		`You want to give a tip of ${tip}%.
        <br> YOUR BILL: ${bill.toFixed(2)} 
        <br>💝 YOUR TIP: ${tipCalc.toFixed(2)}
        <br>💸 YOUR TOTAL: ${total.toFixed(2)}`
	);
	return [bill, tip, total];
};

for (let btn of [btn5Percent, btn7Percent, btn10Percent]) {
	btn.addEventListener('click', function (e) {
		calcTipp(Number(e.target.id));
	});
}

// CustomBTN functionalty:
// Shows: custom tip input field, calculate button, cancel button
// Hides: three default buttons, custom button, reset button
customBtn.addEventListener('click', function () {
	toggleVisibility();
});

// CancelBtn functionalty:
// Shows: three default buttons, custom button, reset button
// Hides: custom tip input field, calculate button, cancel button
cancelBtn.addEventListener('click', function () {
	toggleVisibility();
	resetInput('tip');
});

resetBtn.addEventListener('click', function () {
	resetInput('bill');
	resetInput('tip');
	message.classList.add('hidden');
});

// Remove red border error styling as soon as user puts in correctly formatted input:
inputBill.addEventListener('keyup', function (e) {
	instantSanitizeInput('bill', e.target.value);
});

inputTip.addEventListener('keyup', function (e) {
	instantSanitizeInput('tip', e.target.value);
});
/////////////////////////////////////////////////////////

calcBtn.addEventListener('click', function () {
	let bill = document.getElementById('bill').value;
	let tip = document.getElementById('tip').value;

	if (!sanitizeInput(bill, tip)) return;

	const [billNum, tipNum, total] = calcTipp(bill, tip);

	setMessage(
		`You want to give a tip of ${tip}%.
	    <br> YOUR BILL: ${billNum.toFixed(2)}
	    <br>💝 YOUR TIP: ${tipNum.toFixed(2)}
	    <br>💸 YOUR TOTAL: ${total.toFixed(2)}`
	);
});
