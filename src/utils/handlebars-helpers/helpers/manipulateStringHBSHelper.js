export const manipulateStringHBSHelper = {
  name: 'manipulateString',
  fn: (functionName, value) => {
    if (!functionName || typeof functionName !== 'string') {
      throw Error(
        `manipulateString handlebar helper: first parameter must be a valid functionName: ${functionName}`
      );
    }

    if (typeof value !== 'string') {
      return value;
    }

    try {
      return value[functionName]();
    } catch (e) {
      console.error(
        `manipulateString handlebar helper: first parameter must be a valid string function: ${functionName}`,
        e
      );

      return value;
    }
  }
};
