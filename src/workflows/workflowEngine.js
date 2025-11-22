const leadWorkflow = require("./leadWorkflow");
const bookingWorkflow = require("./bookingWorkflow");

exports.runWorkflow = async (intent, user, text) => {
  switch (intent) {
    case "greeting":
    case "general_query":
      return await leadWorkflow(user, text);

    case "book_service":
    case "service_request":
      return await bookingWorkflow(user, text);

    default:
      return null;
  }
};
