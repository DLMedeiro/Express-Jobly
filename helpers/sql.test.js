// Built from solution code

const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("works: 1 item", function () {
    const result = sqlForPartialUpdate(
        // Updating the value of f1
        { f1: "v1" },
            // dataToUpdate
        { f1: "f1", fF2: "f2" });
            // jsToSQL
    expect(result).toEqual({
      setCols: "\"f1\"=$1",
        // Updating the first column ($1)
        // Not understanding this part of the notation [\"f1\"]
      values: ["v1"],
        // New value for f1
    });
  });

  test("works: 2 items", function () {
    const result = sqlForPartialUpdate(
        { f1: "v1", jsF2: "v2" },
        { jsF2: "f2" });
    expect(result).toEqual({
      setCols: "\"f1\"=$1, \"f2\"=$2",
      values: ["v1", "v2"],
    });
  });
});