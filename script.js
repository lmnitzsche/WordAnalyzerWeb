document.addEventListener("DOMContentLoaded", function() {
    const inputWord = document.getElementById("input-word");
    const checkButton = document.getElementById("check-button");
    const suggestionList = document.getElementById("suggestion-list");
    const currentYearElement = document.getElementById("currentYear");
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;
    
    fetch('dictionary.txt')
        .then(response => response.text())
        .then(dictionaryData => {
            const dictionary = dictionaryData.split('\n').map(word => word.toLowerCase().trim());

            checkButton.addEventListener("click", function() {
                suggestionList.innerHTML = "";
                const userInput = inputWord.value.toLowerCase().trim();

                if(userInput === "") {
                    return;
                }

                const suggestions = spellCheck(userInput, dictionary);
                displaySuggestions(suggestions);
            });
        });

    function calculatePenalty(a, b) {
        if(a === b) {
            return 0;
        } else if((isVowel(a) && isVowel(b)) || (!isVowel(a) && !isVowel(b))) {
            return 1;
        } else {
            return 3;
        } // Gaps are calculated in 'calculateAlignmentPenalty'
    }

    function isVowel(char) {
        return 'aeiou'.indexOf(char) !== -1;
    }

    function spellCheck(userInput, dictionary) {
        const suggestions = [];
        for(const word of dictionary) {
            const minPenalty = calculateAlignmentPenalty(userInput, word);
            suggestions.push({word, penalty: minPenalty});
        }
        suggestions.sort((a, b) => a.penalty - b.penalty);
        return suggestions.slice(0, 10).map(item => item.word);
    }

    function calculateAlignmentPenalty(a, b) {
        const lengthFirst = a.length;
        const lengthSecond = b.length;
        const costArray = new Array(lengthFirst + 1).fill(null).map(() => new Array(lengthSecond + 1).fill(0));

        for(let i = 0; i <= lengthFirst; i++) {
            costArray[i][0] = i;
        }

        for(let j = 0; j <= lengthSecond; j++) {
            costArray[0][j] = j;
        }

        for(let i = 1; i <= lengthFirst; i++) {
            for(let j = 1; j <= lengthSecond; j++) {
                const cost = calculatePenalty(a[i - 1], b[j - 1]);
                costArray[i][j] = Math.min(
                    costArray[i - 1][j - 1] + cost,
                    costArray[i - 1][j] + 2, // Gap
                    costArray[i][j - 1] + 2 // Detectors
                );
            }
        }
        return costArray[lengthFirst][lengthSecond];
    }

    function displaySuggestions(suggestions) {
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement("li");
            suggestionItem.textContent = suggestion;
            suggestionList.appendChild(suggestionItem);
        });
    }
});