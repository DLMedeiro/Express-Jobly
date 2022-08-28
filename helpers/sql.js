const { BadRequestError } = require("../expressError");

// Function takes in req.body as dataToUpdate which is passed through the companies/:handle patch route, into the update function on the companies model.
// jsToSQL and the cols variable translate the numEmployees and logoUrl aliases into their equivalent SQL column titles.
// the cols variable also creates a new array mapping the existing keys to their equivalent variable number (used back in the update function)


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // console.log(`dataToUpdate = ${dataToUpdate}, jsToSql = ${jsToSql.numEmployees}`)
    // dataToUpdate = [object Object], jsToSql = num_employees
  const keys = Object.keys(dataToUpdate);
  // console.log(`keys = ${keys}`)
    // keys = name,numEmployees,logoUrl
  if (keys.length === 0) throw new BadRequestError("No data");

  
  const cols = keys.map((colName, idx) =>
  `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  );
    // console.log(`cols = ${cols}`)
      // cols = "name"=$1,"num_employees"=$2,"logo_url"=$3

    // console .log(`setCols = ${cols.join(", ")}`)
      // setCols = "name"=$1, "num_employees"=$2, "logo_url"=$3

    // console .log(`values = ${Object.values(dataToUpdate)}`)
      // values = Baker-Santos-Aranda,300,https://ww...
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


module.exports = { sqlForPartialUpdate};
