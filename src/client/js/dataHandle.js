import { handleSubmit } from "./app.js";

// self-invoking function
const handleInput = (() => {
    const buttonForm = document.getElementById('myButton');
    // add event listener on click the button
    buttonForm.addEventListener('click', event => handleSubmit(event));
    console.error();
})();

export { handleInput, handleSubmit }