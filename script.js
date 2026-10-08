const display = document.getElementById("display");
const historyDisplay = document.getElementById("historyDisplay");
const memoryDisplay = document.getElementById("memoryDisplay");
const historyList = document.getElementById("historyList");

let expression = "";
let answer = 0;
let memory = 0;

let angleMode = "DEG";

let calculationHistory = [];


// ==========================================
// Utility
// ==========================================

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        throw new Error("Math Error");
    }

    return Number.parseFloat(number.toPrecision(12));
}


function getCurrentValue() {

    if (expression === "") {
        return answer;
    }

    return evaluateExpression(expression);
}


// ==========================================
// Mathematical functions
// ==========================================

function factorial(n) {

    if (!Number.isInteger(n) || n < 0) {
        throw new Error("Invalid factorial");
    }

    if (n > 170) {
        throw new Error("Number too large");
    }

    let result = 1;

    for (let i = 2; i <= n; i++) {
        result *= i;
    }

    return result;
}


function toRadians(value) {
    return value * Math.PI / 180;
}


function fromRadians(value) {

    if (angleMode === "DEG") {
        return value * 180 / Math.PI;
    }

    return value;
}


function sin(value) {

    return Math.sin(
        angleMode === "DEG"
            ? toRadians(value)
            : value
    );
}


function cos(value) {

    return Math.cos(
        angleMode === "DEG"
            ? toRadians(value)
            : value
    );
}


function tan(value) {

    return Math.tan(
        angleMode === "DEG"
            ? toRadians(value)
            : value
    );
}


function asin(value) {
    return fromRadians(Math.asin(value));
}


function acos(value) {
    return fromRadians(Math.acos(value));
}


function atan(value) {
    return fromRadians(Math.atan(value));
}


// ==========================================
// Expression evaluation
// ==========================================

function evaluateExpression(input) {

    let exp = input;

    exp = exp.replaceAll("×", "*");
    exp = exp.replaceAll("÷", "/");
    exp = exp.replaceAll("−", "-");

    // Percentage
    exp = exp.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );

    // Constants
    exp = exp.replaceAll("π", "Math.PI");

    exp = exp.replace(
        /\be\b/g,
        "Math.E"
    );

    // Validate characters
    if (!/^[0-9+\-*/().%\sA-Za-z_]+$/.test(exp)) {
        throw new Error("Invalid expression");
    }

    // Prevent dangerous JavaScript properties
    if (
        /constructor|prototype|__proto__|window|document/i.test(exp)
    ) {
        throw new Error("Invalid expression");
    }

    const result = Function(
        `"use strict"; return (${exp})`
    )();

    if (!Number.isFinite(result)) {
        throw new Error("Math Error");
    }

    return formatNumber(result);
}


// ==========================================
// Display
// ==========================================

function updateDisplay() {

    display.textContent =
        expression === ""
            ? answer
            : expression;
}


function addToExpression(value) {

    if (display.textContent === "Error") {
        expression = "";
    }

    expression += value;

    historyDisplay.textContent = expression;

    try {

        const result = evaluateExpression(expression);

        display.textContent = result;

    } catch {

        display.textContent = expression;
    }
}


// ==========================================
// Main calculation
// ==========================================

function calculate() {

    if (expression === "") {
        return;
    }

    try {

        const result =
            evaluateExpression(expression);

        answer = result;

        addHistory(
            expression,
            result
        );

        historyDisplay.textContent =
            expression + " =";

        display.textContent =
            result;

        expression = "";

    } catch (error) {

        display.textContent = "Error";

        historyDisplay.textContent =
            error.message;
    }
}


// ==========================================
// Scientific operations
// ==========================================

function scientificOperation(operation) {

    try {

        const value = getCurrentValue();

        let result;


        switch (operation) {

            case "sin":
                result = sin(value);
                break;

            case "cos":
                result = cos(value);
                break;

            case "tan":
                result = tan(value);
                break;

            case "asin":
                result = asin(value);
                break;

            case "acos":
                result = acos(value);
                break;

            case "atan":
                result = atan(value);
                break;

            case "sqrt":
                result = Math.sqrt(value);
                break;

            case "square":
                result = value ** 2;
                break;

            case "cube":
                result = value ** 3;
                break;

            case "log":
                result = Math.log10(value);
                break;

            case "ln":
                result = Math.log(value);
                break;

            case "exp":
                result = Math.exp(value);
                break;

            case "factorial":
                result = factorial(value);
                break;

            case "inverse":

                if (value === 0) {
                    throw new Error("Division by zero");
                }

                result = 1 / value;

                break;

            case "abs":
                result = Math.abs(value);
                break;

            default:
                return;
        }


        result = formatNumber(result);

        answer = result;

        expression = String(result);

        display.textContent = result;

        historyDisplay.textContent =
            operation + "(" + value + ")";

    } catch (error) {

        display.textContent = "Error";

        historyDisplay.textContent =
            error.message;
    }
}


// ==========================================
// Buttons
// ==========================================

document.querySelector(".buttons")
    .addEventListener("click", function (event) {

        const button =
            event.target.closest("button");

        if (!button) return;


        const value =
            button.dataset.value;

        const action =
            button.dataset.action;


        if (value !== undefined) {

            addToExpression(value);

            return;
        }


        switch (action) {

            case "clear":

                expression = "";

                answer = 0;

                display.textContent = "0";

                historyDisplay.textContent =
                    "Ready";

                break;


            case "backspace":

                expression =
                    expression.slice(0, -1);

                updateDisplay();

                break;


            case "calculate":

                calculate();

                break;


            case "sign":

                if (expression) {

                    if (expression.startsWith("-")) {

                        expression =
                            expression.substring(1);

                    } else {

                        expression =
                            "-" + expression;
                    }

                    updateDisplay();
                }

                break;


            case "ans":

                addToExpression(
                    String(answer)
                );

                break;


            case "memory-clear":

                memory = 0;

                updateMemory();

                break;


            case "memory-recall":

                addToExpression(
                    String(memory)
                );

                break;
        }
    });


// ==========================================
// Scientific buttons
// ==========================================

document.querySelector(".scientific-buttons")
    .addEventListener("click", function (event) {

        const button =
            event.target.closest("button");

        if (!button) return;

        const action =
            button.dataset.action;


        if (action === "pi") {

            addToExpression("π");

            return;
        }


        if (action === "e") {

            addToExpression("e");

            return;
        }


        if (action === "power") {

            addToExpression("^");

            return;
        }


        scientificOperation(action);
    });


// ==========================================
// Memory
// ==========================================

document.querySelector(".memory-buttons")
    .addEventListener("click", function (event) {

        const button =
            event.target.closest("button");

        if (!button) return;

        const action =
            button.dataset.action;

        try {

            const value =
                Number(display.textContent);


            if (action === "memory-add") {

                memory += value;

            }

            if (action === "memory-subtract") {

                memory -= value;

            }

            updateMemory();

        } catch {

            memoryDisplay.textContent =
                "Memory: Error";
        }
    });


function updateMemory() {

    memoryDisplay.textContent =
        "Memory: " + formatNumber(memory);
}


// ==========================================
// DEG / RAD
// ==========================================

const degBtn =
    document.getElementById("degBtn");

const radBtn =
    document.getElementById("radBtn");


degBtn.addEventListener("click", function () {

    angleMode = "DEG";

    degBtn.classList.add("active");

    radBtn.classList.remove("active");
});


radBtn.addEventListener("click", function () {

    angleMode = "RAD";

    radBtn.classList.add("active");

    degBtn.classList.remove("active");
});


// ==========================================
// History
// ==========================================

function addHistory(expressionValue, result) {

    calculationHistory.push({
        expression: expressionValue,
        result: result
    });


    if (calculationHistory.length > 20) {

        calculationHistory.shift();
    }


    renderHistory();
}


function renderHistory() {

    historyList.innerHTML = "";


    if (calculationHistory.length === 0) {

        historyList.innerHTML =
            '<p class="empty-history">No calculations yet</p>';

        return;
    }


    [...calculationHistory]
        .reverse()
        .forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "history-item";


            div.innerHTML = `
                <div class="history-expression">
                    ${escapeHTML(item.expression)}
                </div>

                <div class="history-result">
                    ${item.result}
                </div>
            `;


            div.addEventListener(
                "click",
                function () {

                    expression =
                        String(item.result);

                    display.textContent =
                        item.result;

                    historyDisplay.textContent =
                        item.expression;
                }
            );


            historyList.appendChild(div);
        });
}


function escapeHTML(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


document.getElementById("clearHistory")
    .addEventListener("click", function () {

        calculationHistory = [];

        renderHistory();
    });


// ==========================================
// Dark / Light Mode
// ==========================================

const themeBtn =
    document.getElementById("themeBtn");


themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("light");


    if (document.body.classList.contains("light")) {

        themeBtn.textContent = "🌙";

    } else {

        themeBtn.textContent = "☀";
    }
});


// ==========================================
// Keyboard support
// ==========================================

document.addEventListener("keydown", function (event) {

    const key = event.key;


    if (/^[0-9.]$/.test(key)) {

        addToExpression(key);

        return;
    }


    if (
        ["+", "-", "*", "/", "(", ")", "%"]
            .includes(key)
    ) {

        let value = key;

        if (key === "*") value = "×";

        if (key === "/") value = "÷";

        if (key === "-") value = "−";

        addToExpression(value);

        return;
    }


    if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();

        return;
    }


    if (key === "Backspace") {

        expression =
            expression.slice(0, -1);

        updateDisplay();

        return;
    }


    if (key === "Escape") {

        expression = "";

        display.textContent = "0";

        historyDisplay.textContent =
            "Ready";
    }

});