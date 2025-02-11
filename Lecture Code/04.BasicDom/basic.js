const label = document.createElement('label');
const input = document.createElement('input');
const message = document.createElement('h2');

label.textContent = 'Name: ';
input.setAttribute('type', "text");
message.textContent = 'Hello !';

document.body.appendChild(label);
document.body.appendChild(input);
document.body.appendChild(message);

function handleInput(event) {
  message.textContent = `Hello ${event.target.value}!`;
}

input.addEventListener('input', handleInput);
