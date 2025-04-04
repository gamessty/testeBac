# Schema Configurators for Test Types

This document explains the schema configurators for test types, including examples of fields like "show correct answer after each question" and "questionNumber".

## Overview

Schema configurators are modular functions that create fields and standard options for each test type. Each function accepts its own parameters and returns the corresponding configuration.

## Example Fields

### Show Correct Answer After Each Question

This field is a boolean that determines whether the correct answer should be shown after each question.

```typescript
function showCorrectAnswerAfterEachQuestion(show: boolean): { showCorrectAnswer: boolean } {
    return { showCorrectAnswer: show };
}
```

### Question Number

This field is a number that represents the question number.

```typescript
function questionNumber(number: number): { questionNumber: number } {
    return { questionNumber: number };
}
```

### Time Limit

This field is a number that represents the time limit for the test in minutes.

```typescript
function timeLimit(minutes: number): { timeLimit: number } {
    return { timeLimit: minutes };
}
```

## Creating New Options

To create a new option, follow these steps:

1. Define a function that accepts the necessary parameters and returns the corresponding configuration.
2. Add the function to the `configurators.ts` file.
3. Update the `testTypes.json` file to include the new option in the appropriate test type.

### Example

Suppose you want to add a new option called "timeLimit" that sets a time limit for the test. You can create a function like this:

```typescript
function timeLimit(minutes: number): { timeLimit: number } {
    return { timeLimit: minutes };
}
```

Then, add the function to the `configurators.ts` file and update the `testTypes.json` file to include the new option.

## Conclusion

Schema configurators provide a flexible and modular way to create fields and standard options for test types. By following the steps outlined in this document, you can easily create new options and update existing ones.
