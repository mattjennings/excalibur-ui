interface CustomMatchers<R = unknown> {
  toBeInTheDocument: () => R
  toBeChecked: () => R
  toBeDisabled: () => R
  toBeEmptyDOMElement: () => R
  toBeEmpty: () => R
  toBeInTheDocument: () => R
  toBeInTheDOM: () => R
  toBeInvalid: () => R
  toBePartiallyChecked: () => R
  toBeRequired: () => R
  toBeVisible: () => R
  toContainElement: () => R
  toContainHTML: () => R
  toHaveAccessibleDescription: () => R
  toHaveAccessibleErrorMessage: () => R
  toHaveAccessibleName: () => R
  toHaveAttribute: () => R
  toHaveClass: () => R
  toHaveDescription: () => R
  toHaveDisplayValue: () => R
  toHaveErrorMessage: () => R
  toHaveFocus: () => R
  toHaveFormValues: () => R
  toHaveRole: () => R
  toHaveStyle: () => R
  toHaveTextContent: (text: string) => R
  toHaveValue: () => R
}

declare module 'vitest' {
  interface JestAssertion<T = any> extends CustomMatchers {}
}

export {}
