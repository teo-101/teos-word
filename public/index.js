const guideButton = document.getElementById('playGuide');
const rows = document.querySelectorAll("tr.lines");
const keys = document.querySelectorAll("#keyboardContainer td");

// Initialize an empty matrix array
const gameMatrix = [];

// Loop through each row
rows.forEach((row) => {
    // Create an array for the current row
    const rowArray = [];
    
    // Select all <td> elements within the current row
    const cells = row.querySelectorAll("td.letters");
    
    // Push each <td> element (or its content) into the row array
    cells.forEach((cell) => {
        rowArray.push(cell); // You could use cell.textContent if you want just the text
    });
    
    // Add the row array to the matrix
    gameMatrix.push(rowArray);
});

// Game Logic
let currentWord = '';
let word;
let numOfTries = 5;
let currentTry = 0;
let arrayOfTries = new Array(6);
let wordMatched;
let gameEnd = false;

function letterExist(letter, word) {
  for (let i = 0; i < word.length; i++) {
    if (letter === word[i]) {
      return true;
    }
  }
  return false;
}

function wordMatch(currentWord, setWord) {
  if (currentTry <= numOfTries) {
    wordMatched = true;
    for (let i = 0; i < word.length; i++) {
      if (currentWord[i] === setWord[i]) {
        // Add Correct Letter Class
      }
      else if (letterExist(currentWord[i], setWord)) {
        // Add Yellow Letter Class
        wordMatched = false;
      }
      else {
        // Add Wrong Letter Class
        wordMatched = false;
      }
    }

    if (wordMatched) {
      console.log("Correct");
      gameEnd = true;
      endGamePopup(wordMatched);
    }
    else {
      if (currentTry >= numOfTries) {
        console.log("Try again tommorow");
        gameEnd = true;
        endGamePopup(wordMatched);
      }
      currentTry++;
    }
  }
}

function updateGameLine(currentTry, currentWord, setWord) {
  console.log(gameMatrix);
  gameMatrix[currentTry].forEach((letter,index) => {
    letter.innerText = currentWord[index];
    if (currentWord[index] === setWord[index]) {
      // Add Correct Letter Class
      letter.classList.add('correctLetter');
      document.getElementById(`${currentWord[index]}`).classList.add('correctLetter');
      document.getElementById(`${currentWord[index]}`).classList.remove('correctLetterWrongPos');
    }
    else if (letterExist(currentWord[index], setWord)) {
      // Add Yellow Letter Class
      letter.classList.add('correctLetterWrongPos');
      document.getElementById(`${currentWord[index]}`).classList.add('correctLetterWrongPos');
    }
    else {
      // Add Wrong Letter Class
      letter.classList.add('incorrectLetter');
      document.getElementById(`${currentWord[index]}`).classList.add('incorrectLetter');
    }
  });
}

let currentWordIndex = -1;

document.addEventListener("keydown", (event) => {
  if (event.key.length === 1 && event.key.match(/[a-zA-Z]/) && gameEnd === false) {
    if (currentWordIndex < 4 && gameEnd === false) {
      currentWordIndex++;
      gameMatrix[currentTry][currentWordIndex].innerText = event.key.toUpperCase();
      currentWord += String(event.key.toUpperCase());
      console.log(currentWord);
    }
  }
  if (event.key === "Enter" && currentWordIndex === 4 && gameEnd === false) {
    arrayOfTries[currentTry] = currentWord;
    console.log(arrayOfTries);
    updateGameLine(currentTry, currentWord, word);
    wordMatch(currentWord, word);
    currentWordIndex = -1;
    currentWord = '';
  }
  if ((event.key === 'Backspace' || event.key === 'Delete' && gameEnd === false) && currentWordIndex >= 0) {
    gameMatrix[currentTry][currentWordIndex].innerText = '';
    currentWordIndex--;
    currentWord = currentWord.slice(0, -1);
    console.log(currentWord);
  }
});

// Fetch word from API
function getWord() {
  const length = 5;
  const numberOfWords = 1;

  fetch(`/api/getWords`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ numberOfWords: Number(numberOfWords), length: Number(length) })
  }).then(res => {
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return res.json();
  }).then(data => {
    console.log(data.words)
    word = data.words[0];
    word = word.toUpperCase();
    console.log(word);
  }).catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

function getWordDefinition(word) {
  return fetch(`/api/definition/${word}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(res => {
    if (!res.ok) {
      throw new Error('Network response was not ok');
    }
    return res.json();
  })
  .then(data => {
    const definition = data.definition[0].meanings[0].definitions[0].definition;
    console.log(definition);
    return definition; // Return the actual definition text here
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
    return false; // Return this if there's an error
  });
}

guideButton.addEventListener("click", (event) => {
  endGamePopup(true);
});

const endScreenContainer = document.getElementById('endScreenContainer');
const endTitle = document.getElementById('endTitle');
const endWord = document.getElementById('endWord');
const wordDefinition = document.getElementById('wordDefinition');
const contactAs = document.querySelectorAll('#contact a');
const notAffiliated = document.getElementById('notAffiliated');

async function endGamePopup(isWinner) {
  endWord.innerText = `" ${word} "`;

  try {
    const definition = await getWordDefinition(word); // Await the definition here
    if (definition)
      wordDefinition.innerText = definition; // Set the definition text once resolved
    else
    wordDefinition.innerHTML = `No definition found.<br><a target="_blank" href="https://www.google.com/search?q=${word}+definition">Search Online</a>`;
  } catch (error) {
    console.error(error);
    wordDefinition.innerHTML = `No definition found.<br><a target="_blank" href="https://www.google.com/search?q=${word}+definition">Search Online</a>`;
  }

  if (isWinner) {
    endTitle.innerText = 'Won';
  } else {
    endTitle.innerText = 'Lost';
  }
  setTimeout(() => {
    endScreenContainer.style.display = 'flex';
    notAffiliated.style.color = 'white';
    //notAffiliated.style.filter = 'brightness(1.5)';
    contactAs.forEach(link => {
      //link.style.filter = 'brightness(1.5)';
      link.style.color = 'white';
    });
  }, 400)
}
