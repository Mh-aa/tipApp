'use strict';
//TODO:
// -Fix the logic in the calc button so that it calculates the bill together with the custom tip
// Add Custom tip button that reveals the input field, the calc-button and a cancel button! It should also hide the three default buttons
//Add a cancel button that cancels the custom tip calculation, hides the input field and calc-button and shows the three default buttons again
//Implement the fixed comma sign
const message = document.getElementById('message');
const inputBill = document.getElementById('bill');
const inputTip = document.getElementById('tip');
const footer = document.getElementById('footer');
//ATTENTION: ADDED THESE
const btn5Percent = document.getElementById('5');
const btn7Percent = document.getElementById('7');
const btn10Percent = document.getElementById('10');
////////////////////////////////////////////////////////
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

//ATTENTION: Moved the tippCalc function out of the calculate button and into a separate function. Had to remove the tip logic here because that one is additional and I still need to figure it out
const calcTipp = function (tipVal) {
	let bill = document.getElementById('bill').value;

	// Input sanitization
	let billValid = true;

	if (bill === '') return;

	if (!/^\d+([.,]\d{1,2})?$/.test(bill)) {
		styleBorder('bill', '2px solid red');
		billValid = false;
	}
	if (!billValid) {
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

	// Calculate tip
	const tipCalc = bill * (tipVal / 100);
	const total = tipCalc + bill;

	// Make the <p> element visible
	removeHidden();

	// Remove red border from input field in case they are still visible from previous error handling
	styleBorder('bill', '1px solid lightgray');

	// Add the result of the calculations as text
	setMessage(
		`You want to give a tip of ${tipVal}%.
        <br> YOUR BILL: ${bill.toFixed(2)} 
        <br>💝 YOUR TIP: ${tipCalc.toFixed(2)}
        <br>💸 YOUR TOTAL: ${total.toFixed(2)}`
	);
};

//ATTENTION:Added the three default tip value buttons!
for (let btn of [btn5Percent, btn7Percent, btn10Percent]) {
	btn.addEventListener('click', function (e) {
		calcTipp(Number(e.target.id));
	});
}
//////////////////////////////////////////////

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
	// // Input sanitization
	// let billValid = true;
	// let tipValid = true;
	// if (bill === '' || tip === '') {
	// 	return;
	// }
	// if (!/^\d+([.,]\d{1,2})?$/.test(bill)) {
	// 	styleBorder('bill', '2px solid red');
	// 	billValid = false;
	// }
	// if (!/^\d+$/.test(tip)) {
	// 	styleBorder('tip', '2px solid red');
	// 	tipValid = false;
	// }
	// if (!billValid || !tipValid) {
	// 	removeHidden();
	// 	setMessage(`Invalid input. Make sure your input is formatted correctly:<br>
	//     <b>Bill input:</b> e.g. '10.00' or '10'<br>
	//     <b>Tip input:</b> e.g. '10'`);
	// 	return;
	// }
	// // Replace commas with points, so that tipCalc can compute the value
	// bill = bill.replace(',', '.');
	// // Turn the strings into numbers
	// bill = Number(bill);
	// tip = Number(tip);
	// // Calculate tip
	// const tipCalc = bill * (tip / 100);
	// const total = tipCalc + bill;
	// // Make the <p> element visible
	// removeHidden();
	// // Remove red border from input field in case they are still visible from previous error handling
	// styleBorder('bill', '1px solid lightgray');
	// styleBorder('tip', '1px solid lightgray');
	// // Add the result of the calculations as text
	// setMessage(
	// 	`You want to give a tip of ${tip}%.
	//     <br> YOUR BILL: ${bill.toFixed(2)}
	//     <br>💝 YOUR TIP: ${tipCalc.toFixed(2)}
	//     <br>💸 YOUR TOTAL: ${total.toFixed(2)}`
	// );
	// Reset the input fields
	// resetInput('bill');
	// resetInput('tip');
});
