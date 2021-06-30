export default {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    country: {
      type: "string",
    },
    owner: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
    players: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
        },
        required: ["id"],
      },
    },
  },
  required: ["name", "country"],
};
