export function showCorrectAnswerAfterEachQuestion(show: boolean): { showCorrectAnswer: boolean } {
    return { showCorrectAnswer: show };
}

export function questionNumber(number: number): { questionNumber: number } {
    return { questionNumber: number };
}

export function timeLimit(minutes: number): { timeLimit: number } {
    return { timeLimit: minutes };
}

export function numberOfQuestions(count: number): { numberOfQuestions: number } {
    return { numberOfQuestions: count };
}

export function individualEditor(enabled: boolean): { individualEditor: boolean } {
    return { individualEditor: enabled };
}

/**
 * To create a new option, follow these steps:
 * 1. Define a function that accepts the necessary parameters and returns the corresponding configuration.
 * 2. Add the function to this file.
 * 3. Update the `testTypes.json` file to include the new option in the appropriate test type.
 */
