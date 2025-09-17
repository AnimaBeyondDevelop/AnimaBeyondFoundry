// helpers/jsonHelper.js
export const jsonHelper = {
  name: 'json',
  fn: (context) => {
    try {
      return JSON.stringify(context);
    } catch (e) {
      console.error("Failed to stringify in {{json}} helper:", e);
      return "";
    }
  }
};