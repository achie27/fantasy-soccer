export default {
  type: "object",
  properties: {
    team: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
  required: ["team"],
};
