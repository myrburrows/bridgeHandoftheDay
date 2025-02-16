// Initialize variables
let data = [];
let currentQuestionIndex = 0;
let missedQuestions = [];
let reviewingMissedQuestions = false;
let reviewIndex = 0; // Separate index for reviewing missed questions

// Function to retrieve data file based on date
function retrieveDataFile(date) {
    const [month, day, year] = date.split('/');
    const yearMonth = `20${year}${month}`; // Assume 20XX for the year
    const fileName = `data/${yearMonth}/${yearMonth}${day}.txt`; // Path: data/YYYYMM/YYYYMMDD.txt

    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(`No data file found for the entered date: ${date}`);
            }
            return response.text();
        })
        .then(text => {
            if (!text.trim()) {
                throw new Error(`The data file for ${date} exists but is empty.`);
            }
            // Parse the text file into data objects
            data = text.split('\n').map(line => {
                const fields = line.split('\t');
                const [key, category, question, answer, image] = fields;
                return { key, category, question, answer, image: image ? image.trim() : null };
            });

            currentQuestionIndex = 0; // Reset index for new data
            missedQuestions = []; // Clear missed questions
            reviewingMissedQuestions = false; // Reset review mode
            document.getElementById('error-message').textContent = ''; // Clear any previous error
            displayQuestion(); // Start displaying questions after data loads
        })
        .catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('error-message').textContent = error.message; // Display error in reserved space
        });
}

// Display today's date in the input field as default
const today = new Date();
const smallerFormattedDate = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
document.getElementById('date-input').value = smallerFormattedDate;
retrieveDataFile(smallerFormattedDate); // Load data for today's date on app load

// Event listener for Enter key in the date input field
document.getElementById('date-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const enteredDate = document.getElementById('date-input').value.trim();

        // Validate the format first
        const datePattern = /^\d{2}\/\d{2}\/\d{2}$/;
        if (!datePattern.test(enteredDate)) {
            document.getElementById('error-message').textContent = 'Invalid date format. Use MM/DD/YY.';
            return;
        }

        // Parse and validate the actual date
        const [month, day, year] = enteredDate.split('/').map(Number);
        const parsedDate = new Date(`20${year}`, month - 1, day); // Create a Date object
        if (
            parsedDate.getFullYear() !== 2000 + year || // Ensure the year matches
            parsedDate.getMonth() !== month - 1 || // Ensure the month matches
            parsedDate.getDate() !== day // Ensure the day matches
        ) {
            document.getElementById('error-message').textContent = 'Invalid date. Please enter a real calendar date.';
            return;
        }

        // Clear error message and retrieve data
        document.getElementById('error-message').textContent = '';
        retrieveDataFile(enteredDate);
    }
});

// Display the current question, category, and image
function displayQuestion() {
    const currentQuestion = reviewingMissedQuestions ? missedQuestions[reviewIndex] : data[currentQuestionIndex];
    
    document.getElementById("title").textContent = "Roger That:  Bridge Hand of the Day";
    document.getElementById('category').textContent = currentQuestion.category;
    document.getElementById('question').textContent = `${currentQuestion.key}. ${currentQuestion.question}`;

    // Reset the Show Answer button text and styles
    const showAnswerButton = document.getElementById('show-answer');
    showAnswerButton.textContent = "Show Answer";
    showAnswerButton.disabled = false;
    showAnswerButton.style.backgroundColor = "#4caf50";
    showAnswerButton.style.color = "white";

    document.getElementById('answer').textContent = currentQuestion.answer;
    document.getElementById('answer').style.display = 'none'; // Hide answer initially

    // Handle the image display
    const imageElement = document.getElementById('flashcard-image');
    if (currentQuestion.image) {
        imageElement.src = `images/${currentQuestion.image}`; // Assuming images are in an "images" folder
        imageElement.style.display = "block"; // Show the image
    } else {
        imageElement.style.display = "none"; // Hide the image if no image is provided
    }

    // Show or hide buttons based on whether we are in review mode
    document.getElementById('response-buttons').style.display = reviewingMissedQuestions ? 'none' : 'block';
    document.getElementById('next-review').style.display = reviewingMissedQuestions ? 'block' : 'none';
    document.getElementById('review-button').style.display = 'none';
}

// Show the answer in the Show Answer button and change its style
function showAnswer() {
    const showAnswerButton = document.getElementById('show-answer');
    showAnswerButton.textContent = document.getElementById('answer').textContent; // Display answer in the button
    showAnswerButton.disabled = true; // Disable the button once the answer is shown
    showAnswerButton.style.backgroundColor = "white"; // Change to white background
    showAnswerButton.style.color = "black"; // Change text to black
}

// Record whether the answer was known or missed, then move to the next question
function recordAnswer(knewIt) {
    if (!knewIt) {
        missedQuestions.push(data[currentQuestionIndex]);
    }

    currentQuestionIndex++;

    // Check if we've finished the main set of questions
    if (currentQuestionIndex >= data.length) {
        if (missedQuestions.length > 0) {
            document.getElementById('review-button').style.display = 'block'; // Show the review button if there are missed questions
            document.getElementById('category').style.display = 'none'; // Hide question 25 and other elements
            document.getElementById('question').style.display = 'none';
            document.getElementById('response-buttons').style.display = 'none';
        } else {
            showExerciseDone(); // Call to display the Exercise Done box if no missed questions
        }
    } else {
        displayQuestion();
    }
}

// Navigate to the previous question
function goToLastQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--; // Move to the previous question
        displayQuestion(); // Update the display
    } else {
        console.log('Already at the first question.'); // Optional: Log if at the first question
    }
}

// Start reviewing missed questions
function startReview() {
    reviewingMissedQuestions = true;
    reviewIndex = 0; // Reset index to start at the first missed question
    document.getElementById('category').style.display = 'block';
    document.getElementById('question').style.display = 'block';
    document.getElementById('response-buttons').style.display = 'none';
    document.getElementById('next-review').style.display = 'block';
    document.getElementById('review-button').style.display = 'none'; // Hide the review button
    displayQuestion();
}

// Move to the next missed question in review mode
function nextReviewQuestion() {
    reviewIndex++;
    if (reviewIndex >= missedQuestions.length) {
        showExerciseDone(); // Call to show completion message with missed count
    } else {
        displayQuestion();
    }
}

// Display an "Exercise Done" box with the number of review questions
function showExerciseDone() {
    document.getElementById('next-review').style.display = 'none'; // Hide Next button after review
    const flashcardDiv = document.querySelector('.flashcard');

    // Create Exercise Done box
    const doneBox = document.createElement('div');
    doneBox.textContent = `Exercise Done! You had ${missedQuestions.length} review questions.`;
    doneBox.style.fontSize = "1.2em";
    doneBox.style.marginTop = "20px";
    doneBox.style.padding = "10px";
    doneBox.style.border = "1px solid #ccc";
    doneBox.style.borderRadius = "8px";
    doneBox.style.backgroundColor = "#e0f7fa";
    doneBox.style.color = "#00796b";
    
    flashcardDiv.appendChild(doneBox); // Append the message to the flashcard container
}
